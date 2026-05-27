#!/usr/bin/env python3
"""
PHD Literature Manager — 本地服务器
- 静态文件服务 (http://localhost:8765)
- 联网搜索论文 (Semantic Scholar / arXiv)
- 查找并下载开放获取 PDF (Unpaywall / arXiv)
- 本地 PDF 存储服务

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
import logging
from pathlib import Path

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
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith("/api/"):
            try:
                self.handle_api(parsed)
            except Exception as e:
                log.error(f"API error: {e}")
                self.json_error(500, str(e))
        else:
            super().do_GET()

    # ── Router ────────────────────────────────────────────────────────────────
    def handle_api(self, parsed):
        params = {k: v[0] for k, v in urllib.parse.parse_qs(parsed.query).items()}
        path = parsed.path

        if path == "/api/ping":
            self.json_ok({"status": "ok", "version": "1.0"})

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
            url  = params.get("url", "").strip()
            pid  = params.get("id", "paper").strip()
            if not url:
                self.json_error(400, "missing param: url")
            else:
                self.api_download(url, pid)

        elif path == "/api/pdfs":
            self.api_list_pdfs()

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
        data = self.fetch_json(url, timeout=12)
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
                "s2id":        p.get("paperId", ""),
                "title":       p.get("title", ""),
                "authors":     [a.get("name", "") for a in (p.get("authors") or [])],
                "year":        p.get("year"),
                "venue":       p.get("venue", ""),
                "abstract":    p.get("abstract", ""),
                "tldr":        (p.get("tldr") or {}).get("text", ""),
                "doi":         ext.get("DOI", ""),
                "arxiv_id":    arxiv_id,
                "pdf_url":     pdf_url,
                "oa_status":   oa.get("status", ""),
                "citations":   p.get("citationCount", 0),
                "url":         f"https://www.semanticscholar.org/paper/{p.get('paperId','')}",
            })

        self.json_ok({"total": data.get("total", 0), "results": results})

    # ── API: Unpaywall (DOI → open-access PDF) ────────────────────────────────
    def api_unpaywall(self, doi):
        url = f"https://api.unpaywall.org/v2/{urllib.parse.quote(doi, safe='')}?email={UNPAYWALL_EMAIL}"
        data = self.fetch_json(url, timeout=10)
        if data is None:
            self.json_ok({"is_oa": False, "pdf_url": "", "oa_url": ""})
            return

        best = data.get("best_oa_location") or {}
        self.json_ok({
            "is_oa":    data.get("is_oa", False),
            "pdf_url":  best.get("url_for_pdf", "") or "",
            "oa_url":   best.get("url", "") or "",
            "host_type": best.get("host_type", ""),
            "version":  best.get("version", ""),
            "title":    data.get("title", ""),
            "year":     data.get("year"),
        })

    # ── API: arXiv metadata ───────────────────────────────────────────────────
    def api_arxiv(self, arxiv_id):
        # 清理 ID
        arxiv_id = re.sub(r"^arxiv:", "", arxiv_id, flags=re.I).strip()
        url = f"http://export.arxiv.org/api/query?id_list={urllib.parse.quote(arxiv_id)}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "PHDLiteratureManager/1.0"})
            with urllib.request.urlopen(req, timeout=10) as r:
                xml = r.read().decode("utf-8")
        except Exception as e:
            self.json_error(502, f"arXiv API error: {e}")
            return

        # 简单解析 Atom XML
        def tag(t, s):
            m = re.search(rf"<{t}[^>]*>(.*?)</{t}>", s, re.S)
            return m.group(1).strip() if m else ""

        title   = re.sub(r"\s+", " ", tag("title", xml).split("\n", 1)[-1])
        summary = re.sub(r"\s+", " ", tag("summary", xml))
        authors = re.findall(r"<name>(.*?)</name>", xml)
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

    # ── API: download PDF ─────────────────────────────────────────────────────
    def api_download(self, url, paper_id):
        # 安全文件名
        safe_id = re.sub(r"[^a-zA-Z0-9_\-]", "_", paper_id)[:80]
        filename = f"{safe_id}.pdf"
        filepath = BASE_DIR / PDF_DIR / filename

        PDF_DIR.mkdir(parents=True, exist_ok=True)

        log.info(f"Downloading PDF: {url} → pdfs/{filename}")
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (compatible; PHDLiteratureManager/1.0)",
                    "Accept": "application/pdf,*/*",
                }
            )
            with urllib.request.urlopen(req, timeout=60) as r:
                content_type = r.headers.get("Content-Type", "")
                data = r.read()

            if len(data) < 1000:
                self.json_error(502, "Downloaded file too small — may not be a valid PDF")
                return

            # 验证是否为 PDF
            if not data.startswith(b"%PDF"):
                # 可能是 HTML 跳转页，记录前 200 字节用于调试
                log.warning(f"Not a PDF: {data[:200]}")
                self.json_error(502, "URL did not return a PDF file (may require login)")
                return

            with open(filepath, "wb") as f:
                f.write(data)

            size_kb = len(data) // 1024
            log.info(f"Saved {filename} ({size_kb} KB)")
            self.json_ok({
                "success":  True,
                "filename": filename,
                "url_path": f"/pdfs/{filename}",
                "size_kb":  size_kb,
            })

        except urllib.error.HTTPError as e:
            self.json_error(502, f"HTTP {e.code}: {e.reason}")
        except urllib.error.URLError as e:
            self.json_error(502, f"Network error: {e.reason}")
        except Exception as e:
            self.json_error(500, str(e))

    # ── API: list local PDFs ──────────────────────────────────────────────────
    def api_list_pdfs(self):
        pdf_path = BASE_DIR / PDF_DIR
        if not pdf_path.exists():
            self.json_ok({"pdfs": []})
            return
        files = [
            {"filename": f.name, "url_path": f"/pdfs/{f.name}", "size_kb": f.stat().st_size // 1024}
            for f in sorted(pdf_path.glob("*.pdf"))
        ]
        self.json_ok({"pdfs": files})

    # ── Helpers ───────────────────────────────────────────────────────────────
    def fetch_json(self, url, timeout=10):
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": "PHDLiteratureManager/1.0", "Accept": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:
            log.warning(f"fetch_json failed ({url}): {e}")
            return None

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
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(body)


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    os.chdir(BASE_DIR)
    PDF_DIR.mkdir(exist_ok=True)

    # 解析端口参数
    port = PORT
    for i, arg in enumerate(sys.argv[1:]):
        if arg in ("--port", "-p") and i + 1 < len(sys.argv) - 1:
            port = int(sys.argv[i + 2])
        elif arg.isdigit():
            port = int(arg)

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), Handler) as httpd:
        url = f"http://localhost:{port}"
        print(f"\n  ╔══════════════════════════════════════════════╗")
        print(f"  ║  PHD Literature Manager — 本地服务器          ║")
        print(f"  ║  地址: {url:<38}║")
        print(f"  ║  PDF存储: {str(BASE_DIR / PDF_DIR):<36}║")
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
