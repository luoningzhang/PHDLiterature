/* ============================================================
   文献分析看板 — analysis.js
   依赖: data.js (CAT_META, State), app.js (escHtml, renderStars)
   功能: 5个标签页的纯客户端分析看板
   ============================================================ */

// ─── 当前激活标签 ──────────────────────────────────────────────────────────────
let _activeTab = 'overview';

// ─── 公开 API ──────────────────────────────────────────────────────────────────

/** 打开分析看板 */
function openAnalysis() {
  const overlay = document.getElementById('analysis-overlay');
  if (!overlay) return;

  // 构建模态框骨架
  overlay.innerHTML = `
<div class="analysis-modal" onclick="event.stopPropagation()">
  <div class="analysis-header">
    <div class="analysis-title">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           style="vertical-align:middle;margin-right:6px">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      文献分析看板
    </div>
    <div class="analysis-tabs">
      <button class="atab-btn active"  data-tab="overview"   onclick="renderAnalysisTab('overview')">概览</button>
      <button class="atab-btn"         data-tab="timeline"   onclick="renderAnalysisTab('timeline')">时间线</button>
      <button class="atab-btn"         data-tab="methods"    onclick="renderAnalysisTab('methods')">方法分布</button>
      <button class="atab-btn"         data-tab="keywords"   onclick="renderAnalysisTab('keywords')">关键词</button>
      <button class="atab-btn"         data-tab="pdf"        onclick="renderAnalysisTab('pdf')">PDF覆盖</button>
    </div>
    <button class="icon-btn close-btn" onclick="closeAnalysis()" title="关闭">×</button>
  </div>
  <div class="analysis-body" id="analysis-body">
    <!-- 内容由 renderAnalysisTab 填充 -->
  </div>
</div>`;

  overlay.classList.add('visible');
  _activeTab = 'overview';
  renderAnalysisTab('overview');
}

/** 关闭分析看板 */
function closeAnalysis() {
  const overlay = document.getElementById('analysis-overlay');
  if (overlay) overlay.classList.remove('visible');
}

/** 渲染指定标签页内容 */
function renderAnalysisTab(tab) {
  _activeTab = tab;

  // 更新标签按钮高亮
  document.querySelectorAll('.atab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  const body = document.getElementById('analysis-body');
  if (!body) return;

  // 确保有数据
  const papers = (State && State.papers) ? State.papers : [];
  if (papers.length === 0) {
    body.innerHTML = `<div class="analysis-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <p>暂无论文数据</p>
    </div>`;
    return;
  }

  switch (tab) {
    case 'overview':  body.innerHTML = buildOverviewTab(papers);   break;
    case 'timeline':  body.innerHTML = buildTimelineTab(papers);   break;
    case 'methods':   body.innerHTML = buildMethodsTab(papers);    break;
    case 'keywords':  body.innerHTML = buildKeywordsTab(papers);   break;
    case 'pdf':       body.innerHTML = buildPdfTab(papers);        break;
    default:          body.innerHTML = buildOverviewTab(papers);
  }
}

// ─── SVG 辅助函数 ──────────────────────────────────────────────────────────────

/** 创建 SVG 元素（使用 viewBox，响应式） */
function makeSvg(width, height) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  return svg;
}

/** 创建 SVG 子元素 */
function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

/** 将 SVG 元素序列化为 HTML 字符串 */
function svgToHtml(svgEl) {
  const div = document.createElement('div');
  div.appendChild(svgEl);
  return div.innerHTML;
}

// ─── 数据分析辅助函数 ──────────────────────────────────────────────────────────

/** 按类别分组统计 */
function countByCategory(papers) {
  const counts = {};
  Object.keys(CAT_META).forEach(k => { counts[k] = 0; });
  papers.forEach(p => {
    if (counts[p.cat] !== undefined) counts[p.cat]++;
    else counts[p.cat] = (counts[p.cat] || 0) + 1;
  });
  return counts;
}

/** 按年份分组统计 */
function countByYear(papers) {
  const byYear = {};
  papers.forEach(p => {
    if (!byYear[p.year]) byYear[p.year] = [];
    byYear[p.year].push(p);
  });
  return byYear;
}

/** 汇总所有关键词频率 */
function aggregateKeywords(papers) {
  const freq = {};
  papers.forEach(p => {
    (p.keywords || []).forEach(kw => {
      const k = kw.toLowerCase().trim();
      if (k) freq[k] = (freq[k] || 0) + 1;
    });
  });
  return freq;
}

/** 每类别的平均星级 */
function avgStarsByCategory(papers) {
  const sum = {};
  const cnt = {};
  Object.keys(CAT_META).forEach(k => { sum[k] = 0; cnt[k] = 0; });
  papers.forEach(p => {
    if (sum[p.cat] !== undefined) {
      sum[p.cat] += (p.stars || 0);
      cnt[p.cat]++;
    }
  });
  const avg = {};
  Object.keys(CAT_META).forEach(k => {
    avg[k] = cnt[k] > 0 ? sum[k] / cnt[k] : 0;
  });
  return avg;
}

// ─── Tab 1: 概览 ───────────────────────────────────────────────────────────────

function buildOverviewTab(papers) {
  const catCounts = countByCategory(papers);
  const total = papers.length;
  const years = papers.map(p => p.year).filter(Boolean);
  const minYear = years.length ? Math.min(...years) : '—';
  const maxYear = years.length ? Math.max(...years) : '—';
  const avgStars = total > 0
    ? (papers.reduce((s, p) => s + (p.stars || 0), 0) / total).toFixed(1)
    : '0';
  const pdfCovered = papers.filter(p => p.localPdf || p.pdfUrl).length;
  const pdfPct = total > 0 ? Math.round(pdfCovered / total * 100) : 0;

  // 每类别最大数，用于迷你进度条
  const maxCount = Math.max(...Object.values(catCounts), 1);

  // 各类别卡片
  const catCards = Object.entries(CAT_META).map(([key, meta]) => {
    const n = catCounts[key] || 0;
    const barW = Math.round(n / maxCount * 100);
    return `
<div class="ov-cat-card" style="border-left:3px solid ${meta.color}">
  <div class="ov-cat-name" style="color:${meta.color}">${meta.label}</div>
  <div class="ov-cat-count">${n}<span class="ov-cat-unit"> 篇</span></div>
  <div class="ov-mini-bar-bg">
    <div class="ov-mini-bar" style="width:${barW}%;background:${meta.color}"></div>
  </div>
</div>`;
  }).join('');

  // Top 5 高星论文
  const top5 = [...papers].sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, 5);
  const top5Html = top5.map((p, i) => {
    const cm = CAT_META[p.cat] || {};
    return `
<div class="ov-top-row">
  <span class="ov-rank">${i + 1}</span>
  <span class="ov-top-cat" style="background:${cm.bg};color:${cm.color}">${cm.label}</span>
  <span class="ov-top-year">${p.year}</span>
  <span class="ov-top-title">${escHtml(p.title)}</span>
  <span class="ov-top-stars">${'★'.repeat(p.stars || 0)}</span>
</div>`;
  }).join('');

  // 3个洞察标注（来自实际数据）
  // 找最多5星的类别
  const fiveStarBycat = {};
  Object.keys(CAT_META).forEach(k => { fiveStarBycat[k] = 0; });
  papers.filter(p => p.stars === 5).forEach(p => {
    fiveStarBycat[p.cat] = (fiveStarBycat[p.cat] || 0) + 1;
  });
  const topCat = Object.entries(fiveStarBycat).sort((a, b) => b[1] - a[1])[0];
  const topCatLabel = topCat && topCat[1] > 0
    ? `${CAT_META[topCat[0]]?.label || topCat[0]}（${topCat[1]}篇5星）`
    : '数据不足';

  return `
<div class="ov-root">
  <!-- 顶部统计数字行 -->
  <div class="ov-stats-row">
    <div class="ov-stat-card">
      <div class="ov-stat-num">${total}</div>
      <div class="ov-stat-label">总论文数</div>
    </div>
    <div class="ov-stat-card">
      <div class="ov-stat-num">${minYear}–${maxYear}</div>
      <div class="ov-stat-label">年份跨度</div>
    </div>
    <div class="ov-stat-card">
      <div class="ov-stat-num">${avgStars}★</div>
      <div class="ov-stat-label">平均相关度</div>
    </div>
    <div class="ov-stat-card">
      <div class="ov-stat-num">${pdfPct}%</div>
      <div class="ov-stat-label">PDF覆盖率</div>
    </div>
  </div>

  <!-- 类别卡片网格 -->
  <div class="ov-section-title">按类别分布</div>
  <div class="ov-cat-grid">${catCards}</div>

  <!-- 关键洞察 -->
  <div class="ov-section-title">关键洞察</div>
  <div class="ov-insights">
    <div class="ov-insight accent-green">
      <div class="ov-insight-icon">🏛</div>
      <div>
        <div class="ov-insight-title">最早</div>
        <div class="ov-insight-body">OCC 1988 — 奠基性情绪认知理论，至今被广泛引用</div>
      </div>
    </div>
    <div class="ov-insight accent-blue">
      <div class="ov-insight-icon">🚀</div>
      <div>
        <div class="ov-insight-title">最新</div>
        <div class="ov-insight-body">2025年仍有新论文产出，领域持续活跃</div>
      </div>
    </div>
    <div class="ov-insight accent-orange">
      <div class="ov-insight-icon">🔥</div>
      <div>
        <div class="ov-insight-title">核心方法</div>
        <div class="ov-insight-body">${topCatLabel}最受关注（5星最多）</div>
      </div>
    </div>
  </div>

  <!-- Top 5 论文 -->
  <div class="ov-section-title">Top 5 高相关度论文</div>
  <div class="ov-top-list">${top5Html}</div>
</div>`;
}

// ─── Tab 2: 时间线 ─────────────────────────────────────────────────────────────

function buildTimelineTab(papers) {
  const byYear = countByYear(papers);
  const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);
  if (years.length === 0) return '<div class="analysis-empty"><p>无数据</p></div>';

  // SVG 参数
  const W = 800;
  const ROW_H = 28;        // 每年一行的行高
  const LABEL_W = 44;      // 年份标签宽度
  const DOT_R = 7;         // 每篇论文的色点半径
  const PAD = { top: 16, bottom: 16, left: 8, right: 16 };
  const BAR_X = LABEL_W + PAD.left;
  const BAR_W = W - BAR_X - PAD.right;
  const H = PAD.top + years.length * ROW_H + PAD.bottom;

  const svg = makeSvg(W, H);

  // 类别顺序（固定顺序，让颜色稳定）
  const catKeys = Object.keys(CAT_META);

  years.forEach((yr, rowIdx) => {
    const y = PAD.top + rowIdx * ROW_H + ROW_H / 2;
    const papersInYear = byYear[yr];

    // 年份标签
    const label = svgEl('text', {
      x: LABEL_W - 6,
      y: y + 4,
      'text-anchor': 'end',
      'font-size': '11',
      fill: 'var(--text3)',
      'font-family': 'monospace',
    });
    label.textContent = yr;
    svg.appendChild(label);

    // 行背景（奇偶交替）
    if (rowIdx % 2 === 0) {
      svg.appendChild(svgEl('rect', {
        x: BAR_X - 4,
        y: y - ROW_H / 2,
        width: BAR_W + 4,
        height: ROW_H,
        fill: 'var(--bg3)',
        rx: 3,
        opacity: '0.5',
      }));
    }

    // 按类别顺序排列本年论文，画色点
    const sorted = [...papersInYear].sort((a, b) =>
      catKeys.indexOf(a.cat) - catKeys.indexOf(b.cat)
    );
    sorted.forEach((p, idx) => {
      const meta = CAT_META[p.cat] || { color: '#9CA3AF' };
      const cx = BAR_X + idx * (DOT_R * 2 + 3) + DOT_R;
      const cy = y;

      // 彩色圆点
      const circle = svgEl('circle', {
        cx, cy,
        r: DOT_R,
        fill: meta.color,
        opacity: '0.88',
      });

      // tooltip 通过 title 元素
      const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      titleEl.textContent = `${p.title} (${p.year}) [${meta.label}]`;
      circle.appendChild(titleEl);
      svg.appendChild(circle);

      // 若空间够，在点上写首字母
      if (DOT_R >= 6) {
        const t = svgEl('text', {
          x: cx, y: cy + 4,
          'text-anchor': 'middle',
          'font-size': '7',
          fill: '#fff',
          'pointer-events': 'none',
          'font-weight': 'bold',
        });
        t.textContent = (p.cat || '?')[0].toUpperCase();
        svg.appendChild(t);
      }
    });
  });

  // 图例
  const legendY = H - PAD.bottom + 2;
  // 图例放在 SVG 外，用 HTML

  const legendHtml = Object.entries(CAT_META).map(([key, meta]) => `
<span class="tl-legend-item">
  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${meta.color};vertical-align:middle;margin-right:3px"></span>
  ${meta.label}
</span>`).join('');

  return `
<div class="tl-root">
  <div class="tl-desc">每行代表一个年份，彩色圆点表示一篇论文，颜色代表研究类别。</div>
  <div class="tl-legend">${legendHtml}</div>
  <div class="tl-svg-wrap">${svgToHtml(svg)}</div>
  <div class="tl-summary">
    共涵盖 <b>${years.length}</b> 个年份（${years[0]}–${years[years.length - 1]}），
    最密集年份：
    <b>${Object.entries(byYear).sort((a, b) => b[1].length - a[1].length)[0][0]}</b>
    年（${Object.values(byYear).sort((a, b) => b.length - a.length)[0].length} 篇）。
  </div>
</div>`;
}

// ─── Tab 3: 方法分布 ───────────────────────────────────────────────────────────

function buildMethodsTab(papers) {
  const catCounts = countByCategory(papers);
  const total = papers.length;
  const avgStars = avgStarsByCategory(papers);

  // ── 甜甜圈图 ──
  // 过滤掉 0 篇的类别
  const segments = Object.entries(CAT_META)
    .map(([key, meta]) => ({ key, meta, count: catCounts[key] || 0 }))
    .filter(s => s.count > 0);

  const CX = 160, CY = 160, R_OUT = 120, R_IN = 68;
  const W = 560, H = 340;
  const svg = makeSvg(W, H);

  // 计算各扇形 arc path
  let startAngle = -Math.PI / 2; // 从12点钟方向开始
  const arcs = [];
  segments.forEach(seg => {
    const angle = (seg.count / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;

    const x1o = CX + R_OUT * Math.cos(startAngle);
    const y1o = CY + R_OUT * Math.sin(startAngle);
    const x2o = CX + R_OUT * Math.cos(endAngle);
    const y2o = CY + R_OUT * Math.sin(endAngle);
    const x1i = CX + R_IN * Math.cos(endAngle);
    const y1i = CY + R_IN * Math.sin(endAngle);
    const x2i = CX + R_IN * Math.cos(startAngle);
    const y2i = CY + R_IN * Math.sin(startAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const d = [
      `M ${x1o} ${y1o}`,
      `A ${R_OUT} ${R_OUT} 0 ${largeArc} 1 ${x2o} ${y2o}`,
      `L ${x1i} ${y1i}`,
      `A ${R_IN} ${R_IN} 0 ${largeArc} 0 ${x2i} ${y2i}`,
      'Z',
    ].join(' ');

    arcs.push({ ...seg, d, midAngle: (startAngle + endAngle) / 2 });
    startAngle = endAngle;
  });

  // 绘制扇形
  arcs.forEach(arc => {
    const path = svgEl('path', {
      d: arc.d,
      fill: arc.meta.color,
      opacity: '0.9',
      stroke: 'var(--bg2)',
      'stroke-width': '2',
    });
    const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    titleEl.textContent = `${arc.meta.label}: ${arc.count} 篇 (${Math.round(arc.count/total*100)}%)`;
    path.appendChild(titleEl);
    svg.appendChild(path);
  });

  // 中心文字
  const cLabel = svgEl('text', {
    x: CX, y: CY - 8,
    'text-anchor': 'middle',
    'font-size': '26',
    'font-weight': 'bold',
    fill: 'var(--text)',
  });
  cLabel.textContent = total;
  svg.appendChild(cLabel);

  const cSub = svgEl('text', {
    x: CX, y: CY + 12,
    'text-anchor': 'middle',
    'font-size': '11',
    fill: 'var(--text3)',
  });
  cSub.textContent = '篇论文';
  svg.appendChild(cSub);

  // 右侧图例（在 SVG 内）
  const legendX = CX * 2 + 20;
  const lineH = 34;
  segments.forEach((seg, i) => {
    const ly = 30 + i * lineH;
    // 色块
    svg.appendChild(svgEl('rect', {
      x: legendX, y: ly,
      width: 12, height: 12,
      rx: 2,
      fill: seg.meta.color,
    }));
    // 类别名
    const name = svgEl('text', {
      x: legendX + 16, y: ly + 10,
      'font-size': '11',
      fill: 'var(--text)',
    });
    name.textContent = seg.meta.label;
    svg.appendChild(name);
    // 数量
    const num = svgEl('text', {
      x: W - 16, y: ly + 10,
      'text-anchor': 'end',
      'font-size': '11',
      fill: 'var(--text2)',
    });
    num.textContent = `${seg.count} (${Math.round(seg.count/total*100)}%)`;
    svg.appendChild(num);
  });

  // ── 类别平均星级横向条形图 ──
  const barData = Object.entries(CAT_META)
    .map(([key, meta]) => ({
      label: meta.label,
      color: meta.color,
      avg: avgStars[key] || 0,
      count: catCounts[key] || 0,
    }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.avg - a.avg);

  const maxAvg = 5;
  const BW = 800, BH_ROW = 30, BH = 40 + barData.length * BH_ROW;
  const BLABEL = 100, BBAR = BW - BLABEL - 80;
  const bSvg = makeSvg(BW, BH);

  // 标题
  const bTitle = svgEl('text', {
    x: 0, y: 18,
    'font-size': '12',
    'font-weight': '600',
    fill: 'var(--text)',
  });
  bTitle.textContent = '各类别平均相关度（★）';
  bSvg.appendChild(bTitle);

  barData.forEach((d, i) => {
    const y = 30 + i * BH_ROW;
    const barLen = Math.round((d.avg / maxAvg) * BBAR);

    // 标签
    const lbl = svgEl('text', {
      x: BLABEL - 6, y: y + 13,
      'text-anchor': 'end',
      'font-size': '11',
      fill: 'var(--text2)',
    });
    lbl.textContent = d.label;
    bSvg.appendChild(lbl);

    // 背景条
    bSvg.appendChild(svgEl('rect', {
      x: BLABEL, y: y,
      width: BBAR, height: 20,
      rx: 4,
      fill: 'var(--bg3)',
    }));

    // 数值条
    if (barLen > 0) {
      bSvg.appendChild(svgEl('rect', {
        x: BLABEL, y: y,
        width: barLen, height: 20,
        rx: 4,
        fill: d.color,
        opacity: '0.85',
      }));
    }

    // 星值标注
    const val = svgEl('text', {
      x: BLABEL + BBAR + 8, y: y + 14,
      'font-size': '11',
      fill: 'var(--text3)',
    });
    val.textContent = d.avg > 0 ? `${d.avg.toFixed(1)}★` : '—';
    bSvg.appendChild(val);
  });

  return `
<div class="mt-root">
  <div class="mt-donut-wrap">${svgToHtml(svg)}</div>
  <div class="mt-bar-wrap">${svgToHtml(bSvg)}</div>
</div>`;
}

// ─── Tab 4: 关键词 ─────────────────────────────────────────────────────────────

function buildKeywordsTab(papers) {
  const freq = aggregateKeywords(papers);
  if (Object.keys(freq).length === 0) {
    return '<div class="analysis-empty"><p>无关键词数据</p></div>';
  }

  // 按频率排序
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const top30 = sorted.slice(0, 30);
  const top10 = sorted.slice(0, 10);

  const maxFreq = top30[0][1];
  const minFreq = top30[top30.length - 1][1];
  const range = Math.max(maxFreq - minFreq, 1);

  // 词云（CSS 字体大小缩放，无依赖库）
  // 字体大小范围：12px ~ 34px
  const MIN_SIZE = 12, MAX_SIZE = 36;
  const cloudHtml = top30.map(([kw, cnt]) => {
    const ratio = (cnt - minFreq) / range;
    const fontSize = Math.round(MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE));
    const opacity = 0.55 + ratio * 0.45;
    // 颜色：从文字颜色渐变到 accent
    const hue = Math.round(180 + ratio * 60); // 蓝绿系
    return `<span class="kw-cloud-word" style="font-size:${fontSize}px;opacity:${opacity};color:hsl(${hue},60%,42%)"
      title="${cnt} 篇论文包含此关键词">${escHtml(kw)}</span>`;
  }).join(' ');

  // Top 10 横向条形图（SVG）
  const BW = 800, BH_ROW = 28, BH = 36 + top10.length * BH_ROW;
  const BLABEL = 220, BBAR = BW - BLABEL - 70;
  const bSvg = makeSvg(BW, BH);

  // 标题
  const bTitle = svgEl('text', {
    x: 0, y: 18,
    'font-size': '12',
    'font-weight': '600',
    fill: 'var(--text)',
  });
  bTitle.textContent = 'Top 10 高频关键词（出现论文数）';
  bSvg.appendChild(bTitle);

  top10.forEach(([kw, cnt], i) => {
    const y = 26 + i * BH_ROW;
    const barLen = Math.round((cnt / top10[0][1]) * BBAR);

    // 标签
    const lbl = svgEl('text', {
      x: BLABEL - 6, y: y + 14,
      'text-anchor': 'end',
      'font-size': '11',
      fill: 'var(--text)',
    });
    lbl.textContent = kw.length > 28 ? kw.slice(0, 26) + '…' : kw;
    bSvg.appendChild(lbl);

    // 背景
    bSvg.appendChild(svgEl('rect', {
      x: BLABEL, y: y,
      width: BBAR, height: 20,
      rx: 4,
      fill: 'var(--bg3)',
    }));

    // 数值条（用 accent 色系）
    if (barLen > 0) {
      const hue = Math.round(210 - i * 5);
      bSvg.appendChild(svgEl('rect', {
        x: BLABEL, y: y,
        width: barLen, height: 20,
        rx: 4,
        fill: `hsl(${hue},65%,48%)`,
        opacity: '0.82',
      }));
    }

    // 数值
    const num = svgEl('text', {
      x: BLABEL + BBAR + 8, y: y + 14,
      'font-size': '11',
      fill: 'var(--text3)',
    });
    num.textContent = `${cnt} 篇`;
    bSvg.appendChild(num);
  });

  return `
<div class="kw-root">
  <div class="kw-section-title">高频关键词云（Top 30，字号反映频率）</div>
  <div class="kw-cloud">${cloudHtml}</div>
  <div class="kw-section-title" style="margin-top:28px">Top 10 关键词频率</div>
  <div class="kw-bar-wrap">${svgToHtml(bSvg)}</div>
  <div class="kw-total-info">共统计 <b>${Object.keys(freq).length}</b> 个唯一关键词，来自 <b>${papers.length}</b> 篇论文。</div>
</div>`;
}

// ─── Tab 5: PDF 覆盖 ───────────────────────────────────────────────────────────

function buildPdfTab(papers) {
  const total = papers.length;
  const withLocal  = papers.filter(p => p.localPdf).length;
  const withUrlOnly = papers.filter(p => p.pdfUrl && !p.localPdf).length;
  const noInfo     = papers.filter(p => !p.pdfUrl && !p.localPdf).length;

  const pctLocal   = total > 0 ? (withLocal / total * 100).toFixed(1) : 0;
  const pctUrl     = total > 0 ? (withUrlOnly / total * 100).toFixed(1) : 0;
  const pctNo      = total > 0 ? (noInfo / total * 100).toFixed(1) : 0;

  // 堆叠进度条
  const progressBar = `
<div class="pdf-progress-wrap">
  <div class="pdf-progress-bar">
    <div class="pdf-seg seg-local"   style="width:${pctLocal}%"  title="已下载 (${withLocal})"></div>
    <div class="pdf-seg seg-url"     style="width:${pctUrl}%"    title="有链接 (${withUrlOnly})"></div>
    <div class="pdf-seg seg-none"    style="width:${pctNo}%"     title="无信息 (${noInfo})"></div>
  </div>
  <div class="pdf-progress-legend">
    <span><span class="pdf-dot dot-local"></span>已下载 ${withLocal} 篇 (${pctLocal}%)</span>
    <span><span class="pdf-dot dot-url"></span>有链接 ${withUrlOnly} 篇 (${pctUrl}%)</span>
    <span><span class="pdf-dot dot-none"></span>无信息 ${noInfo} 篇 (${pctNo}%)</span>
  </div>
</div>`;

  // 按类别 PDF 覆盖率表格
  const catCoverage = Object.entries(CAT_META).map(([key, meta]) => {
    const catPapers = papers.filter(p => p.cat === key);
    if (catPapers.length === 0) return null;
    const local = catPapers.filter(p => p.localPdf).length;
    const urlOnly = catPapers.filter(p => p.pdfUrl && !p.localPdf).length;
    const none = catPapers.filter(p => !p.pdfUrl && !p.localPdf).length;
    const pct = Math.round((local + urlOnly) / catPapers.length * 100);
    return { key, meta, total: catPapers.length, local, urlOnly, none, pct };
  }).filter(Boolean);

  // 找覆盖率最低的类别（用于 research gap 提示）
  const lowestCoverage = [...catCoverage].sort((a, b) => a.pct - b.pct).slice(0, 2);

  const tableRows = catCoverage.map(c => `
<tr>
  <td><span class="cat-badge" style="background:${c.meta.bg};color:${c.meta.color}">${c.meta.label}</span></td>
  <td class="pdf-tbl-center">${c.total}</td>
  <td class="pdf-tbl-center pdf-col-local">${c.local}</td>
  <td class="pdf-tbl-center pdf-col-url">${c.urlOnly}</td>
  <td class="pdf-tbl-center pdf-col-none">${c.none}</td>
  <td class="pdf-tbl-center">
    <div class="pdf-mini-prog">
      <div style="width:${c.pct}%;background:${c.pct > 60 ? 'var(--success)' : c.pct > 30 ? 'var(--warning)' : 'var(--danger)'}"></div>
    </div>
    <span class="pdf-pct-num" style="color:${c.pct > 60 ? 'var(--success)' : c.pct > 30 ? 'var(--warning)' : 'var(--danger)'}">${c.pct}%</span>
  </td>
</tr>`).join('');

  // 没有 PDF 来源的论文列表
  const noPdf = papers.filter(p => !p.pdfUrl && !p.localPdf);
  const noPdfRows = noPdf.map(p => {
    const cm = CAT_META[p.cat] || {};
    return `
<tr>
  <td><span class="cat-badge sm" style="background:${cm.bg};color:${cm.color}">${cm.label}</span></td>
  <td class="pdf-no-title">${escHtml(p.title)}</td>
  <td>${p.year}</td>
  <td>${p.doi ? `<a href="https://doi.org/${escHtml(p.doi)}" target="_blank" class="doi-sm">DOI</a>` : '—'}</td>
  <td>
    <button class="action-btn sm find-pdf-btn" onclick="findPdfForPaper('${escHtml(p.id)}')" title="自动查找PDF">
      查找PDF
    </button>
  </td>
</tr>`;
  }).join('');

  // Research gap 提示
  const gapHtml = lowestCoverage.length > 0
    ? lowestCoverage.map(c =>
        `<span class="cat-badge" style="background:${c.meta.bg};color:${c.meta.color}">${c.meta.label}</span> 覆盖率仅 ${c.pct}%`
      ).join('，')
    : '全部类别覆盖良好';

  return `
<div class="pdf-root">
  <div class="pdf-section-title">整体 PDF 覆盖情况</div>
  ${progressBar}

  <div class="pdf-section-title" style="margin-top:20px">各类别 PDF 覆盖详情</div>
  <div class="pdf-table-wrap">
    <table class="pdf-cov-table">
      <thead>
        <tr>
          <th>类别</th>
          <th>总计</th>
          <th class="pdf-col-local">已下载</th>
          <th class="pdf-col-url">有链接</th>
          <th class="pdf-col-none">无信息</th>
          <th>覆盖率</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>

  <div class="pdf-gap-callout">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:5px">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <b>PDF获取优先级：</b>${gapHtml}
  </div>

  ${noPdf.length > 0 ? `
  <div class="pdf-section-title" style="margin-top:20px">无PDF来源论文（${noPdf.length} 篇）</div>
  <div class="pdf-table-wrap">
    <table class="pdf-nopdf-table">
      <thead>
        <tr><th>类别</th><th>标题</th><th>年份</th><th>DOI</th><th>操作</th></tr>
      </thead>
      <tbody>${noPdfRows}</tbody>
    </table>
  </div>` : `
  <div class="pdf-all-good">所有论文均已有PDF来源或下载链接！</div>`}
</div>`;
}

// ─── CSS 注入（样式随 JS 一起加载）──────────────────────────────────────────────

(function injectAnalysisStyles() {
  if (document.getElementById('analysis-styles')) return;
  const style = document.createElement('style');
  style.id = 'analysis-styles';
  style.textContent = `
/* ── 覆盖层 ──────────────────────────────────────────────── */
#analysis-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity .2s;
}
#analysis-overlay.visible {
  opacity: 1; pointer-events: all;
}

/* ── 模态框 ──────────────────────────────────────────────── */
.analysis-modal {
  background: var(--bg2);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  width: min(960px, 96vw);
  max-height: 90vh;
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* ── 头部 ────────────────────────────────────────────────── */
.analysis-header {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg2);
  flex-shrink: 0;
}
.analysis-title {
  font-weight: 700; font-size: 15px;
  white-space: nowrap; color: var(--text);
}
.analysis-tabs {
  display: flex; gap: 2px; flex: 1; justify-content: center; flex-wrap: wrap;
}
.atab-btn {
  padding: 5px 14px; border: 1px solid var(--border);
  border-radius: 20px; background: transparent;
  color: var(--text2); font-size: 12px;
  transition: all .15s; cursor: pointer;
}
.atab-btn:hover   { background: var(--bg3); color: var(--text); }
.atab-btn.active  { background: var(--accent); color: #fff; border-color: var(--accent); }

/* ── 主体 ────────────────────────────────────────────────── */
.analysis-body {
  flex: 1; overflow-y: auto; padding: 20px;
}
.analysis-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 200px; color: var(--text3); gap: 10px;
}

/* ════════════════════════════════════════════════
   Tab 1: 概览
   ════════════════════════════════════════════════ */
.ov-root { display: flex; flex-direction: column; gap: 16px; }
.ov-section-title {
  font-size: 12px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .7px; color: var(--text3);
  margin-bottom: 8px; margin-top: 4px;
}
.ov-stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
}
.ov-stat-card {
  background: var(--bg3); border-radius: var(--radius);
  padding: 14px 16px; text-align: center;
}
.ov-stat-num  { font-size: 22px; font-weight: 800; color: var(--text); line-height: 1.2; }
.ov-stat-label{ font-size: 11px; color: var(--text3); margin-top: 3px; }

.ov-cat-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px;
}
.ov-cat-card {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 10px 12px;
}
.ov-cat-name  { font-size: 11px; font-weight: 600; margin-bottom: 4px; }
.ov-cat-count { font-size: 20px; font-weight: 800; color: var(--text); }
.ov-cat-unit  { font-size: 12px; font-weight: 400; color: var(--text3); }
.ov-mini-bar-bg {
  height: 4px; background: var(--border); border-radius: 2px;
  margin-top: 6px; overflow: hidden;
}
.ov-mini-bar  { height: 4px; border-radius: 2px; transition: width .4s; }

.ov-insights  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.ov-insight   {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 14px; border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}
.ov-insight.accent-green  { border-left: 3px solid #059669; background: #F0FDF4; }
.ov-insight.accent-blue   { border-left: 3px solid #2563EB; background: #EFF6FF; }
.ov-insight.accent-orange { border-left: 3px solid #D97706; background: #FFFBEB; }
[data-theme="dark"] .ov-insight.accent-green  { background: #052e16; }
[data-theme="dark"] .ov-insight.accent-blue   { background: #1e3a5f; }
[data-theme="dark"] .ov-insight.accent-orange { background: #3b1a00; }
.ov-insight-icon  { font-size: 18px; line-height: 1; flex-shrink: 0; }
.ov-insight-title { font-size: 11px; font-weight: 700; color: var(--text2); }
.ov-insight-body  { font-size: 12px; color: var(--text); margin-top: 2px; line-height: 1.5; }

.ov-top-list  { display: flex; flex-direction: column; gap: 6px; }
.ov-top-row   {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px; background: var(--bg3);
  border-radius: var(--radius-sm); font-size: 12px;
}
.ov-rank      { font-weight: 800; color: var(--text3); width: 16px; flex-shrink: 0; }
.ov-top-cat   {
  font-size: 10px; padding: 1px 6px; border-radius: 10px;
  font-weight: 600; white-space: nowrap; flex-shrink: 0;
}
.ov-top-year  { color: var(--text3); font-size: 11px; flex-shrink: 0; width: 32px; }
.ov-top-title { flex: 1; color: var(--text); overflow: hidden;
                text-overflow: ellipsis; white-space: nowrap; }
.ov-top-stars { color: #F59E0B; font-size: 11px; white-space: nowrap; flex-shrink: 0; }

/* ════════════════════════════════════════════════
   Tab 2: 时间线
   ════════════════════════════════════════════════ */
.tl-root      { display: flex; flex-direction: column; gap: 12px; }
.tl-desc      { font-size: 12px; color: var(--text3); }
.tl-legend    { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 11px; color: var(--text2); }
.tl-legend-item { white-space: nowrap; }
.tl-svg-wrap  {
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--bg); padding: 8px; overflow-x: auto;
}
.tl-summary   { font-size: 12px; color: var(--text2); }

/* ════════════════════════════════════════════════
   Tab 3: 方法分布
   ════════════════════════════════════════════════ */
.mt-root      { display: flex; flex-direction: column; gap: 20px; }
.mt-donut-wrap, .mt-bar-wrap {
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--bg); padding: 12px; overflow-x: auto;
}

/* ════════════════════════════════════════════════
   Tab 4: 关键词
   ════════════════════════════════════════════════ */
.kw-root      { display: flex; flex-direction: column; gap: 10px; }
.kw-section-title {
  font-size: 12px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .7px; color: var(--text3);
}
.kw-cloud     {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 20px 24px;
  line-height: 2.2; text-align: center;
}
.kw-cloud-word {
  display: inline-block; margin: 0 5px;
  cursor: default; transition: opacity .2s;
  font-weight: 500;
}
.kw-cloud-word:hover { opacity: 1 !important; text-decoration: underline dotted; }
.kw-bar-wrap  {
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--bg); padding: 12px; overflow-x: auto;
}
.kw-total-info { font-size: 11px; color: var(--text3); }

/* ════════════════════════════════════════════════
   Tab 5: PDF 覆盖
   ════════════════════════════════════════════════ */
.pdf-root       { display: flex; flex-direction: column; gap: 10px; }
.pdf-section-title {
  font-size: 12px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .7px; color: var(--text3);
}
.pdf-progress-wrap { display: flex; flex-direction: column; gap: 8px; }
.pdf-progress-bar  {
  height: 24px; border-radius: 12px; overflow: hidden;
  display: flex; background: var(--bg3);
}
.pdf-seg       { height: 100%; transition: width .5s; }
.seg-local     { background: var(--success); }
.seg-url       { background: var(--warning); }
.seg-none      { background: var(--border2); }
.pdf-progress-legend {
  display: flex; gap: 16px; font-size: 12px; color: var(--text2);
  flex-wrap: wrap;
}
.pdf-dot       {
  display: inline-block; width: 10px; height: 10px;
  border-radius: 50%; vertical-align: middle; margin-right: 4px;
}
.dot-local     { background: var(--success); }
.dot-url       { background: var(--warning); }
.dot-none      { background: var(--border2); }

.pdf-table-wrap  { overflow-x: auto; }
.pdf-cov-table, .pdf-nopdf-table {
  width: 100%; border-collapse: collapse; font-size: 12px;
}
.pdf-cov-table th, .pdf-nopdf-table th {
  text-align: left; padding: 6px 10px;
  background: var(--bg3); color: var(--text2);
  border-bottom: 1px solid var(--border);
  font-weight: 600; font-size: 11px;
}
.pdf-cov-table td, .pdf-nopdf-table td {
  padding: 6px 10px; border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.pdf-tbl-center { text-align: center; }
.pdf-col-local  { color: var(--success) !important; }
.pdf-col-url    { color: var(--warning) !important; }
.pdf-col-none   { color: var(--danger)  !important; }
.pdf-mini-prog  {
  display: inline-block; width: 60px; height: 6px;
  background: var(--bg3); border-radius: 3px; overflow: hidden;
  vertical-align: middle; margin-right: 4px;
}
.pdf-mini-prog > div { height: 100%; border-radius: 3px; }
.pdf-pct-num    { font-size: 11px; font-weight: 600; }
.pdf-no-title   { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.doi-sm         { font-size: 10px; padding: 1px 5px; background: var(--bg3); border-radius: 4px; }
.find-pdf-btn   {
  font-size: 11px; padding: 3px 8px;
  background: var(--accent); color: #fff;
  border: none; border-radius: var(--radius-sm); cursor: pointer;
  transition: opacity .15s;
}
.find-pdf-btn:hover { opacity: .85; }
.pdf-gap-callout {
  padding: 10px 14px; background: var(--accent-bg);
  border-radius: var(--radius-sm); border-left: 3px solid var(--accent);
  font-size: 12px; color: var(--text);
}
.pdf-all-good {
  padding: 12px 16px; background: #F0FDF4;
  border-radius: var(--radius-sm); color: var(--success);
  font-size: 12px; font-weight: 600;
}
[data-theme="dark"] .pdf-all-good { background: #052e16; }

/* ── 响应式适配 ──────────────────────────────────────────── */
@media (max-width: 640px) {
  .ov-stats-row    { grid-template-columns: 1fr 1fr; }
  .ov-insights     { grid-template-columns: 1fr; }
  .analysis-tabs   { gap: 4px; }
  .atab-btn        { padding: 4px 10px; font-size: 11px; }
}
`;
  document.head.appendChild(style);
})();
