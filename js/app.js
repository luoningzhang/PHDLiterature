/* ============================================================
   Application Logic — PHD Literature Manager
   ============================================================ */

// ─── State ───────────────────────────────────────────────────────────────────
const State = {
  papers: [],
  notes: {},
  bookmarks: [],
  readStatus: {},
  filter: { cat: 'all', stars: 0, yearMin: 1985, yearMax: 2026, search: '', bookmarkOnly: false, readOnly: false },
  sort: 'year_desc',
  view: 'grid',           // grid | list | table
  compareIds: [],
  activePaperId: null,
};

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  State.papers = loadPapers();
  State.notes = loadNotes();
  State.bookmarks = loadBookmarks();
  State.readStatus = loadReadStatus();
  applyTheme(localStorage.getItem('phd_theme') || 'light');
  renderAll();
  bindEvents();
});

// ─── Render ───────────────────────────────────────────────────────────────────
function renderAll() {
  updateStats();
  renderFilterBar();
  renderPapers();
  renderCompareBar();
}

function getFilteredPapers() {
  const { cat, stars, yearMin, yearMax, search, bookmarkOnly, readOnly } = State.filter;
  const q = search.toLowerCase().trim();
  return State.papers
    .filter(p => {
      if (cat !== 'all' && p.cat !== cat) return false;
      if (stars > 0 && p.stars < stars) return false;
      if (p.year < yearMin || p.year > yearMax) return false;
      if (bookmarkOnly && !State.bookmarks.includes(p.id)) return false;
      if (readOnly && !State.readStatus[p.id]) return false;
      if (q) {
        const haystack = [p.title, p.titleZh, (p.authors||[]).join(' '), p.venue, p.descZh, (p.keywords||[]).join(' ')].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (State.sort) {
        case 'year_desc':  return b.year - a.year;
        case 'year_asc':   return a.year - b.year;
        case 'stars_desc': return b.stars - a.stars;
        case 'title_asc':  return a.title.localeCompare(b.title);
        default:           return b.year - a.year;
      }
    });
}

function updateStats() {
  const total = document.getElementById('stat-total');
  const catCounts = document.getElementById('stat-cats');
  if (!total) return;
  const fp = getFilteredPapers();
  total.textContent = `${fp.length} / ${State.papers.length} 篇`;

  const byYear = {};
  fp.forEach(p => { byYear[p.year] = (byYear[p.year] || 0) + 1; });
  const yearRange = Object.keys(byYear);
  const minY = Math.min(...yearRange), maxY = Math.max(...yearRange);
  catCounts.textContent = yearRange.length > 0 ? `${minY}–${maxY}` : '';
}

function renderFilterBar() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const cat = btn.dataset.cat;
    const count = cat === 'all' ? State.papers.length : State.papers.filter(p => p.cat === cat).length;
    const badge = btn.querySelector('.count');
    if (badge) badge.textContent = count;
    btn.classList.toggle('active', cat === State.filter.cat);
  });
  const starsEl = document.getElementById('filter-stars');
  if (starsEl) starsEl.value = State.filter.stars;
  const searchEl = document.getElementById('search-input');
  if (searchEl && searchEl.value !== State.filter.search) searchEl.value = State.filter.search;
}

function renderPapers() {
  const container = document.getElementById('papers-container');
  if (!container) return;
  const papers = getFilteredPapers();
  container.className = `papers-container view-${State.view}`;

  if (papers.length === 0) {
    container.innerHTML = `<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg><p>没有找到匹配的论文</p><button onclick="resetFilters()">清除筛选</button></div>`;
    return;
  }

  if (State.view === 'table') {
    container.innerHTML = renderTableView(papers);
  } else {
    container.innerHTML = papers.map(p => renderPaperCard(p)).join('');
  }
}

function renderPaperCard(p) {
  const cm = CAT_META[p.cat] || {};
  const isBookmarked = State.bookmarks.includes(p.id);
  const isRead = State.readStatus[p.id];
  const inCompare = State.compareIds.includes(p.id);
  const hasNote = State.notes[p.id] && State.notes[p.id].trim();

  return `
<div class="paper-card ${isRead ? 'is-read' : ''} ${inCompare ? 'in-compare' : ''}" data-id="${p.id}" onclick="openDetail('${p.id}')">
  <div class="card-header">
    <span class="cat-badge" style="background:${cm.bg};color:${cm.color}">${cm.label}</span>
    <span class="year-tag">${p.year}</span>
    <div class="card-actions" onclick="event.stopPropagation()">
      <button class="icon-btn ${isBookmarked?'active':''}" title="${isBookmarked?'取消收藏':'收藏'}" onclick="toggleBookmark('${p.id}')">
        ${isBookmarked ? SVG.bookmarkFill : SVG.bookmark}
      </button>
      <button class="icon-btn ${isRead?'active':''}" title="${isRead?'标记为未读':'标记为已读'}" onclick="toggleRead('${p.id}')">
        ${SVG.check}
      </button>
      <button class="icon-btn ${inCompare?'active':''}" title="${inCompare?'移出对比':'加入对比'}" onclick="toggleCompare('${p.id}')">
        ${SVG.compare}
      </button>
    </div>
  </div>
  <h3 class="card-title">${p.title}</h3>
  ${p.titleZh ? `<div class="card-title-zh">${p.titleZh}</div>` : ''}
  <div class="card-authors">${(p.authors||[]).slice(0,3).join(', ')}${(p.authors||[]).length > 3 ? ' 等' : ''}</div>
  <div class="card-venue">${p.venue}</div>
  <p class="card-desc">${p.descZh || ''}</p>
  <div class="card-footer">
    ${renderStars(p.stars)}
    ${hasNote ? `<span class="note-indicator" title="有笔记">${SVG.noteFill}</span>` : ''}
    ${p.url ? `<a class="card-link" href="${p.url}" target="_blank" onclick="event.stopPropagation()" title="原文链接">${SVG.link}</a>` : ''}
  </div>
</div>`;
}

function renderTableView(papers) {
  const rows = papers.map(p => {
    const cm = CAT_META[p.cat] || {};
    const isBookmarked = State.bookmarks.includes(p.id);
    const inCompare = State.compareIds.includes(p.id);
    return `<tr onclick="openDetail('${p.id}')" class="${State.readStatus[p.id]?'is-read':''}">
      <td><span class="cat-badge sm" style="background:${cm.bg};color:${cm.color}">${cm.label}</span></td>
      <td class="table-title">${p.title}<br><span class="table-title-zh">${p.titleZh||''}</span></td>
      <td class="table-authors">${(p.authors||[]).slice(0,2).join(', ')}${(p.authors||[]).length>2?' 等':''}</td>
      <td>${p.year}</td>
      <td class="table-venue">${p.venue}</td>
      <td class="table-desc">${p.limitZh||''}</td>
      <td>${renderStars(p.stars)}</td>
      <td onclick="event.stopPropagation()">
        <button class="icon-btn ${isBookmarked?'active':''}" onclick="toggleBookmark('${p.id}')" title="收藏">${isBookmarked?SVG.bookmarkFill:SVG.bookmark}</button>
        <button class="icon-btn ${inCompare?'active':''}" onclick="toggleCompare('${p.id}')" title="对比">${SVG.compare}</button>
      </td>
    </tr>`;
  }).join('');
  return `<div class="table-wrap"><table class="papers-table">
    <thead><tr><th>类别</th><th>文献名称</th><th>作者</th><th>年份</th><th>发表Venue</th><th>主要局限</th><th>相关度</th><th>操作</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

function renderStars(n) {
  let s = '';
  for (let i = 1; i <= 5; i++) s += `<span style="color:${i<=n?'#F59E0B':'#D1D5DB'}">★</span>`;
  return `<span class="stars">${s}</span>`;
}

function renderCompareBar() {
  const bar = document.getElementById('compare-bar');
  if (!bar) return;
  if (State.compareIds.length === 0) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = 'flex';
  const names = State.compareIds.map(id => {
    const p = State.papers.find(x => x.id === id);
    return p ? `<span class="compare-chip">${p.title.slice(0,30)}… <button onclick="toggleCompare('${id}')" title="移除">×</button></span>` : '';
  }).join('');
  bar.querySelector('.compare-chips').innerHTML = names;
  bar.querySelector('.compare-count').textContent = `已选 ${State.compareIds.length} 篇`;
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function openDetail(id) {
  const p = State.papers.find(x => x.id === id);
  if (!p) return;
  State.activePaperId = id;
  const cm = CAT_META[p.cat] || {};
  const isBookmarked = State.bookmarks.includes(p.id);
  const isRead = State.readStatus[p.id];
  const note = State.notes[p.id] || '';
  const related = (p.related || []).map(rid => {
    const rp = State.papers.find(x => x.id === rid);
    return rp ? `<button class="related-chip" onclick="openDetail('${rid}')">${rp.title}</button>` : '';
  }).join('');

  document.getElementById('modal-overlay').innerHTML = `
<div class="modal" onclick="event.stopPropagation()">
  <div class="modal-header">
    <div>
      <span class="cat-badge" style="background:${cm.bg};color:${cm.color}">${cm.label}</span>
      <span class="year-tag">${p.year}</span>
      ${isRead ? '<span class="read-tag">已读</span>' : ''}
    </div>
    <div class="modal-header-actions">
      <button class="icon-btn ${isBookmarked?'active':''}" onclick="toggleBookmark('${p.id}')" title="${isBookmarked?'取消收藏':'收藏'}">${isBookmarked?SVG.bookmarkFill:SVG.bookmark}</button>
      <button class="icon-btn ${isRead?'active':''}" onclick="toggleRead('${p.id}')" title="已读">${SVG.check}</button>
      <button class="icon-btn" onclick="copyBibtex('${p.id}')" title="复制BibTeX">${SVG.cite}</button>
      ${p.url ? `<a class="icon-btn" href="${p.url}" target="_blank" title="原文">${SVG.link}</a>` : ''}
      <button class="icon-btn close-btn" onclick="closeDetail()" title="关闭">×</button>
    </div>
  </div>
  <div class="modal-body">
    <h2 class="modal-title">${p.title}</h2>
    ${p.titleZh ? `<div class="modal-title-zh">${p.titleZh}</div>` : ''}
    <div class="meta-row">
      <span>${SVG.user} <b>作者：</b>${(p.authors||[]).join('，')}</span>
    </div>
    <div class="meta-row">
      <span>${SVG.venue} <b>发表：</b>${p.venue}</span>
      ${p.doi ? `<span class="doi-link">DOI: <a href="https://doi.org/${p.doi}" target="_blank">${p.doi}</a></span>` : ''}
    </div>
    <div class="meta-row keywords">
      ${(p.keywords||[]).map(k=>`<span class="keyword-chip">${k}</span>`).join('')}
    </div>

    <div class="section-tabs">
      <button class="tab-btn active" data-tab="abstract">摘要</button>
      <button class="tab-btn" data-tab="contributions">核心贡献</button>
      <button class="tab-btn" data-tab="methodology">方法</button>
      <button class="tab-btn" data-tab="bibtex">BibTeX</button>
      <button class="tab-btn" data-tab="notes">笔记</button>
    </div>

    <div class="tab-panel active" id="tab-abstract">
      ${p.abstract ? `<div class="abstract-en"><b>Abstract</b><p>${p.abstract}</p></div>` : ''}
      ${p.abstractZh ? `<div class="abstract-zh"><b>中文摘要</b><p>${p.abstractZh}</p></div>` : ''}
      ${p.limitZh ? `<div class="limit-box"><b>主要局限：</b>${p.limitZh}</div>` : ''}
    </div>

    <div class="tab-panel" id="tab-contributions">
      <ul class="contrib-list">
        ${(p.contributions||[]).map(c=>`<li>${c}</li>`).join('')}
      </ul>
      ${p.methodology ? `<div class="method-box"><b>方法论：</b>${p.methodology}</div>` : ''}
    </div>

    <div class="tab-panel" id="tab-methodology">
      <p>${p.methodology || '暂无详细方法描述。'}</p>
      ${p.tags ? `<div class="tag-row">${(p.tags||[]).map(t=>`<span class="tag-chip">${t}</span>`).join('')}</div>` : ''}
      ${related ? `<div class="related-section"><b>相关文献：</b><div class="related-chips">${related}</div></div>` : ''}
    </div>

    <div class="tab-panel" id="tab-bibtex">
      <div class="bibtex-wrap">
        <pre id="bibtex-content">${escHtml(p.bibtex||'')}</pre>
        <button class="copy-btn" onclick="copyBibtex('${p.id}')">复制 BibTeX</button>
      </div>
    </div>

    <div class="tab-panel" id="tab-notes">
      <textarea id="note-editor" placeholder="在此记录笔记、摘录、想法..." rows="10">${escHtml(note)}</textarea>
      <button class="save-note-btn" onclick="saveNote('${p.id}')">保存笔记</button>
    </div>
  </div>
  <div class="modal-footer">
    <div class="stars-display">${renderStars(p.stars)} <span class="rel-label">相关度</span></div>
    <div>
      <button class="compare-toggle-btn ${State.compareIds.includes(p.id)?'active':''}" onclick="toggleCompare('${p.id}');updateCompareToggle('${p.id}')">
        ${State.compareIds.includes(p.id) ? '移出对比' : '加入对比'}
      </button>
    </div>
  </div>
</div>`;

  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('visible');

  // Tab switching
  overlay.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      overlay.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      overlay.querySelector(`#tab-${btn.dataset.tab}`).classList.add('active');
    });
  });
}

function updateCompareToggle(id) {
  const btn = document.querySelector('.compare-toggle-btn');
  if (btn) {
    btn.textContent = State.compareIds.includes(id) ? '移出对比' : '加入对比';
    btn.classList.toggle('active', State.compareIds.includes(id));
  }
  renderCompareBar();
}

function closeDetail() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('visible');
  State.activePaperId = null;
}

// ─── Compare Modal ────────────────────────────────────────────────────────────
function openCompare() {
  if (State.compareIds.length < 2) {
    showToast('请至少选择2篇论文进行对比', 'warning');
    return;
  }
  const papers = State.compareIds.map(id => State.papers.find(p => p.id === id)).filter(Boolean);
  const fields = [
    { key: 'cat',          label: '类别',    render: p => { const cm=CAT_META[p.cat]||{}; return `<span class="cat-badge" style="background:${cm.bg};color:${cm.color}">${cm.label}</span>`; } },
    { key: 'year',         label: '年份',    render: p => p.year },
    { key: 'authors',      label: '作者',    render: p => (p.authors||[]).join(', ') },
    { key: 'venue',        label: 'Venue',   render: p => p.venue },
    { key: 'abstractZh',   label: '核心方案', render: p => p.descZh || '' },
    { key: 'contributions',label: '主要贡献', render: p => `<ul>${(p.contributions||[]).map(c=>`<li>${c}</li>`).join('')}</ul>` },
    { key: 'methodology',  label: '方法论',  render: p => p.methodology || '' },
    { key: 'limitZh',      label: '主要局限', render: p => p.limitZh || '' },
    { key: 'keywords',     label: '关键词',  render: p => (p.keywords||[]).map(k=>`<span class="keyword-chip sm">${k}</span>`).join(' ') },
    { key: 'stars',        label: '相关度',  render: p => renderStars(p.stars) },
  ];

  const colHeaders = papers.map(p => `<th><div class="compare-col-title">${p.title}</div><div class="compare-col-year">${p.year} · ${p.venue}</div></th>`).join('');
  const rows = fields.map(f => {
    const cells = papers.map(p => `<td>${f.render(p)}</td>`).join('');
    return `<tr><td class="compare-field-label">${f.label}</td>${cells}</tr>`;
  }).join('');

  document.getElementById('compare-overlay').innerHTML = `
<div class="compare-modal" onclick="event.stopPropagation()">
  <div class="compare-modal-header">
    <h2>论文对比 (${papers.length} 篇)</h2>
    <button class="icon-btn close-btn" onclick="closeCompare()">×</button>
  </div>
  <div class="compare-table-wrap">
    <table class="compare-table">
      <thead><tr><th>对比项目</th>${colHeaders}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div class="compare-modal-footer">
    <button onclick="exportBibtexAll()" class="action-btn">${SVG.download} 导出全部BibTeX</button>
    <button onclick="closeCompare()" class="action-btn secondary">关闭</button>
  </div>
</div>`;

  document.getElementById('compare-overlay').classList.add('visible');
}

function closeCompare() {
  document.getElementById('compare-overlay').classList.remove('visible');
}

// ─── Add/Edit Paper ───────────────────────────────────────────────────────────
function openAddPaper(editId) {
  const isEdit = !!editId;
  const p = isEdit ? State.papers.find(x => x.id === editId) : null;
  const catOptions = Object.entries(CAT_META).map(([k,v]) =>
    `<option value="${k}" ${p && p.cat===k ? 'selected':''}>${v.label}</option>`).join('');

  document.getElementById('add-overlay').innerHTML = `
<div class="add-modal" onclick="event.stopPropagation()">
  <div class="add-modal-header">
    <h2>${isEdit ? '编辑论文' : '添加新论文'}</h2>
    <button class="icon-btn close-btn" onclick="closeAddPaper()">×</button>
  </div>
  <div class="add-modal-body">
    <div class="form-row two-col">
      <div class="form-group">
        <label>类别 *</label>
        <select id="f-cat">${catOptions}</select>
      </div>
      <div class="form-group">
        <label>年份 *</label>
        <input id="f-year" type="number" min="1950" max="2030" value="${p?p.year:new Date().getFullYear()}">
      </div>
    </div>
    <div class="form-group">
      <label>英文标题 *</label>
      <input id="f-title" type="text" placeholder="Paper Title in English" value="${p?escHtml(p.title):''}">
    </div>
    <div class="form-group">
      <label>中文标题</label>
      <input id="f-titleZh" type="text" placeholder="论文中文标题（可选）" value="${p?escHtml(p.titleZh||''):''}">
    </div>
    <div class="form-group">
      <label>作者（逗号分隔）</label>
      <input id="f-authors" type="text" placeholder="Author One, Author Two, ..." value="${p?(p.authors||[]).join(', '):''}">
    </div>
    <div class="form-group">
      <label>发表Venue</label>
      <input id="f-venue" type="text" placeholder="Conference / Journal / arXiv..." value="${p?escHtml(p.venue||''):''}">
    </div>
    <div class="form-group">
      <label>论文链接 (URL / arXiv)</label>
      <input id="f-url" type="url" placeholder="https://arxiv.org/abs/..." value="${p?escHtml(p.url||''):''}">
    </div>
    <div class="form-group">
      <label>DOI</label>
      <input id="f-doi" type="text" placeholder="10.xxxx/..." value="${p?escHtml(p.doi||''):''}">
    </div>
    <div class="form-group">
      <label>英文摘要</label>
      <textarea id="f-abstract" rows="4" placeholder="Abstract...">${p?escHtml(p.abstract||''):''}</textarea>
    </div>
    <div class="form-group">
      <label>核心方案（中文）</label>
      <textarea id="f-descZh" rows="2" placeholder="核心方案简述...">${p?escHtml(p.descZh||''):''}</textarea>
    </div>
    <div class="form-group">
      <label>主要局限（中文）</label>
      <input id="f-limitZh" type="text" placeholder="主要局限..." value="${p?escHtml(p.limitZh||''):''}">
    </div>
    <div class="form-group">
      <label>关键词（逗号分隔）</label>
      <input id="f-keywords" type="text" placeholder="keyword1, keyword2, ..." value="${p?(p.keywords||[]).join(', '):''}">
    </div>
    <div class="form-group">
      <label>相关度（1-5星）</label>
      <select id="f-stars">
        ${[1,2,3,4,5].map(s=>`<option value="${s}" ${p&&p.stars===s?'selected':''}>${'★'.repeat(s)}${'☆'.repeat(5-s)} ${s}星</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>BibTeX</label>
      <textarea id="f-bibtex" rows="6" placeholder="@article{...}">${p?escHtml(p.bibtex||''):''}</textarea>
    </div>
  </div>
  <div class="add-modal-footer">
    ${isEdit ? `<button class="action-btn danger" onclick="deletePaper('${editId}')">删除此论文</button>` : '<span></span>'}
    <div>
      <button class="action-btn secondary" onclick="closeAddPaper()">取消</button>
      <button class="action-btn" onclick="savePaperForm('${editId||''}')">保存</button>
    </div>
  </div>
</div>`;
  document.getElementById('add-overlay').classList.add('visible');
}

function closeAddPaper() {
  document.getElementById('add-overlay').classList.remove('visible');
}

function savePaperForm(editId) {
  const title = document.getElementById('f-title').value.trim();
  const year  = parseInt(document.getElementById('f-year').value) || 2024;
  if (!title) { showToast('标题不能为空', 'error'); return; }

  const paper = {
    id: editId || slugify(title) + '-' + year,
    cat: document.getElementById('f-cat').value,
    title,
    titleZh: document.getElementById('f-titleZh').value.trim(),
    year,
    authors: document.getElementById('f-authors').value.split(',').map(s=>s.trim()).filter(Boolean),
    venue:   document.getElementById('f-venue').value.trim(),
    url:     document.getElementById('f-url').value.trim(),
    doi:     document.getElementById('f-doi').value.trim(),
    abstract: document.getElementById('f-abstract').value.trim(),
    descZh:  document.getElementById('f-descZh').value.trim(),
    limitZh: document.getElementById('f-limitZh').value.trim(),
    keywords: document.getElementById('f-keywords').value.split(',').map(s=>s.trim()).filter(Boolean),
    stars:   parseInt(document.getElementById('f-stars').value) || 3,
    bibtex:  document.getElementById('f-bibtex').value.trim(),
    contributions: [],
    related: [],
    tags: [],
  };

  if (editId) {
    const idx = State.papers.findIndex(p => p.id === editId);
    if (idx !== -1) State.papers[idx] = paper;
  } else {
    State.papers.push(paper);
  }
  savePapers(State.papers);
  closeAddPaper();
  renderAll();
  showToast(editId ? '论文已更新' : '论文已添加');
}

function deletePaper(id) {
  if (!confirm('确定要删除这篇论文吗？')) return;
  State.papers = State.papers.filter(p => p.id !== id);
  savePapers(State.papers);
  closeAddPaper();
  closeDetail();
  renderAll();
  showToast('已删除');
}

// ─── Actions ──────────────────────────────────────────────────────────────────
function toggleBookmark(id) {
  if (State.bookmarks.includes(id)) {
    State.bookmarks = State.bookmarks.filter(x => x !== id);
  } else {
    State.bookmarks.push(id);
  }
  saveBookmarks(State.bookmarks);
  renderAll();
  if (State.activePaperId === id) openDetail(id);
}

function toggleRead(id) {
  State.readStatus[id] = !State.readStatus[id];
  saveReadStatus(State.readStatus);
  renderAll();
  if (State.activePaperId === id) openDetail(id);
}

function toggleCompare(id) {
  if (State.compareIds.includes(id)) {
    State.compareIds = State.compareIds.filter(x => x !== id);
  } else {
    if (State.compareIds.length >= 4) {
      showToast('最多同时对比4篇论文', 'warning');
      return;
    }
    State.compareIds.push(id);
  }
  renderCompareBar();
  renderPapers();
  updateCompareToggle(id);
}

function clearCompare() {
  State.compareIds = [];
  renderCompareBar();
  renderPapers();
}

function saveNote(id) {
  const val = document.getElementById('note-editor').value;
  State.notes[id] = val;
  saveNotes(State.notes);
  showToast('笔记已保存');
}

function copyBibtex(id) {
  const p = State.papers.find(x => x.id === id);
  if (!p || !p.bibtex) { showToast('暂无BibTeX', 'warning'); return; }
  navigator.clipboard.writeText(p.bibtex).then(() => showToast('BibTeX已复制到剪贴板'));
}

function exportBibtexAll() {
  const ids = State.compareIds.length > 0 ? State.compareIds : getFilteredPapers().map(p => p.id);
  const text = ids.map(id => {
    const p = State.papers.find(x => x.id === id);
    return p && p.bibtex ? p.bibtex : '';
  }).filter(Boolean).join('\n\n');
  downloadText(text, 'references.bib');
  showToast(`已导出 ${ids.length} 条BibTeX`);
}

function exportCsv() {
  const papers = getFilteredPapers();
  const headers = ['ID', '类别', '标题', '年份', '作者', 'Venue', '核心方案', '主要局限', '相关度'];
  const rows = papers.map(p => [
    p.id, CAT_META[p.cat]?.label||p.cat, `"${(p.title||'').replace(/"/g,'""')}"`,
    p.year, `"${(p.authors||[]).join('; ')}"`, `"${(p.venue||'').replace(/"/g,'""')}"`,
    `"${(p.descZh||'').replace(/"/g,'""')}"`, `"${(p.limitZh||'').replace(/"/g,'""')}"`, p.stars
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadText(csv, 'papers.csv');
  showToast(`已导出 ${papers.length} 条CSV`);
}

function importJson() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        const arr = Array.isArray(data) ? data : (data.papers || []);
        if (!arr.length) { showToast('未发现有效论文数据', 'error'); return; }
        const added = arr.filter(p => !State.papers.find(x => x.id === p.id));
        State.papers.push(...added);
        savePapers(State.papers);
        renderAll();
        showToast(`导入成功：新增 ${added.length} 篇`);
      } catch (ex) {
        showToast('JSON格式错误', 'error');
      }
    };
    reader.readAsText(f);
  };
  input.click();
}

function resetDb() {
  if (!confirm('确定要重置为默认数据库吗？所有自定义数据将丢失！')) return;
  localStorage.removeItem('phd_papers');
  State.papers = loadPapers();
  renderAll();
  showToast('已重置为默认数据库');
}

function resetFilters() {
  State.filter = { cat: 'all', stars: 0, yearMin: 1985, yearMax: 2026, search: '', bookmarkOnly: false, readOnly: false };
  const searchEl = document.getElementById('search-input');
  if (searchEl) searchEl.value = '';
  renderAll();
}

// ─── Theme ────────────────────────────────────────────────────────────────────
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('phd_theme', t);
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(cur === 'light' ? 'dark' : 'light');
  const btn = document.getElementById('theme-btn');
  if (btn) btn.innerHTML = cur === 'light' ? SVG.sun : SVG.moon;
}

// ─── Events ───────────────────────────────────────────────────────────────────
function bindEvents() {
  // Filter bar
  document.getElementById('filter-bar').addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (btn) { State.filter.cat = btn.dataset.cat; renderAll(); }
  });

  // Search
  const search = document.getElementById('search-input');
  let searchTimer;
  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { State.filter.search = search.value; renderAll(); }, 250);
  });
  search.addEventListener('keydown', e => {
    if (e.key === 'Escape') { search.value = ''; State.filter.search = ''; renderAll(); }
  });

  // Sort
  document.getElementById('sort-select').addEventListener('change', e => {
    State.sort = e.target.value; renderPapers();
  });

  // Stars filter
  document.getElementById('filter-stars').addEventListener('change', e => {
    State.filter.stars = parseInt(e.target.value); renderAll();
  });

  // View toggles
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      State.view = btn.dataset.view;
      document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === State.view));
      renderPapers();
    });
  });

  // Bookmark / read only filters
  document.getElementById('filter-bookmark').addEventListener('change', e => {
    State.filter.bookmarkOnly = e.target.checked; renderAll();
  });
  document.getElementById('filter-read').addEventListener('change', e => {
    State.filter.readOnly = e.target.checked; renderAll();
  });

  // Modal overlay close
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDetail();
  });
  document.getElementById('compare-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeCompare();
  });
  document.getElementById('add-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAddPaper();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDetail(); closeCompare(); closeAddPaper();
    }
    if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      document.getElementById('search-input').focus();
    }
  });

  // Theme btn icon init
  const theme = localStorage.getItem('phd_theme') || 'light';
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) themeBtn.innerHTML = theme === 'dark' ? SVG.sun : SVG.moon;
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function showToast(msg, type='success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.getElementById('toast-container').appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2500);
}

function downloadText(text, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  a.download = filename;
  a.click();
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

// ─── SVG Icon Library ─────────────────────────────────────────────────────────
const SVG = {
  bookmark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`,
  bookmarkFill: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  compare: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>`,
  cite: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v3a9 9 0 009 9h3"/><path d="M9 3H6l-3 3 3 3h3"/><path d="M21 21h-3l-3-3 3-3h3"/></svg>`,
  link: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  download: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  moon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
  sun: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  user: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  venue: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  noteFill: `<svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
};
