import * as store from '../store.js';
import { sumEntries, streak, bmi } from '../calc.js';
import { t, dateLabel, shortDay } from '../i18n.js';
import { esc, lineChart, barChart, fmt, fmt1, sheet, toast, num } from '../ui.js';
import { getTargets } from './today.js';

let range = 7;

export function renderProgress(root) {
  const st = store.get();
  const tg = getTargets(st);
  const today = store.todayKey();
  const days = Array.from({ length: range }, (_, i) => store.shiftDay(today, i - range + 1));
  const totals = days.map(d => ({ d, ...sumEntries(st.log[d]) }));
  const logged = totals.filter(x => x.kcal > 0);
  const avg = k => logged.length ? logged.reduce((a, x) => a + x[k], 0) / logged.length : 0;
  const onTarget = logged.filter(x => Math.abs(x.kcal - tg.kcal) <= tg.kcal * 0.1).length;
  const weights = st.weights.slice(-30);
  const latest = st.weights[st.weights.length - 1];
  const first = st.weights[0];
  const workouts = st.sessions.filter(s => s.finishedAt && s.date >= days[0]).length;
  const strk = streak(st.log, today, store.shiftDay);
  const waterDays = days.filter(d => (st.water[d] || 0) >= (st.settings.waterGoalMl || 2000)).length;

  root.innerHTML = `
  <header class="page-head"><h2>${t('progress')}</h2>
    <div class="seg">${[7, 30].map(r => `<button class="${range === r ? 'on' : ''}" data-range="${r}">${r}${t('d')}</button>`).join('')}</div></header>

  <div class="stats">
    <div class="stat"><b>🔥 ${strk}</b><small>${t('day_streak')}</small></div>
    <div class="stat"><b>${logged.length}/${range}</b><small>${t('days_logged')}</small></div>
    <div class="stat"><b>${onTarget}</b><small>${t('days_on_target')}</small></div>
    <div class="stat"><b>💪 ${workouts}</b><small>${t('workouts')}</small></div>
    <div class="stat"><b>💧 ${waterDays}</b><small>${t('water_goal_days')}</small></div>
    <div class="stat"><b>${latest ? fmt1(bmi(latest.kg, st.profile.heightCm)) : '–'}</b><small>BMI</small></div>
  </div>

  <section class="card">
    <div class="row between"><h3>${t('calories')}</h3><small class="muted">${t('avg')} ${fmt(avg('kcal'))} / ${fmt(tg.kcal)}</small></div>
    ${barChart(totals.map(x => ({ x: range <= 10 ? shortDay(x.d) : '', y: x.kcal })), { target: tg.kcal })}
    <small class="muted">${t('dashed_goal')}</small>
  </section>

  <section class="card">
    <h3>${t('avg_macros')}</h3>
    <div class="nutri-preview">
      <div class="m-p"><b>${fmt(avg('protein'))}g</b><small>${t('protein')} / ${tg.protein}</small></div>
      <div class="m-c"><b>${fmt(avg('carbs'))}g</b><small>${t('carbs')} / ${tg.carbs}</small></div>
      <div class="m-f"><b>${fmt(avg('fat'))}g</b><small>${t('fat')} / ${tg.fat}</small></div>
    </div>
  </section>

  <section class="card">
    <div class="row between"><h3>${t('weight')}</h3><button class="btn sm" data-weigh>+ ${t('log_weight')}</button></div>
    ${latest ? `<p class="big">${fmt1(latest.kg)} <small>kg</small>
      ${first && first !== latest ? `<span class="delta ${latest.kg - first.kg <= 0 ? 'down' : 'up'}">${latest.kg - first.kg > 0 ? '+' : ''}${fmt1(latest.kg - first.kg)} kg</span>` : ''}</p>` : ''}
    ${weights.length >= 2 ? lineChart(weights.map(w => ({ x: dateLabel(w.date, true), y: w.kg })), { unit: ' kg' }) : `<p class="empty">${t('weigh_more')}</p>`}
    ${weights.length ? `<details><summary class="muted small">${t('all_entries')}</summary>
      ${[...st.weights].reverse().map(w => `<div class="row between small entry-line"><span>${dateLabel(w.date)}</span><span>${fmt1(w.kg)} kg <button class="link" data-rmw="${w.date}">${t('delete')}</button></span></div>`).join('')}
    </details>` : ''}
  </section>
  `;

  root.querySelectorAll('[data-range]').forEach(b => b.onclick = () => { range = Number(b.dataset.range); renderProgress(root); });
  root.querySelectorAll('[data-rmw]').forEach(b => b.onclick = () => { store.update(s => { s.weights = s.weights.filter(w => w.date !== b.dataset.rmw); }); renderProgress(root); });
  root.querySelector('[data-weigh]').onclick = () => {
    const s = sheet(`<h3 class="sheet-title">${t('log_weight')}</h3>
      <form class="form" data-f>
        <label>${t('date')}<input type="date" name="date" value="${today}" max="${today}" required></label>
        <label>${t('weight_kg')}<input type="number" name="kg" step="0.1" min="30" max="300" inputmode="decimal" value="${latest ? latest.kg : ''}" required autofocus></label>
        <button class="btn block">${t('save')}</button></form>`);
    s.el.querySelector('[data-f]').onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const date = f.get('date'), kg = num(f.get('kg'));
      store.update(st => {
        const w = st.weights.find(x => x.date === date);
        if (w) w.kg = kg; else st.weights.push({ date, kg });
        st.weights.sort((a, b) => a.date.localeCompare(b.date));
        if (date === today || st.weights[st.weights.length - 1].date === date) st.profile.weightKg = kg;
      });
      s.close(); toast(t('saved')); renderProgress(root);
    };
  };
}
