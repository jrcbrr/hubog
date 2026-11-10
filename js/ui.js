// Small UI helpers shared by all views.
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const fmt = n => (Math.round(n) || 0).toLocaleString();
export const fmt1 = n => (Math.round((n || 0) * 10) / 10).toString();

// Id of the item just added, so its row can glow in once (Today)
export const fresh = { id: null };

/** Short vibration on supported phones (Android). */
export const haptic = (ms = 12) => { try { navigator.vibrate?.(ms); } catch { /* not supported */ } };

export function toast(msg, ms = 2200) {
  document.querySelectorAll('.toast').forEach(x => x.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
  el.append(document.createTextNode(msg));
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
  enableSwipeDown(wrap.querySelector('.sheet'), close);
  return { el: wrap.querySelector('.sheet'), close };
}

/** Drag a sheet down (from its top, when not scrolled) to close it, like a native bottom sheet. */
function enableSwipeDown(el, close) {
  let y0 = null, dy = 0, t0 = 0;
  el.addEventListener('pointerdown', e => {
    if (el.scrollTop > 0 || e.target.closest('input, select, textarea, button, a, .act-grid, .rest-tabs')) return;
    y0 = e.clientY; dy = 0; t0 = performance.now();
    el.style.transition = 'none';
  });
  el.addEventListener('pointermove', e => {
    if (y0 == null) return;
    dy = Math.max(0, e.clientY - y0);
    el.style.transform = `translateY(${dy}px)`;
  });
  const end = () => {
    if (y0 == null) return;
    const fast = dy > 40 && dy / (performance.now() - t0) > 0.5;
    el.style.transition = ''; el.style.transform = '';
    y0 = null;
    if (dy > 110 || fast) close();
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}

/** Ripple from the touch point on buttons, tiles and rows. Call once at startup. */
export function initRipples() {
  const SEL = '.btn, .tool, .fchip, .rest-tab, .act-opt, .food-row, .entry, .add-link, .cardio-cta, .goal-inner, .history-row, .check';
  document.addEventListener('pointerdown', e => {
    if (reduceMotion()) return;
    const el = e.target.closest(SEL);
    if (!el || el.disabled) return;
    const r = el.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.2;
    const dot = document.createElement('span');
    dot.className = 'ripple';
    dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    el.appendChild(dot);
    setTimeout(() => dot.remove(), 650);
  }, { passive: true });
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
export function ring(value, max, { size = 168, stroke = 14, label = '', sub = '', over = false, fromPct = null, count = null } = {}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const start = fromPct == null ? pct : fromPct;
  return `<svg class="ring ${over ? 'over' : ''} ${pct >= 1 && !over ? 'full' : ''}" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${esc(label)} ${esc(sub)}">
    <defs><linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#9EDCFF"/></linearGradient></defs>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg" stroke-width="${stroke}" fill="none"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" stroke="url(#ring-grad)" stroke-width="${stroke}" fill="none"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - start)}" data-to="${c * (1 - pct)}" stroke-linecap="round" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <text x="50%" y="47%" text-anchor="middle" class="ring-num" ${count ? `data-from="${Math.round(count[0])}" data-count="${Math.round(count[1])}"` : ''}>${esc(label)}</text>
    <text x="50%" y="62%" text-anchor="middle" class="ring-sub">${esc(sub)}</text>
  </svg>`;
}

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Move rings from where they were drawn (data-from) to their real value (data-to). */
export function playRings(root) {
  const rings = root.querySelectorAll('.ring-fg[data-to]');
  if (reduceMotion()) { rings.forEach(el => el.setAttribute('stroke-dashoffset', el.dataset.to)); return; }
  requestAnimationFrame(() => requestAnimationFrame(() => rings.forEach(el => el.setAttribute('stroke-dashoffset', el.dataset.to))));
}

/** Count numbers up/down from data-from to data-count. */
export function playCounts(root, ms = 700) {
  root.querySelectorAll('[data-count]').forEach(el => {
    const from = Number(el.dataset.from) || 0, to = Number(el.dataset.count) || 0;
    if (from === to || reduceMotion()) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (p < 1 && el.isConnected) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/** A few emoji float out from an element (water goal, workout done…). */
export function burst(el, emoji = '✨', n = 8) {
  if (!el || reduceMotion()) return;
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.5, d = 40 + Math.random() * 40;
    s.className = 'burst'; s.textContent = emoji;
    s.style.left = cx - 10 + 'px'; s.style.top = cy - 10 + 'px';
    s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d - 20 + 'px');
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }
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
    <path d="${d}" class="line" fill="none" pathLength="1"/>
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
      return `<rect x="${x}" y="${Y(b.y)}" width="${bw * 0.64}" height="${Math.max(0, h)}" rx="3" style="--d:${i}" class="bar-rect ${over ? 'over' : ''} ${b.y ? '' : 'empty'}"><title>${esc(b.x)}: ${Math.round(b.y)}</title></rect>
      ${bars.length <= 10 ? `<text x="${x + bw * 0.32}" y="${height - 6}" text-anchor="middle" class="axis">${esc(b.x)}</text>` : ''}`;
    }).join('')}
    ${target ? `<line x1="${pad.l}" x2="${w - pad.r}" y1="${Y(target)}" y2="${Y(target)}" class="target"/>` : ''}
  </svg>`;
}

export function num(v, fallback = 0) {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : fallback;
}
