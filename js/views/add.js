import * as store from '../store.js';
import { searchLocal, BUILTIN, foodEmoji } from '../foods.js';
import { ICON } from '../icons.js';
import { RESTAURANTS, foodsOf } from '../restaurants.js';
import { searchOFF, lookupBarcode } from '../off.js';
import { startBarcodeScan, readLabel } from '../scan.js';
import { t } from '../i18n.js';
import { esc, sheet, toast, num, fmt } from '../ui.js';
import { openFoodSheet, defaultMeal, MEALS } from './foodsheet.js';
import { recipeAsFood } from './recipe.js';

let tab = 'search';
let restaurant = RESTAURANTS[0].id;

export function allMyFoods(st) {
  return [...st.customFoods, ...st.recipes.map(recipeAsFood)];
}
export function findFood(st, id) {
  return allMyFoods(st).find(f => f.id === id) || BUILTIN.find(f => f.id === id) || st.recents.find(f => f.id === id);
}

export function renderAdd(root, params) {
  const date = params.get('date') || store.todayKey();
  const meal = params.get('meal') || defaultMeal();
  const st = store.get();
  const dayHash = date === store.todayKey() ? '#/today' : `#/today?date=${date}`;
  const after = () => { location.hash = dayHash; };
  const open = f => openFoodSheet(f, { date, meal, onDone: after });

  root.innerHTML = `
  <header class="page-head"><a class="icon-btn" href="${dayHash}" aria-label="${t('back')}">${ICON.chevL}</a>
    <h2>${t('add_to')} ${t(meal)}</h2></header>
  <div class="tools">
    <button class="tool" data-act="barcode"><span class="ti">${ICON.barcode}</span>${t('scan_barcode')}</button>
    <button class="tool" data-act="label"><span class="ti">${ICON.camera}</span>${t('scan_label')}</button>
    <button class="tool" data-act="quick"><span class="ti">${ICON.bolt}</span>${t('quick_add')}</button>
    <button class="tool" data-act="create"><span class="ti">${ICON.pencil}</span>${t('create_food')}</button>
  </div>
  <div class="search-box">${ICON.search}<input id="q" type="search" placeholder="${t('search_ph')}" autocomplete="off" enterkeyhint="search"></div>
  <div class="tabs" role="tablist">
    ${['search', 'restaurants', 'favorites', 'mine'].map(k => `<button role="tab" class="${tab === k ? 'on' : ''}" data-tab="${k}">${t('tab_' + k)}</button>`).join('')}
  </div>
  <div id="results"></div>
  <div id="online"></div>`;

  const q = root.querySelector('#q');
  const results = root.querySelector('#results');
  const online = root.querySelector('#online');

  const row = f => `<button class="food-row" data-id="${esc(f.id)}">
      <span class="tile" aria-hidden="true">${foodEmoji(f)}</span>
      <span class="grow"><b>${esc(f.name)}</b><small class="muted">${esc(f.serving || '')}</small></span>
      <span class="kcal">${f.source === 'restaurant' && !f.official ? '<small>≈ </small>' : ''}${fmt(f.kcal)}<small> kcal</small></span></button>`;
  const pool = new Map();
  const list = (items, empty) => {
    items.forEach(f => pool.set(f.id, f));
    return items.length ? items.map(row).join('') : `<p class="empty">${empty}</p>`;
  };

  let ctrl, timer;
  const draw = () => {
    const query = q.value.trim();
    const s = store.get();
    const mine = allMyFoods(s).filter(f => !f.hidden);
    online.innerHTML = '';
    if (tab === 'restaurants') {
      const r = RESTAURANTS.find(x => x.id === restaurant);
      const items = foodsOf(restaurant).filter(f => !query || f.name.toLowerCase().includes(query.toLowerCase()));
      results.innerHTML = `
        <div class="rest-tabs" role="tablist" aria-label="${t('tab_restaurants')}">
          ${RESTAURANTS.map(x => `<button role="tab" aria-selected="${x.id === restaurant}" class="rest-tab ${x.id === restaurant ? 'on' : ''}" data-rest="${x.id}">
            <span class="rest-badge" style="--tint:${x.tint}">${esc(x.name.replace(/[^A-Za-z ]/g, '').split(' ').map(w => w[0]).join('').slice(0, 2))}</span>
            <span>${esc(x.name)}</span></button>`).join('')}
        </div>
        <p class="rest-note small muted">${t(r.items.some(i => i[6] === 'us') ? 'rest_note_mixed' : 'rest_note_est', { name: r.name })}</p>
        ${list(items, t('no_results'))}`;
      results.querySelectorAll('[data-rest]').forEach(b => b.onclick = e => {
        e.stopPropagation(); restaurant = b.dataset.rest; draw();
        results.querySelector('.rest-tab.on')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      });
    } else if (tab === 'favorites') {
      const favs = s.favorites.map(id => findFood(s, id)).filter(Boolean)
        .filter(f => !query || f.name.toLowerCase().includes(query.toLowerCase()));
      results.innerHTML = list(favs, t('no_favorites'));
    } else if (tab === 'mine') {
      const items = mine.filter(f => !query || f.name.toLowerCase().includes(query.toLowerCase()));
      results.innerHTML = list(items, t('no_my_foods')) +
        `<a class="btn ghost block" href="#/recipe?date=${date}&meal=${meal}">+ ${t('new_recipe')}</a>`;
    } else {
      if (!query && s.recents.length) {
        results.innerHTML = `<h4 class="list-head">${t('recent')}</h4>` + list(s.recents.slice(0, 12), '') +
          `<h4 class="list-head">${t('filipino_foods')}</h4>` + list(searchLocal('', []).slice(0, 15), '');
      } else {
        results.innerHTML = list(searchLocal(query, mine), query ? t('no_local') : '');
      }
      clearTimeout(timer); ctrl?.abort();
      if (query.length >= 3) {
        if (!navigator.onLine) { online.innerHTML = `<p class="empty">${t('offline_search')}</p>`; return; }
        online.innerHTML = `<h4 class="list-head">${t('packaged_foods')}</h4><p class="empty">${t('searching')}…</p>`;
        timer = setTimeout(async () => {
          ctrl = new AbortController();
          try {
            const items = await searchOFF(query, ctrl.signal);
            online.innerHTML = `<h4 class="list-head">${t('packaged_foods')}</h4>` + list(items, t('no_results'));
          } catch (e) {
            if (e.name !== 'AbortError') online.innerHTML = `<p class="empty">${t('search_failed')}</p>`;
          }
        }, 500);
      }
    }
  };
  q.oninput = draw;
  root.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; renderAdd(root, params); });
  // handlers live on elements re-created each render, so they never stack up
  results.onclick = online.onclick = e => {
    const r = e.target.closest('.food-row');
    if (r && pool.has(r.dataset.id)) open(pool.get(r.dataset.id));
  };
  draw();

  root.querySelector('[data-act="barcode"]').onclick = () => barcodeSheet(open);
  root.querySelector('[data-act="label"]').onclick = () => labelSheet(open);
  if (tab === 'restaurants') q.placeholder = t('search_in_rest');
  root.querySelector('[data-act="quick"]').onclick = () => quickAddSheet(date, meal, after);
  root.querySelector('[data-act="create"]').onclick = () => foodFormSheet({}, open);
}

function barcodeSheet(open) {
  let stop = null;
  const s = sheet(`
    <h3 class="sheet-title">${t('scan_barcode')}</h3>
    <div class="scanner" data-scan><p class="muted small center">${t('camera_starting')}</p></div>
    <form class="row gap" data-manual>
      <input name="code" inputmode="numeric" placeholder="${t('type_barcode')}" class="grow">
      <button class="btn">${t('find')}</button>
    </form>
    <p class="muted small" data-status></p>`, { onClose: () => stop?.() });
  const status = s.el.querySelector('[data-status]');
  const box = s.el.querySelector('[data-scan]');

  const handle = async code => {
    code = String(code).trim();
    if (!code) return;
    stop?.(); stop = null;
    const st = store.get();
    const mine = st.customFoods.find(f => f.barcode === code);
    if (mine) { s.close(); open(mine); return; }
    status.textContent = `${t('looking_up')} ${code}…`;
    try {
      const r = await lookupBarcode(code);
      s.close();
      if (r?.food) { open({ ...r.food, barcode: code }); return; }
      const prefill = { barcode: code, name: r?.partial?.name || '' };
      foodFormSheet(prefill, open, r?.partial ? t('barcode_no_nutrition') : t('barcode_not_found'), { onLabel: () => labelSheet(open, prefill) });
    } catch {
      status.textContent = navigator.onLine ? t('search_failed') : t('offline_barcode');
    }
  };

  s.el.querySelector('[data-manual]').onsubmit = e => { e.preventDefault(); handle(new FormData(e.target).get('code')); };

  if (!navigator.mediaDevices?.getUserMedia) {
    box.innerHTML = `<p class="muted small center">${t('no_camera')}</p>`;
    return;
  }
  startBarcodeScan(box, handle)
    .then(fn => { stop = fn; box.querySelector('p')?.remove(); })
    .catch(err => {
      console.warn(err);
      box.innerHTML = `<p class="muted small center">${t('camera_denied')}</p>`;
    });
}

function labelSheet(open, base = {}) {
  const s = sheet(`
    <h3 class="sheet-title">${t('scan_label')}</h3>
    <ul class="tips small">${[1, 2, 3, 4].map(i => `<li>${t('label_tip_' + i)}</li>`).join('')}</ul>
    <label class="btn block file-btn">📷 ${t('take_photo')}
      <input type="file" accept="image/*" capture="environment" hidden data-file></label>
    <div data-progress></div>`);
  s.el.querySelector('[data-file]').onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const prog = s.el.querySelector('[data-progress]');
    prog.innerHTML = `<p class="muted small" data-msg>${t('reading_label')} 0%</p><div class="bar"><span data-bar style="width:0"></span></div>`;
    const photoUrl = URL.createObjectURL(file);
    try {
      const v = await readLabel(file, ({ pass, progress }) => {
        const pct = Math.round(progress * 100);
        const me = prog.querySelector('[data-msg]'), be = prog.querySelector('[data-bar]');
        if (me) me.textContent = `${pass === 2 ? t('reading_label_2') : t('reading_label')} ${pct}%`;
        if (be) be.style.width = pct + '%';
      });
      s.close();
      const found = ['kcal', 'protein', 'carbs', 'fat'].filter(k => v[k] != null).length;
      const note = !found ? t('label_none') : v.uncertain.length ? t('label_check_marked') : t('label_check');
      foodFormSheet({ ...base, ...v, name: base.name || '', serving: v.serving || '', photoUrl }, open, note);
    } catch (err) {
      console.warn(err);
      prog.innerHTML = `<p class="error">${t('label_failed')}</p>`;
    }
  };
}

/** Create / edit a custom food. prefill may contain name, serving, kcal, protein, carbs, fat, barcode, id */
export function foodFormSheet(prefill = {}, onSaved, note = '', { onLabel } = {}) {
  const v = k => prefill[k] ?? '';
  const s = sheet(`
    <h3 class="sheet-title">${prefill.id ? t('edit_food') : t('create_food')}</h3>
    ${note ? `<p class="note">${esc(note)}</p>` : ''}
    ${prefill.photoUrl ? `<img class="label-photo" src="${prefill.photoUrl}" alt="${t('your_photo')}">` : ''}
    ${onLabel ? `<button type="button" class="btn mango block" data-label>${ICON.camera} ${t('scan_label_instead')}</button>` : ''}
    <form class="form" data-form>
      <label>${t('food_name')}<input name="name" required value="${esc(v('name'))}" placeholder="${t('food_name_ph')}"></label>
      <label>${t('serving_size')}<input name="serving" value="${esc(v('serving'))}" placeholder="1 cup / 100 g"></label>
      <div class="grid2">
        <label class="${(prefill.uncertain || []).includes('kcal') ? 'check-me' : ''}">kcal<input name="kcal" type="number" inputmode="decimal" step="any" min="0" required value="${v('kcal')}"></label>
        <label class="${(prefill.uncertain || []).includes('protein') ? 'check-me' : ''}">${t('protein')} (g)<input name="protein" type="number" inputmode="decimal" step="any" min="0" value="${v('protein')}"></label>
        <label class="${(prefill.uncertain || []).includes('carbs') ? 'check-me' : ''}">${t('carbs')} (g)<input name="carbs" type="number" inputmode="decimal" step="any" min="0" value="${v('carbs')}"></label>
        <label class="${(prefill.uncertain || []).includes('fat') ? 'check-me' : ''}">${t('fat')} (g)<input name="fat" type="number" inputmode="decimal" step="any" min="0" value="${v('fat')}"></label>
      </div>
      <label>${t('barcode_opt')}<input name="barcode" inputmode="numeric" value="${esc(v('barcode'))}"></label>
      <div class="row gap">
        ${prefill.id ? `<button type="button" class="btn danger ghost" data-del>${t('delete')}</button>` : ''}
        <button class="btn grow">${t('save')}</button>
      </div>
    </form>`);
  s.el.querySelector('[data-label]')?.addEventListener('click', () => { s.close(); onLabel(); });
  s.el.querySelector('[data-del]')?.addEventListener('click', () => {
    store.update(st => {
      st.customFoods = st.customFoods.filter(f => f.id !== prefill.id);
      st.favorites = st.favorites.filter(id => id !== prefill.id);
    });
    s.close(); toast(t('deleted'));
    onSaved?.(null);
  });
  s.el.querySelector('[data-form]').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const food = {
      id: prefill.id || 'my:' + store.uid(),
      name: f.get('name').trim(), serving: f.get('serving').trim() || '1 serving',
      kcal: num(f.get('kcal')), protein: num(f.get('protein')), carbs: num(f.get('carbs')), fat: num(f.get('fat')),
      barcode: f.get('barcode').trim() || undefined, source: 'mine',
    };
    store.update(st => {
      const i = st.customFoods.findIndex(x => x.id === food.id);
      if (i >= 0) st.customFoods[i] = food; else st.customFoods.push(food);
    });
    s.close();
    toast(t('food_saved'));
    onSaved?.(food);
  };
}

function quickAddSheet(date, meal, after) {
  const s = sheet(`
    <h3 class="sheet-title">${t('quick_add')}</h3>
    <form class="form" data-form>
      <label>${t('label_opt')}<input name="name" placeholder="${t('quick_ph')}"></label>
      <div class="grid2">
        <label>kcal<input name="kcal" type="number" inputmode="decimal" min="0" required></label>
        <label>${t('protein')} (g)<input name="protein" type="number" inputmode="decimal" min="0"></label>
        <label>${t('carbs')} (g)<input name="carbs" type="number" inputmode="decimal" min="0"></label>
        <label>${t('fat')} (g)<input name="fat" type="number" inputmode="decimal" min="0"></label>
      </div>
      <label>${t('meal')}<select name="meal">${MEALS.map(m => `<option value="${m}" ${m === meal ? 'selected' : ''}>${t(m)}</option>`).join('')}</select></label>
      <button class="btn block">${t('add_to_log')}</button>
    </form>`);
  s.el.querySelector('[data-form]').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    store.update(st => {
      (st.log[date] ||= []).push({
        id: store.uid(), time: Date.now(), foodId: null, name: f.get('name').trim() || t('quick_add'), serving: t('quick_add'),
        kcal: num(f.get('kcal')), protein: num(f.get('protein')), carbs: num(f.get('carbs')), fat: num(f.get('fat')),
        qty: 1, meal: f.get('meal'),
      });
    });
    s.close(); toast(t('added')); after();
  };
}
