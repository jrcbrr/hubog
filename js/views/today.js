import * as store from '../store.js';
import { sumEntries, streak } from '../calc.js';
import { t, dateLabel } from '../i18n.js';
import { esc, ring, bar, fmt, fmt1, toast } from '../ui.js';
import { MEALS, openFoodSheet } from './foodsheet.js';
import { backupDue, saveBackup, snoozeBackup } from '../backup.js';
import { cfg as creatineCfg, takenOn, toggleTaken, creatineStreak, isDue } from '../creatine.js';
import { foodEmoji } from '../foods.js';
import { ICON, MEAL_EMOJI } from '../icons.js';

const CREDIT = { name: 'John Rudolph Cabrera', email: 'johnrudolph2010@gmail.com', instagram: 'jrcbrr_' };

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
      <div class="meal-head"><span class="em" aria-hidden="true">${MEAL_EMOJI[m]}</span><h3>${t(m)}</h3>${items.length ? `<span class="num">${fmt(mt.kcal)} kcal</span>` : ''}</div>
      ${items.map(e => `<button class="entry" data-entry="${e.id}">
          <span class="tile" aria-hidden="true">${foodEmoji(e)}</span>
          <span class="grow"><b>${esc(e.name)}</b><small class="muted">${fmt1(e.qty)} × ${esc(e.serving || '')}</small></span>
          <span class="kcal">${fmt(e.kcal * e.qty)}</span></button>`).join('')}
      <a class="add-link" href="#/add?meal=${m}&date=${date}"><span class="tile">${ICON.plus}</span>${t('add_food')}</a>
    </div>`;
  };

  root.innerHTML = `
  <section class="leaf today-hero">
  <div class="credit">
    <span class="credit-name">${t('made_by')} <b>${esc(CREDIT.name)}</b></span>
    <span class="credit-links">
      <a href="mailto:${CREDIT.email}">${ICON.mail}<span>${esc(CREDIT.email)}</span></a>
      <a href="https://www.instagram.com/${CREDIT.instagram}/" target="_blank" rel="noopener">${ICON.at}<span>${esc(CREDIT.instagram)}</span></a>
    </span>
  </div>
  <header class="day-nav">
    <a class="icon-btn" href="#/today?date=${store.shiftDay(date, -1)}" aria-label="${t('prev_day')}">${ICON.chevL}</a>
    <div class="center"><b>${isToday ? t('today') : dateLabel(date)}</b>${strk ? `<small class="streak">${ICON.flame} ${strk} ${t('day_streak')}</small>` : ''}</div>
    <a class="icon-btn ${isToday ? 'disabled' : ''}" href="${isToday ? '#/today' : '#/today?date=' + store.shiftDay(date, 1)}" aria-label="${t('next_day')}">${ICON.chevR}</a>
  </header>
    <div class="ring-wrap">${ring(tot.kcal, tg.kcal, { size: 200, stroke: 16, label: fmt(Math.abs(left)), sub: left >= 0 ? t('kcal_left') : t('kcal_over'), over: left < 0 })}</div>
    <div class="hero-split"><span>${t('eaten')}<b>${fmt(tot.kcal)}</b></span><span>${t('goal')}<b>${fmt(tg.kcal)}</b></span></div>
    <div class="macros">
      ${[['protein', 'm-p'], ['carbs', 'm-c'], ['fat', 'm-f']].map(([k, c]) => `
        <div class="macro"><div class="lbl">${t(k)}</div><div class="val">${fmt(tot[k])}<small> / ${tg[k]}g</small></div>${bar(tot[k], tg[k], c)}</div>`).join('')}
    </div>
  </section>

  ${isToday && backupDue(st) ? `<div class="note backup-nudge">
    <span>${t('backup_nudge')}</span>
    <div class="row gap-sm"><button class="btn sm" data-backup>${t('backup_now')}</button><button class="btn sm ghost" data-snooze>${t('later')}</button></div>
  </div>` : ''}

  <section class="card water">
    <span class="water-icon">${ICON.drop}</span>
    <div><h3>${t('water')}</h3><span class="muted">${fmt(water)} / ${fmt(wGoal)} ml</span></div>
    <div class="water-btns">
      <button class="btn sm" data-water="-250" ${water ? '' : 'disabled'} aria-label="−250 ml">−</button>
      <button class="btn sm" data-water="250">+250</button>
    </div>
    ${bar(water, wGoal, 'm-w')}
  </section>

  ${creatineCfg(st).on ? (() => {
    const taken = takenOn(date, st);
    const cs = creatineStreak(st.creatineLog || {}, store.todayKey(), store.shiftDay);
    return `<section class="card supp ${taken ? 'done' : isToday && isDue() ? 'due' : ''}">
      <span class="supp-icon" aria-hidden="true">Cr</span>
      <div class="grow"><h3>${t('creatine')} ${creatineCfg(st).doseG} g</h3>
        <small class="muted">${taken ? t('creatine_taken') + (cs > 1 ? `, ${cs} ${t('day_streak')}` : '') : isToday && isDue() ? t('creatine_due') : t('creatine_at', { time: creatineCfg(st).time })}</small></div>
      <button class="btn sm ${taken ? 'ghost' : ''}" data-creatine aria-pressed="${taken}">${taken ? t('undo') : t('mark_taken')}</button>
    </section>`;
  })() : ''}

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
  root.querySelector('[data-creatine]')?.addEventListener('click', () => {
    const was = takenOn(date);
    toggleTaken(date);
    if (!was) toast(t('creatine_logged'));
    renderToday(root, params);
  });
  root.querySelectorAll('[data-water]').forEach(b => b.onclick = () => {
    const before = water;
    store.update(s => { s.water[date] = Math.max(0, (s.water[date] || 0) + Number(b.dataset.water)); });
    if (before < wGoal && store.get().water[date] >= wGoal) toast(t('water_done'));
    renderToday(root, params);
  });
}
