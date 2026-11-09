// Bottom sheet for adding a food to the log, or editing an existing log entry.
import * as store from '../store.js';
import { t } from '../i18n.js';
import { esc, sheet, toast, num, fmt, fmt1 } from '../ui.js';
import { foodEmoji } from '../foods.js';
import { ICON } from '../icons.js';

export const MEALS = ['breakfast', 'lunch', 'dinner', 'snacks'];

export function defaultMeal() {
  const h = new Date().getHours();
  return h < 10 ? 'breakfast' : h < 15 ? 'lunch' : h < 21 ? 'dinner' : 'snacks';
}

/**
 * food: { id, name, serving, kcal, protein, carbs, fat, per100? }
 * opts: { date, meal, entry (existing entry to edit), onDone }
 */
export function openFoodSheet(food, { date = store.todayKey(), meal = defaultMeal(), entry = null, onDone } = {}) {
  const st = store.get();
  const isFav = st.favorites.includes(food.id);
  const qty0 = entry?.qty ?? 1;
  const canGrams = !!food.per100;

  const s = sheet(`
    <div class="sheet-food">
      <span class="tile" aria-hidden="true">${foodEmoji(food)}</span>
      <div class="grow"><h3 class="sheet-title">${esc(food.name)}</h3>
      <p class="muted small">${esc(food.serving || '')}${food.source === 'builtin' ? ', ' + t('approx') : ''}${food.source === 'off' ? ', Open Food Facts' : ''}</p></div>
      ${food.id && !entry ? `<button class="icon-btn fav ${isFav ? 'on' : ''}" data-fav aria-label="${t('favorite')}" aria-pressed="${isFav}">${ICON.star}</button>` : ''}
    </div>
    <div class="nutri-preview" data-preview></div>
    <div class="grid2">
      <label>${t('servings')}
        <div class="stepper"><button type="button" data-step="-0.5">−</button>
        <input data-qty type="number" inputmode="decimal" step="0.25" min="0.25" value="${qty0}">
        <button type="button" data-step="0.5">+</button></div>
      </label>
      ${canGrams ? `<label>${t('or_grams')}<input data-grams type="number" inputmode="decimal" min="1" placeholder="g"></label>` : '<span></span>'}
    </div>
    <label>${t('meal')}<select data-meal>${MEALS.map(m => `<option value="${m}" ${(entry?.meal || meal) === m ? 'selected' : ''}>${t(m)}</option>`).join('')}</select></label>
    <div class="row gap">
      ${entry ? `<button class="btn danger ghost" data-del>${t('delete')}</button>` : ''}
      <button class="btn grow" data-save>${entry ? t('save') : t('add_to_log')}</button>
    </div>
  `);

  const qtyEl = s.el.querySelector('[data-qty]');
  const gramsEl = s.el.querySelector('[data-grams]');
  let base = { kcal: food.kcal, protein: food.protein, carbs: food.carbs, fat: food.fat };
  let servingLabel = food.serving;

  const refresh = () => {
    let q = num(qtyEl.value, 1);
    let n = base;
    if (gramsEl && num(gramsEl.value, 0) > 0) {
      const g = num(gramsEl.value);
      const f = g / 100;
      n = { kcal: food.per100.kcal * f, protein: food.per100.protein * f, carbs: food.per100.carbs * f, fat: food.per100.fat * f };
      q = 1;
    }
    s.el.querySelector('[data-preview]').innerHTML = `
      <div><b>${fmt(n.kcal * q)}</b><small>kcal</small></div>
      <div class="m-p"><b>${fmt1(n.protein * q)}</b><small>${t('protein')}</small></div>
      <div class="m-c"><b>${fmt1(n.carbs * q)}</b><small>${t('carbs')}</small></div>
      <div class="m-f"><b>${fmt1(n.fat * q)}</b><small>${t('fat')}</small></div>`;
    return { n, q };
  };
  refresh();
  qtyEl.oninput = () => { if (gramsEl) gramsEl.value = ''; refresh(); };
  if (gramsEl) gramsEl.oninput = refresh;
  s.el.querySelectorAll('[data-step]').forEach(b => b.onclick = () => {
    qtyEl.value = Math.max(0.25, num(qtyEl.value, 1) + num(b.dataset.step));
    if (gramsEl) gramsEl.value = '';
    refresh();
  });

  s.el.querySelector('[data-fav]')?.addEventListener('click', e => {
    store.update(st => {
      const i = st.favorites.indexOf(food.id);
      if (i >= 0) st.favorites.splice(i, 1);
      else {
        st.favorites.push(food.id);
        if (!food.id.startsWith('ph:') && !st.customFoods.some(f => f.id === food.id)) {
          // keep a copy so favorites from Open Food Facts work offline
          st.customFoods.push({ ...food, hidden: true });
        }
      }
    });
    e.currentTarget.classList.toggle('on');
  });

  s.el.querySelector('[data-del]')?.addEventListener('click', () => {
    store.update(st => { st.log[date] = (st.log[date] || []).filter(x => x.id !== entry.id); });
    s.close(); toast(t('deleted')); onDone?.();
  });

  s.el.querySelector('[data-save]').onclick = () => {
    const { n, q } = refresh();
    const mealSel = s.el.querySelector('[data-meal]').value;
    if (gramsEl && num(gramsEl.value, 0) > 0) servingLabel = `${num(gramsEl.value)} g`;
    const data = {
      foodId: food.id, name: food.name, serving: servingLabel,
      kcal: Math.round(n.kcal * 10) / 10, protein: Math.round(n.protein * 10) / 10,
      carbs: Math.round(n.carbs * 10) / 10, fat: Math.round(n.fat * 10) / 10,
      qty: q, meal: mealSel,
    };
    store.update(st => {
      const day = st.log[date] ||= [];
      if (entry) Object.assign(day.find(x => x.id === entry.id) || {}, data);
      else day.push({ id: store.uid(), time: Date.now(), ...data });
      if (food.id) {
        const snap = { ...food };
        st.recents = [snap, ...st.recents.filter(r => r.id !== food.id)].slice(0, 25);
      }
    });
    s.close();
    toast(entry ? t('saved') : t('added'));
    onDone?.();
  };
  return s;
}
