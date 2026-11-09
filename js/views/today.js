import * as store from '../store.js';
import { sumEntries, streak } from '../calc.js';
import { t, dateLabel } from '../i18n.js';
import { esc, ring, bar, fmt, fmt1, toast } from '../ui.js';
import { MEALS, openFoodSheet } from './foodsheet.js';
import { backupDue, saveBackup, snoozeBackup } from '../backup.js';

export const getTargets = st => st.profile.customTargets || st.profile.targets;

export function renderToday(root, params) {
  const st = store.get();
  const date = params.get('date') || store.todayKey();
  const isToday = date === store.todayKey();
  const entries = st.log[date] || [];
  const tot = sumEntries(entries);
  const tg = getTargets(st);
  const left = tg.kcal - tot.kcal;
  const water = st.water[date] || 0;
  const wGoal = st.settings.waterGoalMl || 2000;
  const strk = streak(st.log, store.todayKey(), store.shiftDay);

  const mealBlock = m => {
    const items = entries.filter(e => e.meal === m);
    const mt = sumEntries(items);
    return `<div class="card meal">
      <div class="row between"><h3>${t(m)}</h3><span class="muted">${fmt(mt.kcal)} kcal</span></div>
      ${items.map(e => `<button class="entry" data-entry="${e.id}">
          <span class="grow"><b>${esc(e.name)}</b><small class="muted">${fmt1(e.qty)} × ${esc(e.serving || '')}</small></span>
          <span class="kcal">${fmt(e.kcal * e.qty)}</span></button>`).join('')}
      <a class="add-link" href="#/add?meal=${m}&date=${date}">+ ${t('add_food')}</a>
    </div>`;
  };

  root.innerHTML = `
  <header class="day-nav">
    <a class="icon-btn" href="#/today?date=${store.shiftDay(date, -1)}" aria-label="${t('prev_day')}">‹</a>
    <div class="center"><b>${isToday ? t('today') : dateLabel(date)}</b>${strk ? `<small class="streak">🔥 ${strk} ${t('day_streak')}</small>` : ''}</div>
    <a class="icon-btn ${isToday ? 'disabled' : ''}" href="${isToday ? '#/today' : '#/today?date=' + store.shiftDay(date, 1)}" aria-label="${t('next_day')}">›</a>
  </header>

  ${isToday && backupDue(st) ? `<div class="note backup-nudge">
    <span>💾 ${t('backup_nudge')}</span>
    <div class="row gap-sm"><button class="btn sm" data-backup>${t('backup_now')}</button><button class="btn sm ghost" data-snooze>${t('later')}</button></div>
  </div>` : ''}

  <section class="card summary">
    <div class="ring-wrap">${ring(tot.kcal, tg.kcal, { label: fmt(Math.abs(left)), sub: left >= 0 ? t('kcal_left') : t('kcal_over'), over: left < 0 })}</div>
    <div class="summary-side">
      <div><small class="muted">${t('goal')}</small><b>${fmt(tg.kcal)}</b></div>
      <div><small class="muted">${t('eaten')}</small><b>${fmt(tot.kcal)}</b></div>
    </div>
    <div class="macros">
      ${[['protein', 'm-p'], ['carbs', 'm-c'], ['fat', 'm-f']].map(([k, c]) => `
        <div class="macro ${c}"><div class="row between"><span>${t(k)}</span><small>${fmt(tot[k])} / ${tg[k]} g</small></div>${bar(tot[k], tg[k], c)}</div>`).join('')}
    </div>
  </section>

  <section class="card water">
    <div class="row between"><h3>💧 ${t('water')}</h3><span class="muted">${fmt(water)} / ${fmt(wGoal)} ml</span></div>
    ${bar(water, wGoal, 'm-w')}
    <div class="row gap-sm wrap">
      <button class="btn sm ghost" data-water="250">+250 ml</button>
      <button class="btn sm ghost" data-water="500">+500 ml</button>
      <button class="btn sm ghost" data-water="-250" ${water ? '' : 'disabled'}>−250</button>
    </div>
  </section>

  ${MEALS.map(mealBlock).join('')}
  `;

  root.querySelectorAll('[data-entry]').forEach(b => b.onclick = () => {
    const e = entries.find(x => x.id === b.dataset.entry);
    openFoodSheet({ id: e.foodId, name: e.name, serving: e.serving, kcal: e.kcal, protein: e.protein, carbs: e.carbs, fat: e.fat },
      { date, entry: e, onDone: () => renderToday(root, params) });
  });
  root.querySelector('[data-backup]')?.addEventListener('click', async () => {
    if (await saveBackup() !== 'cancelled') toast(t('backup_saved'));
    renderToday(root, params);
  });
  root.querySelector('[data-snooze]')?.addEventListener('click', () => { snoozeBackup(); renderToday(root, params); });
  root.querySelectorAll('[data-water]').forEach(b => b.onclick = () => {
    const before = water;
    store.update(s => { s.water[date] = Math.max(0, (s.water[date] || 0) + Number(b.dataset.water)); });
    if (before < wGoal && store.get().water[date] >= wGoal) toast(t('water_done'));
    renderToday(root, params);
  });
}
