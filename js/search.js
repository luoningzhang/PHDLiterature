/* ============================================================
   联网搜索 & PDF 管理模块
   依赖: data.js, app.js 已加载
   ============================================================ */

const API_BASE = "http://localhost:8765";
let serverOnline = false;

// ─── 服务器检测 ───────────────────────────────────────────────────────────────
async function checkServer() {
  try {
    const r = await fetch(`${API_BASE}/api/ping`, { signal: AbortSignal.timeout(2000) });
    serverOnline = r.ok;
  } catch {
    serverOnline = false;
  }
  updateServerBadge();
  return serverOnline;
}

function updateServerBadge() {
  const badge = document.getElementById("server-badge");
  if (!badge) return;
  if (serverOnline) {
    badge.title = "服务器在线 — 可联网搜索和下载PDF";
    badge.className = "server-badge online";
    badge.innerHTML = `<span class="dot"></span>在线`;
  } else {
    badge.title = "服务器离线 — 请运行 python server.py";
    badge.className = "server-badge offline";
    badge.innerHTML = `<span class="dot"></span>离线`;
  }
}

function requireServer() {
  if (!serverOnline) {
    showToast("请先运行：python server.py", "warning");
    showOfflineNotice();
    return false;
  }
  return true;
}

function showOfflineNotice() {
  const overlay = document.getElementById("search-overlay");
  overlay.innerHTML = `
<div class="search-modal" onclick="event.stopPropagation()">
  <div class="search-modal-header">
    <h2>启动本地服务器</h2>
    <button class="icon-btn close-btn" onclick="closeSearch()">×</button>
  </div>
  <div class="offline-notice">
    <div class="offline-icon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5">
        <path d="M9.172 9.172a4 4 0 015.656 0"/><circle cx="12" cy="17" r="1"/>
        <path d="M6.343 6.343a8 8 0 0111.314 0"/><path d="M3.515 3.515A12 12 0 0120.485 20.485"/>
        <line x1="2" y1="2" x2="22" y2="22" stroke="#EF4444"/>
      </svg>
    </div>
    <p>联网搜索和PDF下载功能需要本地服务器支持</p>
    <div class="offline-steps">
      <div class="step"><span>1</span><code>cd ${window.location.pathname.replace(/\/[^/]*$/, "").replace("/","") || "PHDLiterature"}</code></div>
      <div class="step"><span>2</span><code>python server.py</code></div>
      <div class="step"><span>3</span>浏览器会自动打开 <code>http://localhost:8765</code></div>
    </div>
    <p class="offline-note">需要 Python 3.6+，无需安装额外依赖库</p>
    <button class="action-btn primary" onclick="closeSearch();checkServer()">我已启动，重新检测</button>
  </div>
</div>`;
  overlay.classList.add("visible");
}

// ─── 搜索弹窗 ─────────────────────────────────────────────────────────────────
let searchResults = [];

async function openSearch() {
  await checkServer();
  if (!serverOnline) { showOfflineNotice(); return; }

  document.getElementById("search-overlay").innerHTML = `
<div class="search-modal" onclick="event.stopPropagation()">
  <div class="search-modal-header">
    <h2>联网搜索论文</h2>
    <span class="search-source-tag">via Semantic Scholar</span>
    <button class="icon-btn close-btn" onclick="closeSearch()">×</button>
  </div>
  <div class="search-input-row">
    <div class="search-field">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input id="online-search-input" type="text" placeholder="输入论文标题、关键词、作者名…"
             onkeydown="if(event.key==='Enter')doSearch()">
    </div>
    <select id="search-limit">
      <option value="8">8条</option>
      <option value="15" selected>15条</option>
      <option value="20">20条</option>
    </select>
    <button class="action-btn primary" onclick="doSearch()">搜索</button>
  </div>
  <div class="search-quick-tags">
    ${["emotion appraisal LLM", "generative agents NPC", "role-playing language model",
       "affective computing decision", "interactive narrative drama"].map(q =>
      `<button class="quick-tag" onclick="fillAndSearch('${q}')">${q}</button>`).join("")}
  </div>
  <div id="search-results-area" class="search-results-area">
    <div class="search-hint">输入关键词搜索 Semantic Scholar 上的论文<br>支持直接搜索 arXiv ID（如：2304.03442）</div>
  </div>
</div>`;

  const overlay = document.getElementById("search-overlay");
  overlay.classList.add("visible");
  setTimeout(() => document.getElementById("online-search-input")?.focus(), 100);
}

function closeSearch() {
  document.getElementById("search-overlay").classList.remove("visible");
}

function fillAndSearch(q) {
  const inp = document.getElementById("online-search-input");
  if (inp) { inp.value = q; doSearch(); }
}

async function doSearch() {
  if (!serverOnline && !await checkServer()) { requireServer(); return; }
  const q = document.getElementById("online-search-input")?.value.trim();
  if (!q) return;
  const limit = document.getElementById("search-limit")?.value || 15;
  const area = document.getElementById("search-results-area");
  area.innerHTML = `<div class="search-loading"><div class="spinner"></div><p>正在搜索 Semantic Scholar…</p></div>`;

  try {
    const r = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}&limit=${limit}`);
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "搜索失败");
    searchResults = data.results || [];
    renderSearchResults(data.total || 0);
  } catch (e) {
    area.innerHTML = `<div class="search-error"><p>搜索失败：${e.message}</p><button onclick="doSearch()">重试</button></div>`;
  }
}

function renderSearchResults(total) {
  const area = document.getElementById("search-results-area");
  if (!searchResults.length) {
    area.innerHTML = `<div class="search-hint">未找到相关论文，请换个关键词</div>`;
    return;
  }
  const existingIds = new Set(State.papers.map(p => p.id));
  const existingTitles = new Set(State.papers.map(p => p.title.toLowerCase()));

  area.innerHTML = `
<div class="results-header">找到约 ${total.toLocaleString()} 篇 · 显示前 ${searchResults.length} 篇</div>
<div class="results-list">
${searchResults.map((r, i) => {
  const alreadyHave = existingTitles.has(r.title.toLowerCase());
  const hasPdf = !!r.pdf_url;
  return `
<div class="result-card ${alreadyHave ? 'already-added' : ''}">
  <div class="result-header">
    <div class="result-meta">
      ${r.year ? `<span class="year-tag">${r.year}</span>` : ""}
      ${r.venue ? `<span class="venue-small">${r.venue}</span>` : ""}
      ${r.citations > 0 ? `<span class="cite-count" title="被引次数">引用 ${r.citations}</span>` : ""}
      ${hasPdf ? `<span class="pdf-badge oa">PDF可获取</span>` : `<span class="pdf-badge no">无开放PDF</span>`}
      ${alreadyHave ? `<span class="pdf-badge added">已收录</span>` : ""}
    </div>
    <div class="result-actions">
      ${hasPdf ? `<button class="icon-btn" onclick="quickDownload(${i})" title="下载PDF">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>` : ""}
      <a class="icon-btn" href="${r.url}" target="_blank" title="在Semantic Scholar查看">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>
      ${!alreadyHave ? `<button class="action-btn primary sm" onclick="addFromResult(${i})">添加到数据库</button>` : `<span class="action-btn secondary sm" style="cursor:default">已收录</span>`}
    </div>
  </div>
  <h4 class="result-title">${escHtml(r.title)}</h4>
  <div class="result-authors">${(r.authors || []).slice(0, 5).map(a => escHtml(a)).join("，")}${r.authors?.length > 5 ? " 等" : ""}</div>
  ${(r.tldr || r.abstract) ? `<p class="result-abstract">${escHtml(r.tldr || r.abstract.slice(0, 220) + (r.abstract.length > 220 ? "…" : ""))}</p>` : ""}
  ${r.doi ? `<div class="result-ids">DOI: ${r.doi}${r.arxiv_id ? ` · arXiv: ${r.arxiv_id}` : ""}</div>` : (r.arxiv_id ? `<div class="result-ids">arXiv: ${r.arxiv_id}</div>` : "")}
</div>`;
}).join("")}
</div>`;
}

// ─── 从搜索结果添加论文 ───────────────────────────────────────────────────────
function addFromResult(idx) {
  const r = searchResults[idx];
  if (!r) return;

  const id = r.arxiv_id
    ? `arxiv-${r.arxiv_id.replace(/\./g, "-")}`
    : `s2-${r.s2id.slice(0, 12)}`;

  if (State.papers.find(p => p.id === id)) {
    showToast("该论文已在数据库中", "warning");
    return;
  }

  const paper = {
    id,
    cat: "llm",        // 用户可在详情页修改
    title: r.title,
    titleZh: "",
    year: r.year || new Date().getFullYear(),
    authors: r.authors || [],
    venue: r.venue || "",
    venueType: r.arxiv_id ? "arxiv" : "conference",
    doi: r.doi || "",
    url: r.url || "",
    arxivId: r.arxiv_id || "",
    pdfUrl: r.pdf_url || "",
    localPdf: "",
    abstract: r.abstract || "",
    abstractZh: "",
    descZh: r.tldr || "",
    limitZh: "",
    keywords: [],
    contributions: [],
    methodology: "",
    stars: 3,
    tags: r.arxiv_id ? ["arXiv"] : [],
    related: [],
    s2id: r.s2id || "",
    bibtex: genBibtex(r),
  };

  State.papers.push(paper);
  savePapers(State.papers);
  renderAll();
  showToast(`已添加：${r.title.slice(0, 40)}…`);

  // 更新搜索结果卡片状态
  const area = document.getElementById("search-results-area");
  if (area) {
    const cards = area.querySelectorAll(".result-card");
    if (cards[idx]) {
      cards[idx].classList.add("already-added");
      const btn = cards[idx].querySelector(".action-btn.primary");
      if (btn) { btn.textContent = "已收录"; btn.className = "action-btn secondary sm"; btn.style.cursor = "default"; btn.onclick = null; }
    }
  }
}

// ─── 快速下载（搜索结果中）────────────────────────────────────────────────────
async function quickDownload(idx) {
  const r = searchResults[idx];
  if (!r || !r.pdf_url) return;
  if (!await checkServer()) { requireServer(); return; }
  const pid = r.arxiv_id ? `arxiv-${r.arxiv_id.replace(/\./g, "-")}` : `s2-${r.s2id.slice(0, 12)}`;
  await downloadPdf(pid, r.pdf_url, r.title);
}

// ─── 下载 PDF ─────────────────────────────────────────────────────────────────
async function downloadPdf(paperId, url, title) {
  if (!await checkServer()) { requireServer(); return; }
  if (!url) { showToast("无可用PDF链接", "warning"); return; }

  showToast("正在下载PDF…");
  try {
    const r = await fetch(
      `${API_BASE}/api/download?url=${encodeURIComponent(url)}&id=${encodeURIComponent(paperId)}`
    );
    const data = await r.json();
    if (!r.ok || !data.success) throw new Error(data.error || "下载失败");

    // 更新论文记录中的本地路径
    const paper = State.papers.find(p => p.id === paperId);
    if (paper) {
      paper.localPdf = data.url_path;
      if (!paper.pdfUrl) paper.pdfUrl = url;
      savePapers(State.papers);
      renderAll();
      if (State.activePaperId === paperId) openDetail(paperId);
    }

    showToast(`PDF已保存 (${data.size_kb} KB)`);
  } catch (e) {
    showToast(`下载失败：${e.message}`, "error");
  }
}

// ─── 查找 PDF（针对已有论文）────────────────────────────────────────────────────
async function findPdfForPaper(paperId) {
  if (!await checkServer()) { requireServer(); return; }
  const paper = State.papers.find(p => p.id === paperId);
  if (!paper) return;

  const pdfSection = document.getElementById("pdf-section");
  if (pdfSection) pdfSection.innerHTML = `<div class="pdf-searching"><div class="spinner sm"></div> 正在查找开放获取PDF…</div>`;

  let pdfUrl = paper.pdfUrl || "";

  // 1. 已有直链
  if (pdfUrl) {
    updatePdfSection(paperId, pdfUrl);
    return;
  }

  // 2. 从 arXiv ID 构造
  const arxivId = paper.arxivId || extractArxivId(paper.url || "");
  if (arxivId) {
    pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
    paper.arxivId = arxivId;
    paper.pdfUrl = pdfUrl;
    savePapers(State.papers);
    updatePdfSection(paperId, pdfUrl);
    return;
  }

  // 3. Unpaywall（需要 DOI）
  if (paper.doi) {
    try {
      const r = await fetch(`${API_BASE}/api/unpaywall?doi=${encodeURIComponent(paper.doi)}`);
      const data = await r.json();
      if (data.pdf_url) {
        pdfUrl = data.pdf_url;
        paper.pdfUrl = pdfUrl;
        savePapers(State.papers);
        updatePdfSection(paperId, pdfUrl);
        return;
      } else if (data.oa_url) {
        updatePdfSection(paperId, "", data.oa_url, "HTML全文");
        return;
      }
    } catch {}
  }

  // 4. 通过标题在 Semantic Scholar 搜索
  try {
    const r = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(paper.title)}&limit=3`);
    const data = await r.json();
    const match = (data.results || []).find(x =>
      x.pdf_url && x.title.toLowerCase().includes(paper.title.slice(0, 20).toLowerCase())
    );
    if (match) {
      pdfUrl = match.pdf_url;
      paper.pdfUrl = pdfUrl;
      if (!paper.s2id) paper.s2id = match.s2id;
      savePapers(State.papers);
      updatePdfSection(paperId, pdfUrl);
      return;
    }
  } catch {}

  if (pdfSection) {
    pdfSection.innerHTML = `<div class="pdf-not-found">未找到开放获取PDF<br><small>此论文可能在付费期刊，尝试通过作者主页或机构库获取</small></div>`;
  }
}

function updatePdfSection(paperId, pdfUrl, altUrl, altLabel) {
  const pdfSection = document.getElementById("pdf-section");
  if (!pdfSection) return;
  const paper = State.papers.find(p => p.id === paperId);
  const hasLocal = paper?.localPdf;

  pdfSection.innerHTML = `
<div class="pdf-found">
  ${hasLocal ? `
    <a class="action-btn primary" href="${API_BASE}${paper.localPdf}" target="_blank">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      查看本地PDF
    </a>
  ` : ""}
  ${pdfUrl ? `
    <a class="action-btn" href="${pdfUrl}" target="_blank">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      在线查看PDF
    </a>
    <button class="action-btn" onclick="downloadPdf('${paperId}', '${escHtml(pdfUrl)}', '')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      下载到本地
    </button>
  ` : ""}
  ${altUrl ? `<a class="action-btn" href="${altUrl}" target="_blank">${altLabel || "查看全文"}</a>` : ""}
</div>`;
}

function extractArxivId(url) {
  const m = url.match(/arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5}(?:v\d+)?)/i);
  return m ? m[1] : "";
}

// ─── 注入 PDF section 到详情弹窗 ──────────────────────────────────────────────
// 由 app.js 的 openDetail() 渲染后调用
function injectPdfSection(paperId) {
  const paper = State.papers.find(p => p.id === paperId);
  if (!paper) return;

  // 找到 methodology tab panel，在其后插入 PDF tab
  const tabsEl = document.querySelector(".section-tabs");
  const bodyEl = document.querySelector(".modal-body");
  if (!tabsEl || !bodyEl) return;

  // 插入 PDF tab 按钮
  if (!tabsEl.querySelector('[data-tab="pdf"]')) {
    const btn = document.createElement("button");
    btn.className = "tab-btn";
    btn.dataset.tab = "pdf";
    btn.textContent = paper.localPdf ? "📄 本地PDF" : "PDF获取";
    tabsEl.appendChild(btn);
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const panel = document.getElementById("tab-pdf");
      if (panel) panel.classList.add("active");
    });
  }

  // 插入 PDF tab panel
  if (!document.getElementById("tab-pdf")) {
    const panel = document.createElement("div");
    panel.className = "tab-panel";
    panel.id = "tab-pdf";

    const hasLocal = !!paper.localPdf;
    const hasPdfUrl = !!paper.pdfUrl;
    const arxivId = paper.arxivId || extractArxivId(paper.url || "");

    panel.innerHTML = `
<div class="pdf-tab-content">
  <div id="pdf-section">
    ${hasLocal ? `
    <div class="pdf-found">
      <a class="action-btn primary" href="${API_BASE}${paper.localPdf}" target="_blank">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        查看本地PDF
      </a>
      ${hasPdfUrl ? `<button class="action-btn" onclick="downloadPdf('${paperId}', '${escHtml(paper.pdfUrl)}', '')">重新下载</button>` : ""}
    </div>` : hasPdfUrl ? `
    <div class="pdf-found">
      <a class="action-btn" href="${paper.pdfUrl}" target="_blank">在线查看PDF</a>
      <button class="action-btn" onclick="downloadPdf('${paperId}', '${escHtml(paper.pdfUrl)}', '')">
        下载到本地
      </button>
    </div>` : `
    <div class="pdf-lookup">
      <p>尚未获取此论文PDF</p>
      <button class="action-btn primary" onclick="findPdfForPaper('${paperId}')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        自动查找开放PDF
      </button>
      ${paper.doi ? `<small>将通过 Unpaywall 查找 DOI: ${paper.doi}</small>` : ""}
      ${arxivId ? `<a class="action-btn" href="https://arxiv.org/pdf/${arxivId}.pdf" target="_blank">arXiv PDF</a>` : ""}
    </div>`}
  </div>
  <div class="pdf-manual">
    <p class="manual-label">手动填写PDF链接：</p>
    <div class="manual-row">
      <input id="manual-pdf-url" type="url" placeholder="https://arxiv.org/pdf/..." value="${escHtml(paper.pdfUrl||'')}">
      <button class="action-btn" onclick="saveManualPdfUrl('${paperId}')">保存</button>
      <button class="action-btn" onclick="downloadPdf('${paperId}', document.getElementById('manual-pdf-url').value, '')">下载</button>
    </div>
  </div>
</div>`;
    bodyEl.appendChild(panel);
  }
}

function saveManualPdfUrl(paperId) {
  const url = document.getElementById("manual-pdf-url")?.value.trim();
  if (!url) return;
  const paper = State.papers.find(p => p.id === paperId);
  if (!paper) return;
  paper.pdfUrl = url;
  savePapers(State.papers);
  showToast("PDF链接已保存");
  updatePdfSection(paperId, url);
}

// ─── 批量 PDF 管理弹窗 ────────────────────────────────────────────────────────
async function openPdfManager() {
  if (!await checkServer()) { requireServer(); return; }
  const r = await fetch(`${API_BASE}/api/pdfs`).catch(() => null);
  const data = r ? await r.json() : { pdfs: [] };
  const pdfs = data.pdfs || [];

  // 统计数据
  const withLocal = State.papers.filter(p => p.localPdf).length;
  const withUrl   = State.papers.filter(p => p.pdfUrl && !p.localPdf).length;
  const noInfo    = State.papers.filter(p => !p.pdfUrl && !p.localPdf).length;

  document.getElementById("search-overlay").innerHTML = `
<div class="search-modal" onclick="event.stopPropagation()">
  <div class="search-modal-header">
    <h2>PDF 管理</h2>
    <button class="icon-btn close-btn" onclick="closeSearch()">×</button>
  </div>
  <div class="pdf-manager-body">
    <div class="pdf-stats-row">
      <div class="pdf-stat"><span class="stat-num">${withLocal}</span><span>已下载</span></div>
      <div class="pdf-stat"><span class="stat-num">${withUrl}</span><span>有链接</span></div>
      <div class="pdf-stat"><span class="stat-num">${noInfo}</span><span>无PDF</span></div>
      <div class="pdf-stat"><span class="stat-num">${State.papers.length}</span><span>总计</span></div>
    </div>
    <div class="pdf-manager-actions">
      <button class="action-btn primary" onclick="batchFindPdfs()">批量查找开放PDF</button>
      <button class="action-btn" onclick="openSearch()">搜索新论文</button>
    </div>
    <div class="sidebar-label" style="padding:0;margin:12px 0 6px">本地已存储 PDF (${pdfs.length} 个)</div>
    ${pdfs.length === 0 ? `<p style="color:var(--text3);font-size:13px">pdfs/ 文件夹为空</p>` : `
    <div class="local-pdf-list">
      ${pdfs.map(f => `
      <div class="local-pdf-item">
        <span class="pdf-filename">${f.filename}</span>
        <span class="pdf-size">${f.size_kb} KB</span>
        <a class="icon-btn" href="${API_BASE}${f.url_path}" target="_blank" title="查看">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>`).join("")}
    </div>`}
  </div>
</div>`;
  document.getElementById("search-overlay").classList.add("visible");
}

async function batchFindPdfs() {
  const noPdf = State.papers.filter(p => !p.pdfUrl && !p.localPdf);
  if (!noPdf.length) { showToast("所有论文都已有PDF链接"); return; }
  showToast(`正在为 ${noPdf.length} 篇论文查找PDF…`);
  let found = 0;
  for (const paper of noPdf) {
    await findPdfForPaper(paper.id);
    if (paper.pdfUrl) found++;
    await new Promise(r => setTimeout(r, 400)); // 避免速率限制
  }
  showToast(`完成：新找到 ${found} 篇的PDF链接`);
}

// ─── BibTeX 生成（搜索结果）──────────────────────────────────────────────────
function genBibtex(r) {
  const firstAuthor = (r.authors || ["Anonymous"])[0].split(" ").pop().replace(/[^a-zA-Z]/g, "");
  const key = `${firstAuthor.toLowerCase()}${r.year || "0000"}`;
  const authors = (r.authors || []).join(" and ");
  if (r.arxiv_id) {
    return `@article{${key},
  title         = {${r.title}},
  author        = {${authors}},
  year          = {${r.year || ""}},
  eprint        = {${r.arxiv_id}},
  archivePrefix = {arXiv}
}`;
  }
  const type = r.venue?.match(/journal|review|letters|transactions/i) ? "article" : "inproceedings";
  const venueKey = type === "article" ? "journal" : "booktitle";
  return `@${type}{${key},
  title     = {${r.title}},
  author    = {${authors}},
  ${venueKey}     = {${r.venue || ""}},
  year      = {${r.year || ""}},
  doi       = {${r.doi || ""}}
}`;
}

// ─── 初始化：页面加载时检测服务器 ────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  // 延迟检测，避免阻塞主渲染
  setTimeout(checkServer, 500);
  // 每30秒重新检测
  setInterval(checkServer, 30000);
});
