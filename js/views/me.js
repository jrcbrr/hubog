import * as store from '../store.js';
import { targets } from '../calc.js';
import { t, setLang, getLang } from '../i18n.js';
import { esc, toast, confirmSheet, num, fmt, sheet } from '../ui.js';
import { applyTheme } from '../theme.js';
import { foodFormSheet } from './add.js';
import { saveBackup, restoreFromFile } from '../backup.js';
import { foodEmoji } from '../foods.js';
import { cfg as creatineCfg, setCfg, enableNotifications, notifySupported, calendarFile } from '../creatine.js';

export function renderMe(root) {
  const st = store.get();
  const p = st.profile;
  const auto = p.targets;
  const cur = p.customTargets || auto;
  const mine = st.customFoods.filter(f => !f.hidden);
  const cr = creatineCfg(st);

  root.innerHTML = `
  <header class="page-head"><h2>${t('me')}</h2></header>

  <section class="card">
    <div class="row between"><h3>${t('profile')}</h3><a class="btn sm ghost" href="#/profile">${t('edit')}</a></div>
    <p class="small">${t(p.sex)}, ${p.age} ${t('yrs')}, ${p.heightCm} cm, ${p.weightKg} kg</p>
    <p class="small">${t('act_' + p.activity)}, ${t('goal_' + p.goal)}</p>
  </section>

  <section class="card">
    <h3>${t('daily_targets')}</h3>
    <form class="form" data-targets>
      <div class="grid2">
        <label>kcal<input name="kcal" type="number" min="800" value="${cur.kcal}"></label>
        <label>${t('protein')} (g)<input name="protein" type="number" min="0" value="${cur.protein}"></label>
        <label>${t('carbs')} (g)<input name="carbs" type="number" min="0" value="${cur.carbs}"></label>
        <label>${t('fat')} (g)<input name="fat" type="number" min="0" value="${cur.fat}"></label>
      </div>
      <p class="muted small">${t('auto_targets')}: ${fmt(auto.kcal)} kcal · P${auto.protein} C${auto.carbs} F${auto.fat}</p>
      <div class="row gap">
        ${p.customTargets ? `<button type="button" class="btn ghost" data-auto>${t('use_auto')}</button>` : ''}
        <button class="btn grow">${t('save_targets')}</button>
      </div>
    </form>
  </section>

  <section class="card">
    <h3>${t('settings')}</h3>
    <label>${t('language')}<select data-lang><option value="en" ${getLang() === 'en' ? 'selected' : ''}>English</option><option value="tl" ${getLang() === 'tl' ? 'selected' : ''}>Tagalog</option></select></label>
    <label>${t('theme')}<select data-theme>${['auto', 'light', 'dark'].map(v => `<option value="${v}" ${st.settings.theme === v ? 'selected' : ''}>${t('theme_' + v)}</option>`).join('')}</select></label>
    <label>${t('water_goal')} (ml)<input data-water type="number" min="500" step="250" value="${st.settings.waterGoalMl}"></label>
  </section>

  <section class="card" id="supplements">
    <h3>${t('creatine_reminder')}</h3>
    <p class="muted small">${t('creatine_info')}</p>
    <label class="switch-row"><span>${t('creatine_track')}</span><input type="checkbox" role="switch" data-cr-on ${cr.on ? 'checked' : ''}></label>
    ${cr.on ? `<div class="grid2 mt">
      <label>${t('dose_g')}<input data-cr-dose type="number" min="1" max="20" step="0.5" inputmode="decimal" value="${cr.doseG}"></label>
      <label>${t('remind_at')}<input data-cr-time type="time" value="${cr.time}"></label>
    </div>
    ${notifySupported() ? (Notification.permission === 'granted'
      ? `<p class="small ok-line">✓ ${t('notif_on')}</p>`
      : `<button class="btn block" data-cr-notify>${t('notif_enable')}</button>`) : ''}
    <button class="btn ghost block" data-cr-cal>${t('add_calendar')}</button>
    <p class="muted small mt">${t('reminder_note')}</p>` : ''}
  </section>

  <section class="card">
    <h3>${t('my_foods')} (${mine.length})</h3>
    ${mine.length ? mine.map(f => `<button class="food-row" data-food="${esc(f.id)}"><span class="tile">${foodEmoji(f)}</span><span class="grow"><b>${esc(f.name)}</b><small class="muted">${esc(f.serving)}</small></span><span class="kcal">${fmt(f.kcal)}</span></button>`).join('') : `<p class="empty">${t('no_my_foods')}</p>`}
    ${st.recipes.length ? `<h4 class="list-head">${t('recipes')}</h4>` + st.recipes.map(r => `<a class="food-row" href="#/recipe?id=${r.id}"><span class="tile">🥘</span><span class="grow"><b>${esc(r.name)}</b><small class="muted">${r.servings} ${t('servings').toLowerCase()}</small></span><span>›</span></a>`).join('') : ''}
  </section>

  <section class="card">
    <h3>${t('backup')}</h3>
    <p class="muted small">${t('backup_help')}</p>
    <p class="small"><b>${t('last_backup')}:</b> ${st.settings.lastBackupAt ? new Date(st.settings.lastBackupAt).toLocaleDateString() : t('never')}</p>
    <button class="btn block" data-export>${t('export')}</button>
    <label class="btn ghost block file-btn">${t('import')}<input type="file" accept="application/json,.json" hidden data-import></label>
    <details class="mt"><summary class="small"><b>${t('switch_title')}</b></summary>
      <ol class="small steps">${[1, 2, 3, 4].map(i => `<li>${t('switch_' + i)}</li>`).join('')}</ol>
    </details>
  </section>

  <section class="card">
    <h3>${t('about')}</h3>
    <p class="small">${t('about_text')}</p>
    <p class="muted small">${t('disclaimer')}</p>
    <p class="muted small">${t('off_credit')} <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener">Open Food Facts</a> (ODbL).</p>
    <button class="btn danger ghost block" data-reset>${t('reset_all')}</button>
  </section>`;

  root.querySelector('[data-targets]').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const v = { kcal: num(f.get('kcal'), auto.kcal), protein: num(f.get('protein'), auto.protein), carbs: num(f.get('carbs'), auto.carbs), fat: num(f.get('fat'), auto.fat) };
    store.update(s => { s.profile.customTargets = v; });
    toast(t('saved')); renderMe(root);
  };
  root.querySelector('[data-auto]')?.addEventListener('click', () => {
    store.update(s => { s.profile.customTargets = null; s.profile.targets = targets(s.profile); });
    toast(t('saved')); renderMe(root);
  });
  root.querySelector('[data-cr-on]').onchange = e => { setCfg({ on: e.target.checked }); renderMe(root); document.getElementById('supplements')?.scrollIntoView({ block: 'start' }); };
  root.querySelector('[data-cr-dose]')?.addEventListener('change', e => { setCfg({ doseG: Math.min(20, Math.max(1, num(e.target.value, 5))) }); toast(t('saved')); });
  root.querySelector('[data-cr-time]')?.addEventListener('change', e => { if (e.target.value) { setCfg({ time: e.target.value }); toast(t('saved')); } });
  root.querySelector('[data-cr-notify]')?.addEventListener('click', async () => {
    const r = await enableNotifications();
    toast(r === 'granted' ? t('notif_on') : t('notif_blocked'));
    renderMe(root);
  });
  root.querySelector('[data-cr-cal]')?.addEventListener('click', () => {
    const file = calendarFile(creatineCfg(), { title: t('creatine_notif_title'), body: g => t('creatine_notif_body', { g }) });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file); a.download = file.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    toast(t('calendar_saved'));
  });
  root.querySelector('[data-lang]').onchange = e => { setLang(e.target.value); renderMe(root); };
  root.querySelector('[data-theme]').onchange = e => { store.update(s => { s.settings.theme = e.target.value; }); applyTheme(); };
  root.querySelector('[data-water]').onchange = e => { store.update(s => { s.settings.waterGoalMl = Math.max(500, num(e.target.value, 2000)); }); toast(t('saved')); };
  root.querySelectorAll('[data-food]').forEach(b => b.onclick = () => {
    const f = st.customFoods.find(x => x.id === b.dataset.food);
    foodFormSheet(f, () => renderMe(root));
  });

  root.querySelector('[data-export]').onclick = async () => {
    const r = await saveBackup();
    if (r !== 'cancelled') { toast(t('backup_saved')); renderMe(root); }
  };
  root.querySelector('[data-import]').onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!await confirmSheet(t('import_q'), t('import'), t('cancel'))) return;
    try { await restoreFromFile(file); toast(t('import_done')); location.hash = '#/today'; location.reload(); }
    catch { toast(t('import_failed')); }
  };
  root.querySelector('[data-reset]').onclick = async () => {
    if (!await confirmSheet(t('reset_q'), t('reset_all'), t('cancel'))) return;
    store.resetAll();
    location.hash = '#/';
    location.reload();
  };
}
