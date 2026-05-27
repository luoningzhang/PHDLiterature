/* ============================================================
   Batch PDF Download Manager — PHD Literature Manager
   依赖: data.js, app.js, search.js 已加载
   ============================================================ */

// ─── Module State ─────────────────────────────────────────────────────────────
const DM = {
  jobId:         null,       // active batch job ID
  pollTimer:     null,       // setInterval handle for polling
  activeFilter:  'all',      // filter tab: all | done | pending | failed
  rowStatuses:   {},         // { paperId: { status, sizeKb, error } }
  running:       false,      // true while a batch job is active
};

// ─── Open / Close ─────────────────────────────────────────────────────────────
function openDownloadManager() {
  const overlay = document.getElementById('download-overlay');
  if (!overlay) { console.error('download-overlay element not found'); return; }

  // Reset per-session view state (keep jobId / rowStatuses across reopens)
  DM.activeFilter = 'all';

  overlay.innerHTML = _buildModalHtml();
  overlay.classList.add('visible');

  // Wire close on backdrop click
  overlay.onclick = (e) => { if (e.target === overlay) closeDownloadManager(); };

  // Restore statuses from any ongoing / previous job into the rendered rows
  _applyAllStatuses();
  _refreshProgress();
  _applyFilter(DM.activeFilter);

  // If a job is already running, resume polling display
  if (DM.running && DM.jobId) {
    _startPolling();
  }
}

function closeDownloadManager() {
  const overlay = document.getElementById('download-overlay');
  if (overlay) overlay.classList.remove('visible');
  // Leave polling running in background if a job is active
}

// ─── HTML Builder ─────────────────────────────────────────────────────────────
function _buildModalHtml() {
  const rows = State.papers.map((p, i) => _buildRow(p, i + 1)).join('');

  return `
<div class="dm-modal" onclick="event.stopPropagation()">
  <div class="dm-header">
    <h2>批量 PDF 下载管理</h2>
    <button class="icon-btn close-btn" onclick="closeDownloadManager()" title="关闭">×</button>
  </div>

  <div class="dm-toolbar">
    <div class="dm-progress-wrap">
      <div class="dm-progress-label" id="dm-progress-label">统计中…</div>
      <div class="dm-progress-bar-bg">
        <div class="dm-progress-bar-fill" id="dm-progress-bar-fill" style="width:0%"></div>
      </div>
    </div>
    <div class="dm-toolbar-btns">
      <button class="action-btn primary" id="dm-btn-all"
              onclick="startBatchDownload(null)" title="下载所有缺少本地PDF的论文">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        全部下载
      </button>
      <button class="action-btn" id="dm-btn-retry-all"
              onclick="retryAllFailed()" title="重试所有失败的论文">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="1 4 1 10 7 10"/>
          <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
        </svg>
        重试全部失败
      </button>
      <button class="action-btn danger" id="dm-btn-stop"
              onclick="_stopBatch()" title="停止当前下载任务" style="display:none">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
        </svg>
        停止
      </button>
    </div>
  </div>

  <div class="dm-filter-tabs">
    <button class="dm-tab active" data-dm-filter="all"     onclick="_applyFilter('all')">全部</button>
    <button class="dm-tab"        data-dm-filter="done"    onclick="_applyFilter('done')">已下载</button>
    <button class="dm-tab"        data-dm-filter="pending" onclick="_applyFilter('pending')">未下载</button>
    <button class="dm-tab"        data-dm-filter="failed"  onclick="_applyFilter('failed')">失败</button>
  </div>

  <div class="dm-table-wrap">
    <table class="dm-table">
      <thead>
        <tr>
          <th class="dm-col-idx">序号</th>
          <th class="dm-col-title">标题</th>
          <th class="dm-col-year">年份</th>
          <th class="dm-col-cat">类别</th>
          <th class="dm-col-source">PDF来源</th>
          <th class="dm-col-status">状态</th>
          <th class="dm-col-size">大小</th>
          <th class="dm-col-ops">操作</th>
        </tr>
      </thead>
      <tbody id="dm-tbody">
        ${rows}
      </tbody>
    </table>
  </div>
</div>`;
}

function _buildRow(p, idx) {
  const cm = CAT_META[p.cat] || {};
  const status = DM.rowStatuses[p.id] || _defaultStatus(p);
  const statusHtml  = _statusHtml(p.id, status);
  const sizeHtml    = _sizeHtml(p.id, status);
  const sourceHtml  = _sourceHtml(p);
  const opsHtml     = _opsHtml(p, status);

  return `
<tr id="dm-row-${escHtml(p.id)}" data-status="${status.status}">
  <td class="dm-col-idx">${idx}</td>
  <td class="dm-col-title">
    <div class="dm-title-main" title="${escHtml(p.title)}">${escHtml(p.title)}</div>
    ${p.titleZh ? `<div class="dm-title-zh">${escHtml(p.titleZh)}</div>` : ''}
  </td>
  <td class="dm-col-year">${p.year}</td>
  <td class="dm-col-cat">
    <span class="cat-badge sm" style="background:${cm.bg};color:${cm.color}">${cm.label}</span>
  </td>
  <td class="dm-col-source">${sourceHtml}</td>
  <td class="dm-col-status" id="dm-status-${escHtml(p.id)}">${statusHtml}</td>
  <td class="dm-col-size"   id="dm-size-${escHtml(p.id)}">${sizeHtml}</td>
  <td class="dm-col-ops"    id="dm-ops-${escHtml(p.id)}">${opsHtml}</td>
</tr>`;
}

// ─── Status Helpers ───────────────────────────────────────────────────────────
function _defaultStatus(p) {
  if (p.localPdf) return { status: 'skipped', sizeKb: null, error: null };
  return { status: 'idle', sizeKb: null, error: null };
}

function _statusHtml(paperId, s) {
  switch (s.status) {
    case 'idle':
      return `<span class="dm-status dm-s-idle"><span class="dm-dot dm-dot-gray"></span>未下载</span>`;
    case 'finding':
      return `<span class="dm-status dm-s-finding"><span class="dm-dot dm-dot-spin"></span>查找中…</span>`;
    case 'downloading':
      return `<span class="dm-status dm-s-downloading"><span class="dm-dot dm-dot-spin blue"></span>下载中…</span>`;
    case 'done':
      return `<span class="dm-status dm-s-done"><span class="dm-dot dm-dot-green"></span>✓ 已下载</span>`;
    case 'failed': {
      const msg = s.error ? escHtml(s.error.slice(0, 60)) + (s.error.length > 60 ? '…' : '') : '未知错误';
      return `<span class="dm-status dm-s-failed" title="${escHtml(s.error || '')}"><span class="dm-dot dm-dot-red"></span>✗ ${msg}</span>`;
    }
    case 'no-source':
      return `<span class="dm-status dm-s-nosource"><span class="dm-dot dm-dot-orange"></span>无开放PDF</span>`;
    case 'skipped':
      return `<span class="dm-status dm-s-skipped"><span class="dm-dot dm-dot-blue"></span>已有本地</span>`;
    default:
      return `<span class="dm-status">${escHtml(s.status)}</span>`;
  }
}

function _sizeHtml(paperId, s) {
  if (s.status === 'done' && s.sizeKb != null) {
    return `<span class="dm-size-val">${s.sizeKb} KB</span>`;
  }
  return `<span class="dm-size-val dm-size-empty">—</span>`;
}

function _sourceHtml(p) {
  const badges = [];
  if (p.arxivId) badges.push(`<span class="dm-src-badge dm-src-arxiv">arXiv</span>`);
  if (p.doi)     badges.push(`<span class="dm-src-badge dm-src-doi">DOI</span>`);
  if (p.pdfUrl)  badges.push(`<span class="dm-src-badge dm-src-url">URL</span>`);
  return badges.length ? badges.join('') : `<span class="dm-src-none">无</span>`;
}

function _opsHtml(p, s) {
  const parts = [];

  if (s.status === 'failed') {
    parts.push(`<button class="action-btn sm" onclick="retrySinglePaper('${escHtml(p.id)}')" title="重试此论文">重试</button>`);
  }

  if (s.status === 'no-source') {
    parts.push(`<a class="action-btn sm" href="https://scholar.google.com/scholar?q=${encodeURIComponent(p.title)}" target="_blank" title="Google Scholar搜索">搜索</a>`);
  }

  if (s.status === 'done' && p.localPdf) {
    parts.push(`<a class="action-btn sm" href="${API_BASE}${escHtml(p.localPdf)}" target="_blank" title="查看PDF">查看</a>`);
  }

  if (s.status === 'idle' || s.status === 'no-source') {
    parts.push(`<button class="action-btn sm" onclick="_downloadSingle('${escHtml(p.id)}')" title="单独下载">下载</button>`);
  }

  return parts.join('');
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────
function _applyFilter(filter) {
  DM.activeFilter = filter;

  // Update tab active states
  document.querySelectorAll('.dm-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.dmFilter === filter);
  });

  // Show/hide rows
  document.querySelectorAll('#dm-tbody tr').forEach(row => {
    const rowStatus = row.dataset.status || 'idle';
    let visible = false;
    switch (filter) {
      case 'all':     visible = true; break;
      case 'done':    visible = (rowStatus === 'done' || rowStatus === 'skipped'); break;
      case 'pending': visible = (rowStatus === 'idle' || rowStatus === 'finding' || rowStatus === 'downloading' || rowStatus === 'no-source'); break;
      case 'failed':  visible = (rowStatus === 'failed'); break;
    }
    row.style.display = visible ? '' : 'none';
  });
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function _refreshProgress() {
  const total  = State.papers.length;
  const done   = State.papers.filter(p => p.localPdf).length;
  const pct    = total > 0 ? Math.round((done / total) * 100) : 0;

  const label = document.getElementById('dm-progress-label');
  const fill  = document.getElementById('dm-progress-bar-fill');
  if (label) label.textContent = `已下载 ${done} / ${total} 篇 (${pct}%)`;
  if (fill)  fill.style.width  = `${pct}%`;
}

// ─── Batch Download ───────────────────────────────────────────────────────────
/**
 * Start a batch download.
 * @param {string[]|null} paperIds  — null means "all papers missing localPdf"
 */
async function startBatchDownload(paperIds) {
  if (!serverOnline) {
    showToast('请先运行：python server.py', 'warning');
    return;
  }

  const targets = paperIds
    ? paperIds
    : State.papers.filter(p => !p.localPdf).map(p => p.id);

  if (!targets.length) {
    showToast('没有需要下载的论文', 'warning');
    return;
  }

  // Build payload: include pdf source info
  const payload = targets.map(id => {
    const p = State.papers.find(x => x.id === id);
    if (!p) return null;
    return {
      id:      p.id,
      title:   p.title,
      arxivId: p.arxivId || '',
      doi:     p.doi     || '',
      pdfUrl:  p.pdfUrl  || '',
      url:     p.url     || '',
    };
  }).filter(Boolean);

  // Mark targets as 'finding' in UI
  payload.forEach(item => {
    _updateRowStatus(item.id, { status: 'finding', sizeKb: null, error: null });
  });

  _setRunning(true);

  try {
    const res = await fetch(`${API_BASE}/api/batch-start`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ papers: payload }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    DM.jobId = data.job_id || data.jobId || null;
    if (!DM.jobId) throw new Error('服务器未返回 job_id');

    showToast(`批量下载已启动：${payload.length} 篇`);
    _startPolling();
  } catch (e) {
    showToast(`启动下载失败：${e.message}`, 'error');
    payload.forEach(item => {
      _updateRowStatus(item.id, { status: 'failed', sizeKb: null, error: e.message });
    });
    _setRunning(false);
  }
}

// ─── Poll Batch Status ────────────────────────────────────────────────────────
function _startPolling() {
  if (DM.pollTimer) clearInterval(DM.pollTimer);
  DM.pollTimer = setInterval(pollBatchStatus, 1500);
}

async function pollBatchStatus() {
  if (!DM.jobId) { _stopPolling(); return; }

  try {
    const res = await fetch(`${API_BASE}/api/batch-status?job=${encodeURIComponent(DM.jobId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // data.papers: array of { id, status, size_kb, error, local_pdf }
    const updatedPapers = data.papers || [];
    let allFinished = true;

    updatedPapers.forEach(item => {
      const newStatus = {
        status:  item.status,
        sizeKb:  item.size_kb  ?? null,
        error:   item.error    || null,
      };

      const existing = DM.rowStatuses[item.id] || {};
      // Only update DOM cells if something changed
      if (existing.status !== newStatus.status || existing.sizeKb !== newStatus.sizeKb) {
        DM.rowStatuses[item.id] = newStatus;
        _updateRowCells(item.id, newStatus);

        // Persist localPdf when a paper becomes done
        if (newStatus.status === 'done' && item.local_pdf) {
          const paper = State.papers.find(p => p.id === item.id);
          if (paper && paper.localPdf !== item.local_pdf) {
            paper.localPdf = item.local_pdf;
            savePapers(State.papers);
            renderAll();
          }
        }
      }

      // Check if still in-progress
      if (newStatus.status === 'finding' || newStatus.status === 'downloading') {
        allFinished = false;
      }
    });

    _refreshProgress();
    _applyFilter(DM.activeFilter);

    if (data.finished || allFinished) {
      _stopPolling();
      _setRunning(false);
      const doneCount   = updatedPapers.filter(p => p.status === 'done').length;
      const failedCount = updatedPapers.filter(p => p.status === 'failed').length;
      const noSrcCount  = updatedPapers.filter(p => p.status === 'no-source').length;
      showToast(`下载完成：✓ ${doneCount} 篇  ✗ ${failedCount} 篇  无源 ${noSrcCount} 篇`);
    }
  } catch (e) {
    // Network glitch — keep polling, don't abort
    console.warn('[DM] poll error:', e.message);
  }
}

function _stopPolling() {
  if (DM.pollTimer) { clearInterval(DM.pollTimer); DM.pollTimer = null; }
}

async function _stopBatch() {
  _stopPolling();
  _setRunning(false);
  showToast('已停止批量下载');
  if (DM.jobId) {
    try {
      await fetch(`${API_BASE}/api/batch-stop?job=${encodeURIComponent(DM.jobId)}`, { method: 'POST' });
    } catch { /* ignore */ }
  }
}

// ─── Retry ────────────────────────────────────────────────────────────────────
async function retrySinglePaper(paperId) {
  if (!serverOnline) { showToast('请先运行：python server.py', 'warning'); return; }
  if (!DM.jobId)    { showToast('请先启动批量下载任务', 'warning'); return; }

  _updateRowStatus(paperId, { status: 'finding', sizeKb: null, error: null });

  try {
    const res = await fetch(
      `${API_BASE}/api/batch-retry?job=${encodeURIComponent(DM.jobId)}&id=${encodeURIComponent(paperId)}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    showToast('已重新加入下载队列');
    _setRunning(true);
    _startPolling();
  } catch (e) {
    showToast(`重试失败：${e.message}`, 'error');
    _updateRowStatus(paperId, { status: 'failed', sizeKb: null, error: e.message });
  }
}

async function retryAllFailed() {
  if (!serverOnline) { showToast('请先运行：python server.py', 'warning'); return; }
  if (!DM.jobId)    { showToast('请先启动批量下载任务', 'warning'); return; }

  const failedIds = Object.entries(DM.rowStatuses)
    .filter(([, s]) => s.status === 'failed')
    .map(([id]) => id);

  if (!failedIds.length) { showToast('没有失败的任务可以重试', 'warning'); return; }

  failedIds.forEach(id => {
    _updateRowStatus(id, { status: 'finding', sizeKb: null, error: null });
  });

  try {
    const res = await fetch(
      `${API_BASE}/api/batch-retry-all?job=${encodeURIComponent(DM.jobId)}`,
      { method: 'POST' }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    showToast(`已重试 ${failedIds.length} 篇失败论文`);
    _setRunning(true);
    _startPolling();
  } catch (e) {
    showToast(`重试失败：${e.message}`, 'error');
    failedIds.forEach(id => {
      _updateRowStatus(id, { status: 'failed', sizeKb: null, error: e.message });
    });
  }
}

// ─── Single Paper Download (from ops column) ──────────────────────────────────
async function _downloadSingle(paperId) {
  if (!serverOnline) { showToast('请先运行：python server.py', 'warning'); return; }

  const p = State.papers.find(x => x.id === paperId);
  if (!p) return;

  const url = p.pdfUrl
    || (p.arxivId ? `https://arxiv.org/pdf/${p.arxivId}.pdf` : '')
    || '';

  if (!url) {
    showToast('此论文暂无可用PDF链接', 'warning');
    return;
  }

  _updateRowStatus(paperId, { status: 'downloading', sizeKb: null, error: null });

  try {
    const res  = await fetch(
      `${API_BASE}/api/download?url=${encodeURIComponent(url)}&id=${encodeURIComponent(paperId)}`
    );
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || '下载失败');

    const paper = State.papers.find(x => x.id === paperId);
    if (paper) {
      paper.localPdf = data.url_path;
      if (!paper.pdfUrl) paper.pdfUrl = url;
      savePapers(State.papers);
      renderAll();
    }

    _updateRowStatus(paperId, { status: 'done', sizeKb: data.size_kb ?? null, error: null });
    _refreshProgress();
    showToast(`已下载 (${data.size_kb} KB)`);
  } catch (e) {
    _updateRowStatus(paperId, { status: 'failed', sizeKb: null, error: e.message });
    showToast(`下载失败：${e.message}`, 'error');
  }
}

// ─── DOM Mutation Helpers ─────────────────────────────────────────────────────
/**
 * Update internal state and re-render only the status, size, and ops cells
 * for a single paper row — no full table re-render.
 */
function _updateRowStatus(paperId, statusObj) {
  DM.rowStatuses[paperId] = statusObj;
  _updateRowCells(paperId, statusObj);
}

function _updateRowCells(paperId, statusObj) {
  const safeId   = CSS.escape(paperId);
  const row      = document.querySelector(`#dm-row-${safeId}`);
  const statusEl = document.getElementById(`dm-status-${paperId}`);
  const sizeEl   = document.getElementById(`dm-size-${paperId}`);
  const opsEl    = document.getElementById(`dm-ops-${paperId}`);

  if (row)      row.dataset.status = statusObj.status;
  if (statusEl) statusEl.innerHTML = _statusHtml(paperId, statusObj);
  if (sizeEl)   sizeEl.innerHTML   = _sizeHtml(paperId, statusObj);
  if (opsEl) {
    const paper = State.papers.find(p => p.id === paperId);
    if (paper) opsEl.innerHTML = _opsHtml(paper, statusObj);
  }
}

/** Replay all known statuses after the modal is (re-)opened. */
function _applyAllStatuses() {
  Object.entries(DM.rowStatuses).forEach(([paperId, statusObj]) => {
    _updateRowCells(paperId, statusObj);
  });
}

// ─── Running State (button visibility) ───────────────────────────────────────
function _setRunning(isRunning) {
  DM.running = isRunning;
  const btnStop     = document.getElementById('dm-btn-stop');
  const btnAll      = document.getElementById('dm-btn-all');
  const btnRetryAll = document.getElementById('dm-btn-retry-all');
  if (!btnStop) return; // modal not open
  btnStop.style.display     = isRunning ? '' : 'none';
  btnAll.disabled           = isRunning;
  btnRetryAll.disabled      = isRunning;
}
