import * as store from '../store.js';
import { PLANS, planById, nextDay, lastPerformance, suggest } from '../workouts.js';
import { t, dateLabel } from '../i18n.js';
import { esc, sheet, toast, confirmSheet, num } from '../ui.js';
import { ICON } from '../icons.js';

let restTimer = null;

export function renderWorkouts(root) {
  const st = store.get();
  if (st.activeSession) return renderSession(root);
  const plan = st.activePlan && planById(st.activePlan);
  const done = st.sessions.filter(s => s.finishedAt);
  const weekAgo = Date.now() - 7 * 864e5;
  const thisWeek = done.filter(s => s.finishedAt > weekAgo).length;

  root.innerHTML = `
  <header class="page-head"><h2>${t('workouts')}</h2></header>
  ${plan ? (() => {
    const day = nextDay(plan, st.sessions);
    return `<section class="plan-hero">
      <small>${t('your_plan')}</small>
      <h3>${esc(plan.name)}</h3>
      <small>${thisWeek} / ${plan.perWeek} ${t('this_week')}</small>
      <div class="week-dots" aria-hidden="true">${Array.from({ length: plan.perWeek }, (_, i) => `<i class="${i < thisWeek ? 'on' : ''}"></i>`).join('')}</div>
      <div class="next-day"><b>${t('next_up')}: ${esc(day.name)}</b>
        <ul>${day.exercises.map(e => `<li>${esc(e.name)} <span>${e.sets} × ${e.reps[0]}–${e.reps[1]}${e.type === 'time' ? 's' : ''}</span></li>`).join('')}</ul></div>
      <button class="btn block" data-start="${day.id}">${ICON.play} ${t('start_workout')}</button>
      <div class="row gap-sm wrap mt">${plan.days.map(d => d.id === day.id ? '' : `<button class="btn sm ghost" data-start="${d.id}">${t('do_instead')} ${esc(d.name)}</button>`).join('')}</div>
    </section>`;
  })() : `<p class="note">${t('pick_plan')}</p>`}

  <h3 class="section-title">${plan ? t('change_plan') : t('plans')}</h3>
  ${PLANS.map(p => `<section class="card plan-option ${p.id === st.activePlan ? 'active' : ''}">
    <div class="row between"><h3>${esc(p.name)}</h3><span class="pill">${esc(p.level)}</span></div>
    <p class="muted small">${esc(p.desc)}</p>
    <p class="plan-meta"><span>${p.perWeek}× / ${t('week')}</span><span>${esc(p.equipment)}</span><span>${p.days.length} ${t('workout_days')}</span></p>
    ${p.id === st.activePlan ? `<span class="pill on">✓ ${t('current')}</span>` : `<button class="btn sm" data-plan="${p.id}">${t('use_plan')}</button>`}
  </section>`).join('')}

  <h3 class="section-title">${t('history')}</h3>
  ${done.length ? [...done].reverse().slice(0, 20).map(s => {
    const sets = s.exercises.reduce((n, e) => n + e.sets.filter(x => x.done).length, 0);
    const vol = s.exercises.reduce((n, e) => n + e.sets.filter(x => x.done).reduce((a, x) => a + num(x.kg) * num(x.reps), 0), 0);
    return `<button class="card history-row" data-hist="${s.id}"><span class="tile">${ICON.workouts}</span><span class="grow"><b>${esc(s.dayName)}</b>
      <small class="muted">${dateLabel(s.date)}, ${esc(planById(s.planId)?.name || '')}</small></span>
      <span class="small right">${sets} ${t('sets')}<br><span class="muted">${Math.round((s.finishedAt - s.startedAt) / 60000)} min${vol ? ` · ${Math.round(vol)} kg` : ''}</span></span></button>`;
  }).join('') : `<p class="empty">${t('no_workouts')}</p>`}
  `;

  root.querySelectorAll('[data-plan]').forEach(b => b.onclick = () => { store.update(s => { s.activePlan = b.dataset.plan; }); toast(t('plan_set')); renderWorkouts(root); window.scrollTo(0, 0); });
  root.querySelectorAll('[data-start]').forEach(b => b.onclick = () => startSession(plan, b.dataset.start, root));
  root.querySelectorAll('[data-hist]').forEach(b => b.onclick = () => historySheet(st.sessions.find(s => s.id === b.dataset.hist), root));
}

function startSession(plan, dayId, root) {
  const day = plan.days.find(d => d.id === dayId);
  const st = store.get();
  const exercises = day.exercises.map(e => {
    const last = lastPerformance(e.id, st.sessions);
    const sg = suggest(e, last);
    return {
      id: e.id, name: e.name, type: e.type, reps: e.reps, rest: e.rest, tip: e.tip,
      hint: sg.message, lastText: last ? last.sets.filter(s => s.done).map(s => (s.kg ? `${s.kg}kg×` : '') + s.reps).join(', ') : '',
      sets: Array.from({ length: e.sets }, () => ({ kg: sg.kg ?? '', reps: sg.reps, done: false })),
    };
  });
  store.update(s => {
    s.activeSession = { id: store.uid(), planId: plan.id, dayId, dayName: day.name, date: store.todayKey(), startedAt: Date.now(), exercises };
  });
  renderWorkouts(root);
  window.scrollTo(0, 0);
}

function renderSession(root) {
  const ses = store.get().activeSession;
  const elapsed = () => { const m = Math.floor((Date.now() - ses.startedAt) / 60000); return `${m} min`; };

  root.innerHTML = `
  <header class="page-head session-head"><div><h2>${esc(ses.dayName)}</h2><small class="muted" data-elapsed>${elapsed()}</small></div>
    <button class="btn sm" data-finish>${t('finish')}</button></header>
  <div class="rest-bar" data-rest hidden><span>${t('rest')}</span><b data-rest-t>0:00</b>
    <button class="btn sm ghost" data-rest-add>+15s</button><button class="btn sm ghost" data-rest-skip>${t('skip')}</button></div>
  ${ses.exercises.map((e, ei) => `<section class="card exercise">
    <div class="row between"><h3>${esc(e.name)}</h3><button class="icon-btn" data-tip="${ei}" aria-label="${t('how_to')}">?</button></div>
    <p class="muted small">${t('target')}: ${e.sets.length} × ${e.reps[0]}–${e.reps[1]}${e.type === 'time' ? ' s' : ''}${e.lastText ? ` · ${t('last_time')}: ${esc(e.lastText)}` : ''}</p>
    ${e.hint ? `<p class="hint">💡 ${t(e.hint.key, e.hint.vars)}</p>` : ''}
    <div class="set-grid head"><span>${t('set')}</span>${e.type === 'weight' ? '<span>kg</span>' : '<span></span>'}<span>${e.type === 'time' ? t('seconds') : t('reps')}</span><span>✓</span></div>
    ${e.sets.map((s, si) => `<div class="set-grid ${s.done ? 'done' : ''}">
      <span class="set-n">${si + 1}</span>
      ${e.type === 'weight' ? `<input type="number" inputmode="decimal" step="0.5" min="0" value="${s.kg}" data-kg="${ei}:${si}" aria-label="kg">` : '<span></span>'}
      <input type="number" inputmode="numeric" min="0" value="${s.reps}" data-reps="${ei}:${si}" aria-label="${t('reps')}">
      <button class="check ${s.done ? 'on' : ''}" data-done="${ei}:${si}" aria-label="${t('done')}">✓</button>
    </div>`).join('')}
    <div class="row gap-sm"><button class="btn sm ghost" data-addset="${ei}">+ ${t('set')}</button>
    ${e.sets.length > 1 ? `<button class="btn sm ghost" data-rmset="${ei}">− ${t('set')}</button>` : ''}</div>
  </section>`).join('')}
  <button class="btn danger ghost block" data-cancel>${t('discard_workout')}</button>
  `;

  const upd = fn => store.update(s => fn(s.activeSession));
  const parse = v => v.split(':').map(Number);
  root.querySelectorAll('[data-kg]').forEach(i => i.onchange = () => { const [a, b] = parse(i.dataset.kg); upd(x => { x.exercises[a].sets[b].kg = num(i.value, ''); }); });
  root.querySelectorAll('[data-reps]').forEach(i => i.onchange = () => { const [a, b] = parse(i.dataset.reps); upd(x => { x.exercises[a].sets[b].reps = num(i.value, 0); }); });
  root.querySelectorAll('[data-done]').forEach(btn => btn.onclick = () => {
    const [a, b] = parse(btn.dataset.done);
    const row = btn.closest('.set-grid');
    const kgIn = row.querySelector('[data-kg]'), rIn = row.querySelector('[data-reps]');
    let nowDone;
    upd(x => {
      const s = x.exercises[a].sets[b];
      if (kgIn) s.kg = num(kgIn.value, '');
      s.reps = num(rIn.value, 0);
      s.done = !s.done; nowDone = s.done;
    });
    if (nowDone) { startRest(root, ses.exercises[a].rest); navigator.vibrate?.(30); }
    renderSession(root);
  });
  root.querySelectorAll('[data-addset]').forEach(b => b.onclick = () => { upd(x => { const e = x.exercises[b.dataset.addset]; const l = e.sets[e.sets.length - 1]; e.sets.push({ kg: l.kg, reps: l.reps, done: false }); }); renderSession(root); });
  root.querySelectorAll('[data-rmset]').forEach(b => b.onclick = () => { upd(x => { x.exercises[b.dataset.rmset].sets.pop(); }); renderSession(root); });
  root.querySelectorAll('[data-tip]').forEach(b => b.onclick = () => {
    const e = ses.exercises[b.dataset.tip];
    sheet(`<h3 class="sheet-title">${esc(e.name)}</h3><p>${esc(e.tip)}</p><p class="muted small">${t('rest')}: ${e.rest}s</p><button class="btn block" data-close>OK</button>`);
  });
  root.querySelector('[data-finish]').onclick = async () => {
    const any = store.get().activeSession.exercises.some(e => e.sets.some(s => s.done));
    if (!any) { toast(t('mark_a_set')); return; }
    stopRest(root);
    store.update(s => { s.sessions.push({ ...s.activeSession, finishedAt: Date.now() }); s.activeSession = null; });
    toast(t('workout_saved'));
    renderWorkouts(root);
  };
  root.querySelector('[data-cancel]').onclick = async () => {
    if (!await confirmSheet(t('discard_q'), t('discard'), t('cancel'))) return;
    stopRest(root);
    store.update(s => { s.activeSession = null; });
    renderWorkouts(root);
  };
  if (restTimer) bindRestBar(root);

  clearInterval(renderSession._clock);
  renderSession._clock = setInterval(() => {
    const el = root.querySelector('[data-elapsed]');
    if (!el) return clearInterval(renderSession._clock);
    el.textContent = elapsed();
  }, 30000);
}

function startRest(root, seconds) {
  restTimer = { end: Date.now() + seconds * 1000, id: null };
  bindRestBar(root);
}
function stopRest(root) {
  if (restTimer) clearInterval(restTimer.id);
  restTimer = null;
  const bar = root.querySelector('[data-rest]');
  if (bar) bar.hidden = true;
}
function bindRestBar(root) {
  clearInterval(restTimer.id);
  const tick = () => {
    const bar = document.querySelector('[data-rest]');
    if (!restTimer) return;
    const left = Math.max(0, Math.round((restTimer.end - Date.now()) / 1000));
    if (bar) {
      bar.hidden = false;
      bar.querySelector('[data-rest-t]').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    }
    if (left <= 0) { navigator.vibrate?.([200, 100, 200]); stopRest(document); }
  };
  restTimer.id = setInterval(tick, 500);
  tick();
  const bar = root.querySelector('[data-rest]');
  if (!bar) return;
  bar.querySelector('[data-rest-add]').onclick = () => { if (restTimer) restTimer.end += 15000; tick(); };
  bar.querySelector('[data-rest-skip]').onclick = () => stopRest(root);
}

function historySheet(s, root) {
  if (!s) return;
  const sh = sheet(`<h3 class="sheet-title">${esc(s.dayName)} · ${dateLabel(s.date)}</h3>
    ${s.exercises.map(e => {
      const done = e.sets.filter(x => x.done);
      return done.length ? `<p><b>${esc(e.name)}</b><br><span class="muted small">${done.map(x => (x.kg ? `${x.kg}kg × ` : '') + x.reps).join(' · ')}</span></p>` : '';
    }).join('')}
    <div class="row gap"><button class="btn danger ghost" data-del>${t('delete')}</button><button class="btn grow" data-close>OK</button></div>`);
  sh.el.querySelector('[data-del]').onclick = async () => {
    sh.close();
    if (!await confirmSheet(t('delete_workout_q'), t('delete'), t('cancel'))) return;
    store.update(st => { st.sessions = st.sessions.filter(x => x.id !== s.id); });
    renderWorkouts(root);
  };
}
