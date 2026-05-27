#!/usr/bin/env python3
"""
PHD Literature Manager — 本地服务器 v2.0
- 静态文件服务 (http://localhost:8765)
- 联网搜索论文 (Semantic Scholar / arXiv)
- 查找并下载开放获取 PDF (Unpaywall / arXiv / Semantic Scholar)
- 本地 PDF 存储服务
- 批量下载队列（后台线程，多源 PDF 查找）
- PDF 文本提取（需要 pypdf，可选）

用法:  python server.py
       python server.py --port 8765
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import urllib.error
import json
import os
import sys
import re
import threading
import webbrowser
import time
import uuid
import logging
from pathlib import Path

# ─── 可选依赖：pypdf（PDF 文本提取） ──────────────────────────────────────────
try:
    from pypdf import PdfReader
    _PYPDF_AVAILABLE = True
except ImportError:
    try:
        from PyPDF2 import PdfReader          # 兼容旧版包名
        _PYPDF_AVAILABLE = True
    except ImportError:
        _PYPDF_AVAILABLE = False

# ─── 配置 ─────────────────────────────────────────────────────────────────────
PORT = 8765
PDF_DIR = Path("pdfs")
BASE_DIR = Path(__file__).parent.resolve()
UNPAYWALL_EMAIL = "phd.literature@researcher.edu"   # Unpaywall 要求提供邮箱（免费）

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("server")

# ─── 批量下载状态存储 ──────────────────────────────────────────────────────────
# _jobs: {job_id: {paper_id: status_dict}}
# 每个 status_dict 字段:
#   state        : "idle|finding|downloading|done|failed|no-source|skipped"
#   error        : str  — 失败原因
#   filename     : str  — 已保存文件名
#   size_kb      : int
#   pdf_url      : str  — 最终使用的下载链接
#   tried_sources: list — 尝试过的来源列表
_jobs: dict = {}
_jobs_lock = threading.Lock()


# ─── 帮助函数：生成安全文件名 ─────────────────────────────────────────────────
def safe_filename(paper_id: str) -> str:
    """将任意 paper_id 转换为合法文件名（.pdf 后缀）"""
    return re.sub(r"[^a-zA-Z0-9_\-]", "_", paper_id)[:80] + ".pdf"


# ─── 帮助函数：检查本地是否已存在该论文的 PDF ─────────────────────────────────
def local_pdf_exists(paper_id: str) -> str | None:
    """若本地已有对应 PDF 则返回文件名，否则返回 None"""
    filename = safe_filename(paper_id)
    filepath = BASE_DIR / PDF_DIR / filename
    if filepath.exists() and filepath.stat().st_size > 1000:
        return filename
    return None


# ─── 帮助函数：原始 JSON 获取 ────────────────────────────────────────────────
def fetch_json(url: str, timeout: int = 10):
    """GET 请求并解析 JSON；失败时返回 None"""
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "PHDLiteratureManager/2.0", "Accept": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode("utf-8"))
    except Exception as e:
        log.warning(f"fetch_json failed ({url}): {e}")
        return None


# ─── 多源 PDF 查找 ────────────────────────────────────────────────────────────
def find_pdf_url(paper: dict) -> tuple[str, list[str]]:
    """
    按优先级从多个来源查找可下载的 PDF URL。
    paper 字段: id, title, pdf_url, doi, arxiv_id
    返回: (pdf_url_or_empty, tried_sources_list)
    """
    tried = []

    # 来源 1：直接使用提供的 pdf_url
    if paper.get("pdf_url"):
        tried.append("provided_url")
        return paper["pdf_url"], tried

    # 来源 2：通过 arxiv_id 构造 arXiv PDF 链接
    if paper.get("arxiv_id"):
        tried.append("arxiv_id")
        return f"https://arxiv.org/pdf/{paper['arxiv_id']}.pdf", tried

    # 来源 3：通过 DOI 查询 Unpaywall
    if paper.get("doi"):
        tried.append("unpaywall")
        encoded_doi = urllib.parse.quote(paper["doi"], safe="")
        url = f"https://api.unpaywall.org/v2/{encoded_doi}?email={UNPAYWALL_EMAIL}"
        data = fetch_json(url, timeout=10)
        if data:
            best = data.get("best_oa_location") or {}
            pdf = best.get("url_for_pdf", "")
            if pdf:
                return pdf, tried

    # 来源 4：Semantic Scholar 标题搜索 openAccessPdf
    if paper.get("title"):
        tried.append("semantic_scholar_title")
        q = urllib.parse.quote(paper["title"])
        url = (
            f"https://api.semanticscholar.org/graph/v1/paper/search"
            f"?query={q}&fields=openAccessPdf,externalIds&limit=3"
        )
        data = fetch_json(url, timeout=12)
        if data:
            for hit in data.get("data", []):
                oa = hit.get("openAccessPdf") or {}
                if oa.get("url"):
                    return oa["url"], tried
                # 也尝试从 externalIds 里提取 arXiv
                ext = hit.get("externalIds") or {}
                if ext.get("ArXiv"):
                    return f"https://arxiv.org/pdf/{ext['ArXiv']}.pdf", tried

    return "", tried


# ─── 实际下载 PDF 到本地 ──────────────────────────────────────────────────────
def download_pdf(pdf_url: str, paper_id: str) -> dict:
    """
    从 pdf_url 下载 PDF 并保存到 pdfs/ 目录。
    返回 {'success', 'filename', 'size_kb', 'error'}
    """
    filename = safe_filename(paper_id)
    filepath = BASE_DIR / PDF_DIR / filename
    (BASE_DIR / PDF_DIR).mkdir(parents=True, exist_ok=True)

    try:
        req = urllib.request.Request(
            pdf_url,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; PHDLiteratureManager/2.0)",
                "Accept": "application/pdf,*/*",
            },
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()

        if len(data) < 1000:
            return {"success": False, "error": "下载文件过小，可能不是有效 PDF", "filename": "", "size_kb": 0}

        if not data.startswith(b"%PDF"):
            return {"success": False, "error": "URL 未返回 PDF 文件（可能需要登录）", "filename": "", "size_kb": 0}

        with open(filepath, "wb") as f:
            f.write(data)

        size_kb = len(data) // 1024
        log.info(f"已保存 {filename} ({size_kb} KB)")
        return {"success": True, "filename": filename, "size_kb": size_kb, "error": ""}

    except urllib.error.HTTPError as e:
        return {"success": False, "error": f"HTTP {e.code}: {e.reason}", "filename": "", "size_kb": 0}
    except urllib.error.URLError as e:
        return {"success": False, "error": f"网络错误: {e.reason}", "filename": "", "size_kb": 0}
    except Exception as e:
        return {"success": False, "error": str(e), "filename": "", "size_kb": 0}


# ─── 批量下载后台 Worker ──────────────────────────────────────────────────────
def batch_worker(job_id: str, papers: list):
    """
    在后台线程中逐一处理论文列表。
    papers: [{id, title, pdf_url, doi, arxiv_id}, ...]
    """
    log.info(f"批量任务 {job_id} 开始，共 {len(papers)} 篇")

    for paper in papers:
        pid = paper.get("id", str(uuid.uuid4()))

        # 读取当前状态（可能因 retry 被重置）
        with _jobs_lock:
            status = _jobs[job_id].get(pid)
            if status is None:
                continue
            # 只处理 idle 状态的条目
            if status["state"] != "idle":
                continue

        # 检查本地是否已有文件，跳过已下载的论文
        existing = local_pdf_exists(pid)
        if existing:
            log.info(f"[{job_id}] 已存在本地文件，跳过: {pid}")
            with _jobs_lock:
                _jobs[job_id][pid].update({
                    "state": "skipped",
                    "filename": existing,
                    "size_kb": (BASE_DIR / PDF_DIR / existing).stat().st_size // 1024,
                })
            time.sleep(0.7)
            continue

        # 阶段 1：查找 PDF 链接
        with _jobs_lock:
            _jobs[job_id][pid]["state"] = "finding"

        log.info(f"[{job_id}] 查找 PDF: {paper.get('title', pid)[:60]}")
        pdf_url, tried = find_pdf_url(paper)

        if not pdf_url:
            log.warning(f"[{job_id}] 未找到 PDF 来源: {pid}")
            with _jobs_lock:
                _jobs[job_id][pid].update({
                    "state": "no-source",
                    "tried_sources": tried,
                    "error": "未找到可下载的开放获取 PDF",
                })
            time.sleep(0.7)
            continue

        # 阶段 2：下载 PDF
        with _jobs_lock:
            _jobs[job_id][pid].update({
                "state": "downloading",
                "pdf_url": pdf_url,
                "tried_sources": tried,
            })

        log.info(f"[{job_id}] 下载中: {pdf_url[:80]}")
        result = download_pdf(pdf_url, pid)

        with _jobs_lock:
            if result["success"]:
                _jobs[job_id][pid].update({
                    "state": "done",
                    "filename": result["filename"],
                    "size_kb": result["size_kb"],
                    "error": "",
                })
            else:
                _jobs[job_id][pid].update({
                    "state": "failed",
                    "error": result["error"],
                    "filename": "",
                    "size_kb": 0,
                })

        # 每篇之间等待 0.7 秒，遵守频率限制
        time.sleep(0.7)

    log.info(f"批量任务 {job_id} 完成")


# ─── Request Handler ──────────────────────────────────────────────────────────
class Handler(http.server.SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def log_message(self, fmt, *args):
        # 只记录 API 请求，过滤静态文件噪音
        if "/api/" in (args[0] if args else ""):
            log.info(f"{self.client_address[0]}  {fmt % args}")

    # ── CORS headers ─────────────────────────────────────────────────────────
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith("/api/"):
            try:
                self.handle_api(parsed, body=None)
            except Exception as e:
                log.error(f"API error: {e}")
                self.json_error(500, str(e))
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith("/api/"):
            try:
                # 读取请求体
                length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(length) if length > 0 else b""
                self.handle_api(parsed, body=body)
            except Exception as e:
                log.error(f"API POST error: {e}")
                self.json_error(500, str(e))
        else:
            self.json_error(404, "not found")

    # ── Router ────────────────────────────────────────────────────────────────
    def handle_api(self, parsed, body):
        params = {k: v[0] for k, v in urllib.parse.parse_qs(parsed.query).items()}
        path = parsed.path

        # ── 原有端点 ──────────────────────────────────────────────────────────
        if path == "/api/ping":
            self.json_ok({"status": "ok", "version": "2.0", "pypdf": _PYPDF_AVAILABLE})

        elif path == "/api/search":
            q = params.get("q", "").strip()
            limit = min(int(params.get("limit", "10")), 20)
            if not q:
                self.json_error(400, "missing param: q")
            else:
                self.api_search(q, limit)

        elif path == "/api/unpaywall":
            doi = params.get("doi", "").strip()
            if not doi:
                self.json_error(400, "missing param: doi")
            else:
                self.api_unpaywall(doi)

        elif path == "/api/arxiv":
            arxiv_id = params.get("id", "").strip()
            if not arxiv_id:
                self.json_error(400, "missing param: id")
            else:
                self.api_arxiv(arxiv_id)

        elif path == "/api/download":
            url = params.get("url", "").strip()
            pid = params.get("id", "paper").strip()
            if not url:
                self.json_error(400, "missing param: url")
            else:
                self.api_download(url, pid)

        elif path == "/api/pdfs":
            self.api_list_pdfs()

        # ── 批量下载端点 ──────────────────────────────────────────────────────
        elif path == "/api/batch-start":
            self.api_batch_start(body)

        elif path == "/api/batch-status":
            job_id = params.get("job", "").strip()
            if not job_id:
                self.json_error(400, "missing param: job")
            else:
                self.api_batch_status(job_id)

        elif path == "/api/batch-retry":
            job_id = params.get("job", "").strip()
            paper_id = params.get("id", "").strip()
            if not job_id or not paper_id:
                self.json_error(400, "missing params: job, id")
            else:
                self.api_batch_retry(job_id, paper_id)

        elif path == "/api/batch-retry-all":
            job_id = params.get("job", "").strip()
            if not job_id:
                self.json_error(400, "missing param: job")
            else:
                self.api_batch_retry_all(job_id)

        # ── PDF 文本提取端点 ──────────────────────────────────────────────────
        elif path == "/api/extract":
            paper_id = params.get("id", "").strip()
            if not paper_id:
                self.json_error(400, "missing param: id")
            else:
                self.api_extract(paper_id)

        else:
            self.json_error(404, "unknown API endpoint")

    # ── API: search papers (Semantic Scholar) ─────────────────────────────────
    def api_search(self, query, limit):
        fields = "title,authors,year,venue,openAccessPdf,externalIds,abstract,tldr,citationCount"
        url = (
            "https://api.semanticscholar.org/graph/v1/paper/search"
            f"?query={urllib.parse.quote(query)}"
            f"&fields={fields}"
            f"&limit={limit}"
        )
        data = self._fetch_json(url, timeout=12)
        if data is None:
            self.json_error(502, "Semantic Scholar API unavailable")
            return

        # 标准化输出格式
        results = []
        for p in data.get("data", []):
            ext = p.get("externalIds") or {}
            oa  = p.get("openAccessPdf") or {}
            pdf_url = oa.get("url", "")

            # arXiv ID → 构造 PDF 链接
            arxiv_id = ext.get("ArXiv", "")
            if not pdf_url and arxiv_id:
                pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"

            results.append({
                "s2id":      p.get("paperId", ""),
                "title":     p.get("title", ""),
                "authors":   [a.get("name", "") for a in (p.get("authors") or [])],
                "year":      p.get("year"),
                "venue":     p.get("venue", ""),
                "abstract":  p.get("abstract", ""),
                "tldr":      (p.get("tldr") or {}).get("text", ""),
                "doi":       ext.get("DOI", ""),
                "arxiv_id":  arxiv_id,
                "pdf_url":   pdf_url,
                "oa_status": oa.get("status", ""),
                "citations": p.get("citationCount", 0),
                "url":       f"https://www.semanticscholar.org/paper/{p.get('paperId', '')}",
            })

        self.json_ok({"total": data.get("total", 0), "results": results})

    # ── API: Unpaywall (DOI → open-access PDF) ────────────────────────────────
    def api_unpaywall(self, doi):
        url = f"https://api.unpaywall.org/v2/{urllib.parse.quote(doi, safe='')}?email={UNPAYWALL_EMAIL}"
        data = self._fetch_json(url, timeout=10)
        if data is None:
            self.json_ok({"is_oa": False, "pdf_url": "", "oa_url": ""})
            return

        best = data.get("best_oa_location") or {}
        self.json_ok({
            "is_oa":     data.get("is_oa", False),
            "pdf_url":   best.get("url_for_pdf", "") or "",
            "oa_url":    best.get("url", "") or "",
            "host_type": best.get("host_type", ""),
            "version":   best.get("version", ""),
            "title":     data.get("title", ""),
            "year":      data.get("year"),
        })

    # ── API: arXiv metadata ───────────────────────────────────────────────────
    def api_arxiv(self, arxiv_id):
        # 清理 ID 前缀
        arxiv_id = re.sub(r"^arxiv:", "", arxiv_id, flags=re.I).strip()
        url = f"http://export.arxiv.org/api/query?id_list={urllib.parse.quote(arxiv_id)}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "PHDLiteratureManager/2.0"})
            with urllib.request.urlopen(req, timeout=10) as r:
                xml = r.read().decode("utf-8")
        except Exception as e:
            self.json_error(502, f"arXiv API error: {e}")
            return

        # 简单解析 Atom XML
        def tag(t, s):
            m = re.search(rf"<{t}[^>]*>(.*?)</{t}>", s, re.S)
            return m.group(1).strip() if m else ""

        title    = re.sub(r"\s+", " ", tag("title", xml).split("\n", 1)[-1])
        summary  = re.sub(r"\s+", " ", tag("summary", xml))
        authors  = re.findall(r"<name>(.*?)</name>", xml)
        pub_date = tag("published", xml)[:10]
        pdf_link = re.search(r'href="(https://arxiv\.org/pdf/[^"]+)"', xml)
        pdf_url  = pdf_link.group(1) if pdf_link else f"https://arxiv.org/pdf/{arxiv_id}.pdf"

        self.json_ok({
            "arxiv_id": arxiv_id,
            "title":    title,
            "authors":  authors,
            "abstract": summary,
            "pub_date": pub_date,
            "pdf_url":  pdf_url,
            "url":      f"https://arxiv.org/abs/{arxiv_id}",
        })

    # ── API: single PDF download ──────────────────────────────────────────────
    def api_download(self, url, paper_id):
        result = download_pdf(url, paper_id)
        if result["success"]:
            self.json_ok({
                "success":  True,
                "filename": result["filename"],
                "url_path": f"/pdfs/{result['filename']}",
                "size_kb":  result["size_kb"],
            })
        else:
            self.json_error(502, result["error"])

    # ── API: list local PDFs ──────────────────────────────────────────────────
    def api_list_pdfs(self):
        pdf_path = BASE_DIR / PDF_DIR
        if not pdf_path.exists():
            self.json_ok({"pdfs": []})
            return
        files = [
            {
                "filename": f.name,
                "url_path": f"/pdfs/{f.name}",
                "size_kb":  f.stat().st_size // 1024,
            }
            for f in sorted(pdf_path.glob("*.pdf"))
        ]
        self.json_ok({"pdfs": files})

    # ── API: batch-start ──────────────────────────────────────────────────────
    def api_batch_start(self, body: bytes):
        """
        POST /api/batch-start
        请求体: JSON 数组 [{id, title, pdf_url, doi, arxiv_id}, ...]
        返回: {job_id}
        """
        try:
            papers = json.loads(body.decode("utf-8"))
            if not isinstance(papers, list):
                raise ValueError("请求体必须是 JSON 数组")
        except Exception as e:
            self.json_error(400, f"JSON 解析失败: {e}")
            return

        job_id = str(uuid.uuid4())

        # 初始化每篇论文的状态为 idle
        statuses = {}
        for paper in papers:
            pid = paper.get("id", str(uuid.uuid4()))
            statuses[pid] = {
                "state":         "idle",
                "error":         "",
                "filename":      "",
                "size_kb":       0,
                "pdf_url":       paper.get("pdf_url", ""),
                "tried_sources": [],
            }

        with _jobs_lock:
            _jobs[job_id] = statuses

        # 启动后台工作线程
        t = threading.Thread(
            target=batch_worker,
            args=(job_id, papers),
            daemon=True,
            name=f"batch-{job_id[:8]}",
        )
        t.start()
        log.info(f"批量任务已创建: {job_id}，共 {len(papers)} 篇")
        self.json_ok({"job_id": job_id, "total": len(papers)})

    # ── API: batch-status ─────────────────────────────────────────────────────
    def api_batch_status(self, job_id: str):
        """
        GET /api/batch-status?job=JOB_ID
        返回该任务所有论文的状态字典
        """
        with _jobs_lock:
            job = _jobs.get(job_id)

        if job is None:
            self.json_error(404, f"任务不存在: {job_id}")
            return

        # 计算汇总统计
        states = [s["state"] for s in job.values()]
        summary = {s: states.count(s) for s in set(states)}

        self.json_ok({
            "job_id":  job_id,
            "summary": summary,
            "total":   len(job),
            "papers":  dict(job),   # 深拷贝由 json.dumps 处理，无需额外操作
        })

    # ── API: batch-retry (单篇重试) ───────────────────────────────────────────
    def api_batch_retry(self, job_id: str, paper_id: str):
        """
        GET /api/batch-retry?job=JOB_ID&id=PAPER_ID
        将某篇失败的论文重置为 idle，并重新提交到工作线程
        """
        with _jobs_lock:
            job = _jobs.get(job_id)
            if job is None:
                self.json_error(404, f"任务不存在: {job_id}")
                return
            status = job.get(paper_id)
            if status is None:
                self.json_error(404, f"论文不存在: {paper_id}")
                return
            if status["state"] not in ("failed", "no-source"):
                self.json_error(400, f"只能重试 failed/no-source 状态的论文，当前: {status['state']}")
                return
            # 重置为 idle
            status.update({
                "state":         "idle",
                "error":         "",
                "filename":      "",
                "size_kb":       0,
                "tried_sources": [],
            })

        # 构造最小化的 paper 信息，供 worker 使用
        paper_stub = {
            "id":       paper_id,
            "pdf_url":  status.get("pdf_url", ""),
            "title":    "",
            "doi":      "",
            "arxiv_id": "",
        }

        t = threading.Thread(
            target=batch_worker,
            args=(job_id, [paper_stub]),
            daemon=True,
            name=f"retry-{job_id[:8]}-{paper_id[:8]}",
        )
        t.start()
        self.json_ok({"ok": True, "retrying": paper_id})

    # ── API: batch-retry-all (全部重试) ──────────────────────────────────────
    def api_batch_retry_all(self, job_id: str):
        """
        GET /api/batch-retry-all?job=JOB_ID
        将该任务中所有 failed/no-source 状态的论文重置并重新下载
        """
        with _jobs_lock:
            job = _jobs.get(job_id)
            if job is None:
                self.json_error(404, f"任务不存在: {job_id}")
                return

            retry_papers = []
            for pid, status in job.items():
                if status["state"] in ("failed", "no-source"):
                    retry_papers.append({
                        "id":       pid,
                        "pdf_url":  status.get("pdf_url", ""),
                        "title":    "",
                        "doi":      "",
                        "arxiv_id": "",
                    })
                    status.update({
                        "state":         "idle",
                        "error":         "",
                        "filename":      "",
                        "size_kb":       0,
                        "tried_sources": [],
                    })

        if not retry_papers:
            self.json_ok({"ok": True, "retrying": 0, "message": "没有需要重试的论文"})
            return

        t = threading.Thread(
            target=batch_worker,
            args=(job_id, retry_papers),
            daemon=True,
            name=f"retry-all-{job_id[:8]}",
        )
        t.start()
        log.info(f"重试任务 {job_id}，共 {len(retry_papers)} 篇")
        self.json_ok({"ok": True, "retrying": len(retry_papers)})

    # ── API: extract PDF text ─────────────────────────────────────────────────
    def api_extract(self, paper_id: str):
        """
        GET /api/extract?id=PAPER_ID
        提取本地 PDF 前 3 页文本。
        若 pypdf 未安装，返回 {available: false}。
        若文件不存在，返回 404。
        """
        if not _PYPDF_AVAILABLE:
            self.json_ok({"available": False, "text": "", "words": 0,
                          "message": "pypdf 未安装，请运行: pip install pypdf"})
            return

        filename = safe_filename(paper_id)
        filepath = BASE_DIR / PDF_DIR / filename
        if not filepath.exists():
            self.json_error(404, f"本地文件不存在: {filename}")
            return

        try:
            reader = PdfReader(str(filepath))
            pages_to_read = min(3, len(reader.pages))
            text_parts = []
            for i in range(pages_to_read):
                page_text = reader.pages[i].extract_text() or ""
                text_parts.append(page_text)
            full_text = "\n\n".join(text_parts).strip()
            word_count = len(full_text.split())
            self.json_ok({
                "available":    True,
                "text":         full_text,
                "words":        word_count,
                "pages_read":   pages_to_read,
                "total_pages":  len(reader.pages),
                "filename":     filename,
            })
        except Exception as e:
            self.json_error(500, f"PDF 文本提取失败: {e}")

    # ── Helpers ───────────────────────────────────────────────────────────────
    def _fetch_json(self, url, timeout=10):
        """Handler 实例方法版本的 fetch_json（内部调用模块级函数）"""
        return fetch_json(url, timeout)

    def json_ok(self, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def json_error(self, code, msg):
        body = json.dumps({"error": msg}, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(body)


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    os.chdir(BASE_DIR)
    (BASE_DIR / PDF_DIR).mkdir(parents=True, exist_ok=True)

    # 解析端口参数
    port = PORT
    for i, arg in enumerate(sys.argv[1:]):
        if arg in ("--port", "-p") and i + 1 < len(sys.argv) - 1:
            port = int(sys.argv[i + 2])
        elif arg.isdigit():
            port = int(arg)

    # 使用 ThreadingTCPServer，允许轮询请求与下载并发进行
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("", port), Handler) as httpd:
        url = f"http://localhost:{port}"
        print(f"\n  ╔══════════════════════════════════════════════╗")
        print(f"  ║  PHD Literature Manager — 本地服务器 v2.0     ║")
        print(f"  ║  地址: {url:<38}║")
        print(f"  ║  PDF存储: {str(BASE_DIR / PDF_DIR):<36}║")
        print(f"  ║  pypdf: {'已安装 ✓' if _PYPDF_AVAILABLE else '未安装 (文本提取不可用)':<36}║")
        print(f"  ║  停止: Ctrl+C                                ║")
        print(f"  ╚══════════════════════════════════════════════╝\n")
        # 延迟 0.8s 打开浏览器，确保服务器已就绪
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n  服务器已停止。\n")


if __name__ == "__main__":
    main()
