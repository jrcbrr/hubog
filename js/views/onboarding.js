import * as store from '../store.js';
import { targets, tdee, GOALS } from '../calc.js';
import { t, setLang, getLang, initLang } from '../i18n.js';
import { esc, num, fmt, toast } from '../ui.js';
import { restoreFromFile } from '../backup.js';

// Simple line icons (24×24, stroke = currentColor)
const svg = d => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const GOAL_ICONS = {
  cut: svg('<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 1.5-5 3-6.5.3 2 1.2 3.2 2.5 3.7C11 8 11 5 12 2z"/>'),
  recomp: svg('<path d="M4 8h14l-3-3M20 16H6l3 3"/>'),
  maintain: svg('<path d="M4 12h16a8 8 0 0 1-16 0z"/><path d="M9 8.5c0-2 1.5-3.5 3-3.5M12 8V5.5c1.5 0 3 1 3 2.5"/>'),
  lean_bulk: svg('<path d="M2.5 10v4M6 6.5v11M18 6.5v11M21.5 10v4M6 12h12"/>'),
};

export function renderOnboarding(root, { editing = false } = {}) {
  const p = store.get().profile || { sex: 'male', age: 18, heightCm: 165, weightKg: 60, activity: 'light', goal: 'maintain' };
  const opt = (name, value, label, cur) =>
    `<label class="chip-opt"><input type="radio" name="${name}" value="${value}" ${cur === value ? 'checked' : ''}><span>${esc(label)}</span></label>`;

  root.innerHTML = `
  <section class="onboard">
    ${editing ? '' : `<div class="hero">
      <img src="icons/icon.svg" alt="" class="hero-logo">
      <h1>Hubog</h1>
      <p class="muted">${t('tagline')}</p>
      <div class="row center gap-sm lang-pick">
        <button class="btn sm ${getLang() === 'en' ? '' : 'ghost'}" data-lang="en">English</button>
        <button class="btn sm ${getLang() === 'tl' ? '' : 'ghost'}" data-lang="tl">Tagalog</button>
      </div>
    </div>`}
    ${editing ? '' : `<div class="card restore-card">
      <h3>${t('have_backup')}</h3>
      <p class="muted small">${t('have_backup_d')}</p>
      <label class="btn ghost block file-btn">⬆ ${t('restore_backup')}<input type="file" accept="application/json,.json" hidden data-restore></label>
    </div>`}
    <form id="ob" class="card form">
      <h2>${editing ? t('edit_profile') : t('about_you')}</h2>
      <fieldset><legend>${t('sex')}</legend><div class="chips">
        ${opt('sex', 'male', t('male'), p.sex)}${opt('sex', 'female', t('female'), p.sex)}
      </div><small class="muted">${t('sex_note')}</small></fieldset>
      <div class="grid3">
        <label>${t('age')}<input name="age" type="number" inputmode="numeric" min="13" max="100" value="${p.age}" required></label>
        <label>${t('height_cm')}<input name="heightCm" type="number" inputmode="decimal" min="100" max="230" step="0.1" value="${p.heightCm}" required></label>
        <label>${t('weight_kg')}<input name="weightKg" type="number" inputmode="decimal" min="30" max="300" step="0.1" value="${p.weightKg}" required></label>
      </div>
      <fieldset><legend>${t('activity')}</legend><div class="stack">
        ${['sedentary', 'light', 'moderate', 'active', 'very'].map(a => `
          <label class="choice"><input type="radio" name="activity" value="${a}" ${p.activity === a ? 'checked' : ''}>
          <span><b>${t('act_' + a)}</b><small>${t('act_' + a + '_d')}</small></span></label>`).join('')}
      </div></fieldset>
      <fieldset><legend>${t('goal')}</legend><div class="goal-list">
        ${GOALS.map(g => `<label class="goal-card"><input type="radio" name="goal" value="${g}" ${p.goal === g ? 'checked' : ''}>
          <span class="goal-inner"><span class="goal-icon" aria-hidden="true">${GOAL_ICONS[g]}</span>
          <span class="goal-text"><b>${t('goal_' + g)}</b><small>${t('goal_' + g + '_d')}</small></span>
          <span class="goal-mark" aria-hidden="true"></span></span></label>`).join('')}
      </div></fieldset>
      <div id="preview" class="preview"></div>
      <button class="btn block" type="submit">${editing ? t('save') : t('start')}</button>
      ${editing ? `<a class="btn ghost block" href="#/me">${t('cancel')}</a>` : ''}
    </form>
    <p class="disclaimer">${t('disclaimer')}</p>
  </section>`;

  root.querySelector('[data-restore]')?.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await restoreFromFile(file);
      initLang();
      toast(t('import_done'));
      location.hash = '#/today';
      location.reload();
    } catch {
      toast(t('import_failed'));
    }
  });

  const form = root.querySelector('#ob');
  const read = () => {
    const f = new FormData(form);
    return {
      sex: f.get('sex'), age: num(f.get('age'), 18), heightCm: num(f.get('heightCm'), 165),
      weightKg: num(f.get('weightKg'), 60), activity: f.get('activity'), goal: f.get('goal'),
    };
  };
  const preview = () => {
    const v = read();
    if (v.age < 13 || v.heightCm < 100 || v.weightKg < 30) { root.querySelector('#preview').innerHTML = ''; return; }
    const tg = targets(v);
    root.querySelector('#preview').innerHTML = `
      <div class="muted small">${t('maintenance')}: ${fmt(tdee(v))} kcal</div>
      <div class="big">${fmt(tg.kcal)} <small>kcal / ${t('day')}</small></div>
      <div class="macro-row"><span class="m-p">P ${tg.protein}g</span><span class="m-c">C ${tg.carbs}g</span><span class="m-f">F ${tg.fat}g</span></div>`;
  };
  form.addEventListener('input', preview);
  preview();

  root.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { setLang(b.dataset.lang); renderOnboarding(root, { editing }); });

  form.onsubmit = e => {
    e.preventDefault();
    const v = read();
    store.update(s => {
      const keepCustom = s.profile?.customTargets;
      s.profile = { ...v, targets: targets(v), customTargets: keepCustom || null };
      const today = store.todayKey();
      const w = s.weights.find(x => x.date === today);
      if (w) w.kg = v.weightKg; else s.weights.push({ date: today, kg: v.weightKg });
      s.weights.sort((a, b) => a.date.localeCompare(b.date));
    });
    location.hash = editing ? '#/me' : '#/today';
  };
}
