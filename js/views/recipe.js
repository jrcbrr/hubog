// Recipe builder: combine foods into a dish, log it per serving.
import * as store from '../store.js';
import { searchLocal, foodEmoji } from '../foods.js';
import { sumEntries } from '../calc.js';
import { ICON } from '../icons.js';
import { t } from '../i18n.js';
import { esc, num, fmt, fmt1, toast, confirmSheet } from '../ui.js';

export function recipeAsFood(r) {
  const tot = sumEntries(r.ingredients);
  const n = Math.max(1, r.servings || 1);
  return {
    id: 'rc:' + r.id, recipeId: r.id, name: r.name, serving: `1 ${t('serving')} (1/${n})`,
    kcal: Math.round(tot.kcal / n), protein: Math.round(tot.protein / n * 10) / 10,
    carbs: Math.round(tot.carbs / n * 10) / 10, fat: Math.round(tot.fat / n * 10) / 10, source: 'recipe',
  };
}

export function renderRecipe(root, params) {
  const st = store.get();
  const existing = st.recipes.find(r => r.id === params.get('id'));
  const draft = existing ? structuredClone(existing) : { id: store.uid(), name: '', servings: 4, ingredients: [] };
  const back = `#/add?meal=${params.get('meal') || 'lunch'}&date=${params.get('date') || store.todayKey()}`;

  const draw = () => {
    const tot = sumEntries(draft.ingredients);
    const per = n => fmt1(n / Math.max(1, draft.servings));
    root.innerHTML = `
    <header class="page-head"><a class="icon-btn" href="${back}" aria-label="${t('back')}">${ICON.chevL}</a><h2>${existing ? t('edit_recipe') : t('new_recipe')}</h2></header>
    <div class="card form">
      <label>${t('recipe_name')}<input data-name value="${esc(draft.name)}" placeholder="${t('recipe_ph')}"></label>
      <label>${t('servings_makes')}<input data-servings type="number" min="1" inputmode="numeric" value="${draft.servings}"></label>
    </div>
    <div class="card">
      <h3>${t('ingredients')}</h3>
      ${draft.ingredients.map((g, i) => `<div class="entry">
        <span class="grow"><b>${esc(g.name)}</b><small class="muted">${esc(g.serving)}</small></span>
        <input class="qty-in" type="number" step="0.25" min="0" value="${g.qty}" data-qty="${i}" aria-label="${t('servings')}">
        <button class="icon-btn" data-rm="${i}" aria-label="${t('delete')}">✕</button></div>`).join('') || `<p class="empty">${t('no_ingredients')}</p>`}
      <input data-q type="search" placeholder="${t('add_ingredient')}" class="mt">
      <div data-results></div>
    </div>
    <div class="card per-serving">
      <h3>${t('per_serving')}</h3>
      <div class="nutri-preview">
        <div><b>${fmt(tot.kcal / Math.max(1, draft.servings))}</b><small>kcal</small></div>
        <div class="m-p"><b>${per(tot.protein)}</b><small>${t('protein')}</small></div>
        <div class="m-c"><b>${per(tot.carbs)}</b><small>${t('carbs')}</small></div>
        <div class="m-f"><b>${per(tot.fat)}</b><small>${t('fat')}</small></div>
      </div>
    </div>
    <div class="row gap">
      ${existing ? `<button class="btn danger ghost" data-del>${t('delete')}</button>` : ''}
      <button class="btn grow" data-save>${t('save_recipe')}</button>
    </div>`;

    root.querySelector('[data-name]').oninput = e => { draft.name = e.target.value; };
    root.querySelector('[data-servings]').onchange = e => { draft.servings = Math.max(1, Math.round(num(e.target.value, 1))); draw(); };
    root.querySelectorAll('[data-qty]').forEach(inp => inp.onchange = () => { draft.ingredients[inp.dataset.qty].qty = num(inp.value, 1); draw(); });
    root.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { draft.ingredients.splice(Number(b.dataset.rm), 1); draw(); });

    const q = root.querySelector('[data-q]'), res = root.querySelector('[data-results]');
    q.oninput = () => {
      const items = q.value.trim() ? searchLocal(q.value, store.get().customFoods).slice(0, 8) : [];
      res.innerHTML = items.map((f, i) => `<button class="food-row" data-pick="${i}"><span class="tile">${foodEmoji(f)}</span><span class="grow"><b>${esc(f.name)}</b><small class="muted">${esc(f.serving)}</small></span><span class="kcal">${fmt(f.kcal)}</span></button>`).join('');
      res.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
        const f = items[b.dataset.pick];
        draft.ingredients.push({ name: f.name, serving: f.serving, kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat, qty: 1 });
        draw();
        root.querySelector('[data-q]').focus();
      });
    };

    root.querySelector('[data-del]')?.addEventListener('click', async () => {
      if (!await confirmSheet(t('delete_recipe_q'), t('delete'), t('cancel'))) return;
      store.update(s => { s.recipes = s.recipes.filter(r => r.id !== draft.id); s.favorites = s.favorites.filter(id => id !== 'rc:' + draft.id); });
      location.hash = back;
    });
    root.querySelector('[data-save]').onclick = () => {
      if (!draft.name.trim()) { toast(t('recipe_need_name')); return; }
      if (!draft.ingredients.length) { toast(t('no_ingredients')); return; }
      store.update(s => {
        const i = s.recipes.findIndex(r => r.id === draft.id);
        if (i >= 0) s.recipes[i] = draft; else s.recipes.push(draft);
      });
      toast(t('saved'));
      location.hash = back;
    };
  };
  draw();
}
