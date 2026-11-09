// Small UI helpers shared by all views.
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const fmt = n => (Math.round(n) || 0).toLocaleString();
export const fmt1 = n => (Math.round((n || 0) * 10) / 10).toString();

export function toast(msg, ms = 2200) {
  document.querySelectorAll('.toast').forEach(x => x.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, ms);
}

/** Bottom sheet. Returns { el, close }. onClose runs when dismissed. */
export function sheet(html, { onClose } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'sheet-wrap';
  wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="sheet-grip"></div>${html}</div>`;
  document.body.appendChild(wrap);
  document.body.classList.add('no-scroll');
  requestAnimationFrame(() => wrap.classList.add('open'));
  let closed = false;
  const close = () => {
    if (closed) return; closed = true;
    document.removeEventListener('keydown', onKey);
    wrap.classList.remove('open');
    document.body.classList.remove('no-scroll');
    setTimeout(() => wrap.remove(), 250);
    onClose?.();
  };
  const onKey = e => { if (e.key === 'Escape' && wrap === [...document.querySelectorAll('.sheet-wrap')].pop()) close(); };
  wrap.addEventListener('click', e => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
  window.addEventListener('hashchange', close, { once: true });
  document.addEventListener('keydown', onKey);
  return { el: wrap.querySelector('.sheet'), close };
}

export function confirmSheet(message, okLabel, cancelLabel) {
  return new Promise(resolve => {
    let answered = false;
    const s = sheet(`<p class="confirm-msg">${esc(message)}</p>
      <div class="row gap"><button class="btn ghost grow" data-close>${esc(cancelLabel)}</button>
      <button class="btn danger grow" data-ok>${esc(okLabel)}</button></div>`, { onClose: () => { if (!answered) resolve(false); } });
    s.el.querySelector('[data-ok]').onclick = () => { answered = true; resolve(true); s.close(); };
  });
}

/** Circular progress ring as SVG. */
export function ring(value, max, { size = 168, stroke = 14, label = '', sub = '', over = false } = {}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return `<svg class="ring ${over ? 'over' : ''}" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${esc(label)} ${esc(sub)}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg" stroke-width="${stroke}" fill="none"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" stroke-width="${stroke}" fill="none"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" stroke-linecap="round" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <text x="50%" y="47%" text-anchor="middle" class="ring-num">${esc(label)}</text>
    <text x="50%" y="62%" text-anchor="middle" class="ring-sub">${esc(sub)}</text>
  </svg>`;
}

export function bar(value, max, cls = '') {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return `<div class="bar ${cls} ${value > max ? 'over' : ''}"><span style="width:${pct}%"></span></div>`;
}

/** Simple SVG line chart. points: [{x: label, y: number}] */
export function lineChart(points, { height = 160, target = null, unit = '' } = {}) {
  if (points.length < 2) return '';
  const w = 320, pad = { l: 34, r: 10, t: 12, b: 22 };
  const ys = points.map(p => p.y).concat(target != null ? [target] : []);
  let min = Math.min(...ys), max = Math.max(...ys);
  if (max - min < 1) { min -= 1; max += 1; }
  const span = max - min; min -= span * 0.1; max += span * 0.1;
  const X = i => pad.l + (i / (points.length - 1)) * (w - pad.l - pad.r);
  const Y = v => pad.t + (1 - (v - min) / (max - min)) * (height - pad.t - pad.b);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
  const ticks = [max, (max + min) / 2, min].map(v => `<text x="${pad.l - 6}" y="${Y(v) + 4}" text-anchor="end" class="axis">${Math.round(v)}</text>`).join('');
  const first = points[0].x, last = points[points.length - 1].x;
  return `<svg class="chart" viewBox="0 0 ${w} ${height}" preserveAspectRatio="none" role="img">
    ${ticks}
    ${target != null ? `<line x1="${pad.l}" x2="${w - pad.r}" y1="${Y(target)}" y2="${Y(target)}" class="target"/>` : ''}
    <path d="${d}" class="line" fill="none"/>
    ${points.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.y)}" r="3" class="dot"><title>${esc(p.x)}: ${p.y}${unit}</title></circle>`).join('')}
    <text x="${pad.l}" y="${height - 4}" class="axis">${esc(first)}</text>
    <text x="${w - pad.r}" y="${height - 4}" text-anchor="end" class="axis">${esc(last)}</text>
  </svg>`;
}

/** Simple SVG bar chart. bars: [{x, y}] */
export function barChart(bars, { height = 160, target = null } = {}) {
  const w = 320, pad = { l: 34, r: 6, t: 10, b: 22 };
  const max = Math.max(1, target || 0, ...bars.map(b => b.y)) * 1.1;
  const bw = (w - pad.l - pad.r) / bars.length;
  const Y = v => pad.t + (1 - v / max) * (height - pad.t - pad.b);
  return `<svg class="chart" viewBox="0 0 ${w} ${height}" preserveAspectRatio="none" role="img">
    <text x="${pad.l - 6}" y="${Y(max / 1.1) + 4}" text-anchor="end" class="axis">${Math.round(max / 1.1)}</text>
    <text x="${pad.l - 6}" y="${Y(0) + 4}" text-anchor="end" class="axis">0</text>
    ${bars.map((b, i) => {
      const x = pad.l + i * bw + bw * 0.18, h = Y(0) - Y(b.y);
      const over = target && b.y > target * 1.05;
      return `<rect x="${x}" y="${Y(b.y)}" width="${bw * 0.64}" height="${Math.max(0, h)}" rx="3" class="bar-rect ${over ? 'over' : ''} ${b.y ? '' : 'empty'}"><title>${esc(b.x)}: ${Math.round(b.y)}</title></rect>
      ${bars.length <= 10 ? `<text x="${x + bw * 0.32}" y="${height - 6}" text-anchor="middle" class="axis">${esc(b.x)}</text>` : ''}`;
    }).join('')}
    ${target ? `<line x1="${pad.l}" x2="${w - pad.r}" y1="${Y(target)}" y2="${Y(target)}" class="target"/>` : ''}
  </svg>`;
}

export function num(v, fallback = 0) {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}
