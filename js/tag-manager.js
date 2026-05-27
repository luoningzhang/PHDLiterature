/* ============================================================
   Tag Manager — Custom Classification Schemes
   ============================================================ */

// ─── Storage ─────────────────────────────────────────────────────────────────
function loadTagSchemes() {
  try { return JSON.parse(localStorage.getItem('phd_tagschemes') || '[]'); }
  catch { return []; }
}
function saveTagSchemes(s) { localStorage.setItem('phd_tagschemes', JSON.stringify(s)); }
function loadPaperTags() {
  try { return JSON.parse(localStorage.getItem('phd_papertags') || '{}'); }
  catch { return {}; }
}
function savePaperTags(t) { localStorage.setItem('phd_papertags', JSON.stringify(t)); }

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!State.tagFilters) State.tagFilters = {};
  _refreshSidebarTagFilter();
});

// ─── ID helper ────────────────────────────────────────────────────────────────
function _tmId() { return Math.random().toString(36).slice(2, 9); }

// ─── Preset color palette ─────────────────────────────────────────────────────
const TM_COLORS = [
  '#EF4444','#F97316','#EAB308','#22C55E','#14B8A6','#3B82F6',
  '#8B5CF6','#EC4899','#94A3B8','#6B7280','#0F6E56','#854F0B'
];

// ─── Scheme Manager Modal ─────────────────────────────────────────────────────

function openSchemeManager() {
  const overlay = document.getElementById('scheme-overlay');
  overlay.style.display = 'flex';
  _renderSchemeManager();
}

function closeSchemeManager() {
  const overlay = document.getElementById('scheme-overlay');
  overlay.style.display = 'none';
  overlay.innerHTML = '';
  _refreshSidebarTagFilter();
}

function _renderSchemeManager() {
  const schemes = loadTagSchemes();
  document.getElementById('scheme-overlay').innerHTML = `
<div class="tm-modal" onclick="event.stopPropagation()">
  <div class="tm-header">
    <span class="tm-title">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
      自定义分类方案
    </span>
    <button class="icon-btn" onclick="closeSchemeManager()" title="关闭">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
  <div class="tm-body">
    <p class="tm-hint">创建分类方案（如"研究阶段"），再为方案添加标签（如"精读/泛读/待读"）。然后从每篇论文详情页的<b>标签</b>选项卡中打标。</p>
    <div id="tm-scheme-list">
      ${schemes.length ? schemes.map(_renderSchemeBlock).join('') : '<p class="tm-empty">暂无分类方案，请在下方新建第一个。</p>'}
    </div>
    <div class="tm-add-scheme-row">
      <input class="tm-input" id="tm-new-scheme-name" placeholder="新方案名称，如：研究阶段、写作相关性…" maxlength="30"
             onkeydown="if(event.key==='Enter')_tmAddScheme()">
      <button class="action-btn primary" onclick="_tmAddScheme()">+ 新建方案</button>
    </div>
  </div>
</div>`;
}

function _renderSchemeBlock(s) {
  const nextColor = TM_COLORS[s.labels.length % TM_COLORS.length];
  return `
<div class="tm-scheme" id="tm-scheme-${s.id}">
  <div class="tm-scheme-head">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:.45;flex-shrink:0">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    </svg>
    <strong class="tm-scheme-name" contenteditable="true"
            onblur="_tmRenameScheme('${s.id}',this.textContent.trim())"
            onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}"
            title="点击可重命名">${escHtml(s.name)}</strong>
    <span class="tm-label-count">${s.labels.length} 个标签</span>
    <button class="icon-btn danger-hover" title="删除此方案" onclick="_tmDeleteScheme('${s.id}')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
      </svg>
    </button>
  </div>
  <div class="tm-labels" id="tm-labels-${s.id}">
    ${s.labels.map(l => _renderLabelRow(s.id, l)).join('')}
    <div class="tm-add-label-row">
      <input type="color" class="tm-color-input" id="tm-new-color-${s.id}" value="${nextColor}" title="选择颜色">
      <input class="tm-input sm" id="tm-new-label-${s.id}" placeholder="标签名称" maxlength="20"
             onkeydown="if(event.key==='Enter')_tmAddLabel('${s.id}')">
      <button class="action-btn sm" onclick="_tmAddLabel('${s.id}')">+ 添加</button>
    </div>
  </div>
</div>`;
}

function _renderLabelRow(schemeId, l) {
  return `
<div class="tm-label-row" id="tm-label-${l.id}">
  <span class="tm-label-dot" style="background:${l.color}"></span>
  <span class="tm-label-name" contenteditable="true"
        onblur="_tmRenameLabel('${schemeId}','${l.id}',this.textContent.trim())"
        onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}"
        title="点击可重命名">${escHtml(l.name)}</span>
  <input type="color" class="tm-color-input sm" value="${l.color}" title="更改颜色"
         onchange="_tmColorLabel('${schemeId}','${l.id}',this.value)">
  <button class="icon-btn danger-hover" title="删除" onclick="_tmDeleteLabel('${schemeId}','${l.id}')">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>
</div>`;
}

// ─── Scheme CRUD ──────────────────────────────────────────────────────────────

function _tmAddScheme() {
  const input = document.getElementById('tm-new-scheme-name');
  const name = (input?.value || '').trim();
  if (!name) { input?.focus(); return; }
  const schemes = loadTagSchemes();
  schemes.push({ id: _tmId(), name, labels: [] });
  saveTagSchemes(schemes);
  input.value = '';
  _renderSchemeManager();
  _refreshSidebarTagFilter();
}

function _tmRenameScheme(id, name) {
  if (!name) return;
  const schemes = loadTagSchemes();
  const s = schemes.find(x => x.id === id);
  if (s && s.name !== name) { s.name = name; saveTagSchemes(schemes); _refreshSidebarTagFilter(); }
}

function _tmDeleteScheme(id) {
  const schemes = loadTagSchemes();
  const s = schemes.find(x => x.id === id);
  if (!s || !confirm(`确定删除分类方案"${s.name}"？所有相关论文标记将一并清除。`)) return;
  saveTagSchemes(schemes.filter(x => x.id !== id));
  const tags = loadPaperTags();
  Object.keys(tags).forEach(pid => { delete tags[pid][id]; });
  savePaperTags(tags);
  if (State.tagFilters) delete State.tagFilters[id];
  _renderSchemeManager();
  _refreshSidebarTagFilter();
  renderAll();
}

// ─── Label CRUD ───────────────────────────────────────────────────────────────

function _tmAddLabel(schemeId) {
  const nameInput = document.getElementById(`tm-new-label-${schemeId}`);
  const colorInput = document.getElementById(`tm-new-color-${schemeId}`);
  const name = (nameInput?.value || '').trim();
  if (!name) { nameInput?.focus(); return; }
  const color = colorInput?.value || TM_COLORS[0];
  const schemes = loadTagSchemes();
  const s = schemes.find(x => x.id === schemeId);
  if (!s) return;
  s.labels.push({ id: _tmId(), name, color });
  saveTagSchemes(schemes);
  nameInput.value = '';
  const labelsDiv = document.getElementById(`tm-labels-${schemeId}`);
  if (labelsDiv) {
    const nextColor = TM_COLORS[s.labels.length % TM_COLORS.length];
    labelsDiv.innerHTML = s.labels.map(l => _renderLabelRow(schemeId, l)).join('') + `
<div class="tm-add-label-row">
  <input type="color" class="tm-color-input" id="tm-new-color-${schemeId}" value="${nextColor}" title="选择颜色">
  <input class="tm-input sm" id="tm-new-label-${schemeId}" placeholder="标签名称" maxlength="20"
         onkeydown="if(event.key==='Enter')_tmAddLabel('${schemeId}')">
  <button class="action-btn sm" onclick="_tmAddLabel('${schemeId}')">+ 添加</button>
</div>`;
    const countEl = document.querySelector(`#tm-scheme-${schemeId} .tm-label-count`);
    if (countEl) countEl.textContent = `${s.labels.length} 个标签`;
  }
  _refreshSidebarTagFilter();
}

function _tmRenameLabel(schemeId, labelId, name) {
  if (!name) return;
  const schemes = loadTagSchemes();
  const s = schemes.find(x => x.id === schemeId);
  const l = s?.labels.find(x => x.id === labelId);
  if (l && l.name !== name) { l.name = name; saveTagSchemes(schemes); _refreshSidebarTagFilter(); }
}

function _tmColorLabel(schemeId, labelId, color) {
  const schemes = loadTagSchemes();
  const s = schemes.find(x => x.id === schemeId);
  const l = s?.labels.find(x => x.id === labelId);
  if (!l) return;
  l.color = color;
  saveTagSchemes(schemes);
  const row = document.getElementById(`tm-label-${labelId}`);
  if (row) { const dot = row.querySelector('.tm-label-dot'); if (dot) dot.style.background = color; }
}

function _tmDeleteLabel(schemeId, labelId) {
  const schemes = loadTagSchemes();
  const s = schemes.find(x => x.id === schemeId);
  const l = s?.labels.find(x => x.id === labelId);
  if (!l || !confirm(`删除标签"${l.name}"？已打此标签的论文将被清除。`)) return;
  s.labels = s.labels.filter(x => x.id !== labelId);
  saveTagSchemes(schemes);
  const tags = loadPaperTags();
  Object.keys(tags).forEach(pid => {
    if (tags[pid][schemeId] === labelId) delete tags[pid][schemeId];
  });
  savePaperTags(tags);
  document.getElementById(`tm-label-${labelId}`)?.remove();
  const countEl = document.querySelector(`#tm-scheme-${schemeId} .tm-label-count`);
  if (countEl) countEl.textContent = `${s.labels.length} 个标签`;
  _refreshSidebarTagFilter();
  renderAll();
}

// ─── Tag operations ───────────────────────────────────────────────────────────

function setTag(paperId, schemeId, labelId) {
  const tags = loadPaperTags();
  if (!tags[paperId]) tags[paperId] = {};
  if (labelId === null || tags[paperId][schemeId] === labelId) {
    delete tags[paperId][schemeId]; // clear or toggle off
  } else {
    tags[paperId][schemeId] = labelId;
  }
  savePaperTags(tags);
  // Refresh tag panel in detail modal
  const panel = document.getElementById('tab-tags');
  if (panel) panel.innerHTML = _renderTagPanelContent(paperId);
  // Refresh chips on card
  _refreshCardChips(paperId);
}

function _refreshCardChips(paperId) {
  const card = document.querySelector(`.paper-card[data-id="${paperId}"]`);
  if (!card) return;
  const existing = card.querySelector('.card-custom-tags');
  const tmp = document.createElement('div');
  tmp.innerHTML = renderCustomTagChips(paperId);
  const newEl = tmp.firstElementChild;
  if (existing) existing.replaceWith(newEl);
  else card.appendChild(newEl);
}

// ─── Detail modal — "标签" tab ────────────────────────────────────────────────

function injectTagSection(paperId) {
  const schemes = loadTagSchemes();
  if (!schemes.length) return;

  const overlay = document.getElementById('modal-overlay');
  const tabsRow = overlay.querySelector('.section-tabs');
  if (!tabsRow || tabsRow.querySelector('[data-tab="tags"]')) return;

  const tagBtn = document.createElement('button');
  tagBtn.className = 'tab-btn';
  tagBtn.dataset.tab = 'tags';
  tagBtn.textContent = '标签';
  tabsRow.appendChild(tagBtn);

  const panel = document.createElement('div');
  panel.className = 'tab-panel';
  panel.id = 'tab-tags';
  panel.innerHTML = _renderTagPanelContent(paperId);
  const footer = overlay.querySelector('.modal-footer');
  footer.parentNode.insertBefore(panel, footer);

  tagBtn.addEventListener('click', () => {
    overlay.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    overlay.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tagBtn.classList.add('active');
    panel.classList.add('active');
  });
}

function _renderTagPanelContent(paperId) {
  const schemes = loadTagSchemes();
  const paperTags = (loadPaperTags())[paperId] || {};
  return `<div class="tm-tag-section">${
    schemes.map(s => {
      const curId = paperTags[s.id] || null;
      return `
<div class="tm-tag-row">
  <span class="tm-tag-row-label">${escHtml(s.name)}</span>
  <div class="tm-tag-chips">
    ${s.labels.length
      ? s.labels.map(l => `<button class="tm-chip${l.id === curId ? ' active' : ''}"
          style="--chip-color:${l.color}" onclick="setTag('${paperId}','${s.id}','${l.id}')"
          title="${l.id === curId ? '再次点击取消' : '点击打标签'}">${escHtml(l.name)}</button>`).join('')
      : '<span class="tm-no-labels">此方案暂无标签，请先在方案管理中添加</span>'}
  </div>
</div>`;
    }).join('')
  }</div>`;
}

// ─── Card chips (called from app.js renderPaperCard) ─────────────────────────

function renderCustomTagChips(paperId) {
  const schemes = loadTagSchemes();
  const paperTags = (loadPaperTags())[paperId] || {};
  const chips = [];
  for (const s of schemes) {
    const lid = paperTags[s.id];
    if (!lid) continue;
    const l = s.labels.find(x => x.id === lid);
    if (l) chips.push(`<span class="custom-tag-chip" style="background:${l.color}">${escHtml(l.name)}</span>`);
  }
  return `<div class="card-custom-tags">${chips.join('')}</div>`;
}

// ─── Sidebar tag filter ───────────────────────────────────────────────────────

function _refreshSidebarTagFilter() {
  const section = document.getElementById('sidebar-tag-filter-section');
  const container = document.getElementById('sidebar-tag-filters');
  if (!section || !container) return;
  const schemes = loadTagSchemes();
  if (!schemes.length) { section.style.display = 'none'; return; }
  section.style.display = '';
  container.innerHTML = schemes.map(s => `
<div class="sidebar-control">
  <label>${escHtml(s.name)}</label>
  <select onchange="setTagFilter('${s.id}',this.value)">
    <option value="">不限</option>
    ${s.labels.map(l => {
      const active = (State.tagFilters || {})[s.id] === l.id;
      return `<option value="${l.id}"${active ? ' selected' : ''}>${escHtml(l.name)}</option>`;
    }).join('')}
  </select>
</div>`).join('');
}

function setTagFilter(schemeId, labelId) {
  if (!State.tagFilters) State.tagFilters = {};
  if (labelId) State.tagFilters[schemeId] = labelId;
  else delete State.tagFilters[schemeId];
  renderAll();
}
