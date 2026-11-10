// Bottom sheet to log (or edit) an activity and the calories it burned.
import * as store from '../store.js';
import { ACTIVITIES, activityById, estimateBurn, speedKmh, pace } from '../activities.js';
import { t } from '../i18n.js';
import { esc, sheet, toast, num, fmt, fmt1, burst, fresh, haptic } from '../ui.js';

/** opts: { date, entry (to edit), prefill: { type, minutes, note }, onDone } */
export function openActivitySheet({ date = store.todayKey(), entry = null, prefill = {}, onDone } = {}) {
  const st = store.get();
  const weightKg = st.profile?.weightKg || 60;
  const cur = { type: 'cycling', minutes: '', km: '', kcal: '', note: '', ...prefill, ...(entry || {}) };
  if (entry && entry.estimated) cur.kcal = '';   // re-estimate when editing an estimated entry

  const s = sheet(`
    <h3 class="sheet-title">${entry ? t('edit_activity') : t('log_activity')}</h3>
    <div class="act-grid" role="radiogroup" aria-label="${t('activity_type')}">
      ${ACTIVITIES.map(a => `<button type="button" role="radio" aria-checked="${a.id === cur.type}" class="act-opt ${a.id === cur.type ? 'on' : ''}" data-type="${a.id}">
        <span aria-hidden="true">${a.emoji}</span>${t('act_t_' + a.id)}</button>`).join('')}
    </div>
    <form class="form" data-form>
      <div class="grid2">
        <label>${t('duration_min')}<input name="minutes" type="number" inputmode="numeric" min="1" max="1440" required value="${esc(cur.minutes)}" placeholder="60"></label>
        <label data-km-wrap>${t('distance_km')}<input name="km" type="number" inputmode="decimal" min="0" step="0.01" value="${esc(cur.km)}" placeholder="${t('optional')}"></label>
      </div>
      <div class="speed-line small muted" data-speed></div>
      <label>${t('kcal_burned')}
        <input name="kcal" type="number" inputmode="numeric" min="0" max="10000" value="${esc(cur.kcal)}" placeholder="${t('kcal_burned_ph')}">
      </label>
      <p class="estimate-line small" data-est></p>
      <label>${t('note_opt')}<input name="note" maxlength="60" value="${esc(cur.note)}" placeholder="${t('activity_note_ph')}"></label>
      <div class="row gap">
        ${entry ? `<button type="button" class="btn danger ghost" data-del>${t('delete')}</button>` : ''}
        <button class="btn grow">${entry ? t('save') : t('add_activity')}</button>
      </div>
    </form>`);

  const form = s.el.querySelector('[data-form]');
  let type = cur.type;
  const refresh = () => {
    const a = activityById(type);
    const minutes = num(form.minutes.value, 0), km = num(form.km.value, 0);
    s.el.querySelector('[data-km-wrap]').hidden = !a.distance;
    const sp = a.distance ? speedKmh(minutes, km) : null;
    const pc = (type === 'running' || type === 'walking' || type === 'hiking') ? pace(minutes, km) : null;
    s.el.querySelector('[data-speed]').textContent = sp ? `${fmt1(sp)} km/h${pc ? ` (${pc} /km)` : ''}` : '';
    const est = estimateBurn({ type, minutes, km: a.distance ? km : 0, weightKg });
    const typed = form.kcal.value.trim() !== '';
    s.el.querySelector('[data-est]').innerHTML = est
      ? (typed ? `<span class="muted">${t('estimate_compare', { n: fmt(est) })}</span>` : `${t('we_estimate', { n: `<b>${fmt(est)}</b>`, kg: fmt1(weightKg) })}`)
      : `<span class="muted">${t('estimate_needs_time')}</span>`;
    return { est, minutes, km };
  };
  form.addEventListener('input', refresh);
  s.el.querySelectorAll('[data-type]').forEach(b => b.onclick = () => {
    type = b.dataset.type;
    s.el.querySelectorAll('[data-type]').forEach(x => { const on = x.dataset.type === type; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
    b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    refresh();
  });
  refresh();
  s.el.querySelector('.act-opt.on')?.scrollIntoView({ inline: 'center', block: 'nearest' });

  s.el.querySelector('[data-del]')?.addEventListener('click', () => {
    store.update(st => { st.activities[date] = (st.activities[date] || []).filter(x => x.id !== entry.id); });
    s.close(); toast(t('deleted')); onDone?.();
  });

  form.onsubmit = e => {
    e.preventDefault();
    const { est, minutes, km } = refresh();
    const typed = form.kcal.value.trim() !== '';
    const data = {
      type, minutes, km: activityById(type).distance && km > 0 ? km : null,
      kcal: typed ? Math.round(num(form.kcal.value, 0)) : est, estimated: !typed,
      note: form.note.value.trim(),
    };
    if (!data.kcal && !typed) { toast(t('estimate_needs_time')); return; }
    store.update(st => {
      st.activities ||= {};
      const day = st.activities[date] ||= [];
      if (entry) Object.assign(day.find(x => x.id === entry.id) || {}, data);
      else { const id = store.uid(); fresh.id = id; day.push({ id, time: Date.now(), ...data }); }
    });
    s.close();
    haptic(18);
    toast(t('activity_saved', { n: fmt(data.kcal) }));
    onDone?.();
    if (!entry) setTimeout(() => burst(document.querySelector('.exercise-card .meal-head .em') || document.querySelector('.cardio-cta'), '🔥', 7), 120);
  };
  return s;
}
