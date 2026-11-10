// Hubog — app entry & hash router
import * as store from './store.js';
import { t, initLang } from './i18n.js';
import { applyTheme } from './theme.js';
import { requestPersistentStorage } from './backup.js';
import { ICON } from './icons.js';
import { startReminderLoop } from './creatine.js';
import { renderOnboarding } from './views/onboarding.js';
import { initRipples } from './ui.js';
import { renderToday } from './views/today.js';
import { renderAdd } from './views/add.js';
import { renderRecipe } from './views/recipe.js';
import { renderWorkouts } from './views/workouts.js';
import { renderProgress } from './views/progress.js';
import { renderMe } from './views/me.js';

const main = document.getElementById('main');
const nav = document.getElementById('nav');

const routes = {
  today: renderToday,
  add: renderAdd,
  recipe: renderRecipe,
  workouts: renderWorkouts,
  progress: renderProgress,
  me: renderMe,
  profile: root => renderOnboarding(root, { editing: true }),
};

let navX = null;
function drawNav(active) {
  const item = r =>
    `<a href="#/${r}" class="${active === r ? 'on' : ''}" ${active === r ? 'aria-current="page"' : ''}>${ICON[r]}<span>${t(r)}</span></a>`;
  nav.innerHTML = `<span class="nav-pill" aria-hidden="true"></span>` + item('today') + item('progress') +
    `<a href="#/add" class="nav-add" aria-label="${t('add_food')}"><span>${ICON.plus}</span></a>` +
    item('workouts') + item('me');
  // Slide the highlight from the previous tab to the new one
  const pill = nav.querySelector('.nav-pill'), on = nav.querySelector('a.on');
  if (!on) { pill.style.opacity = 0; return; }
  const x = on.offsetLeft + on.offsetWidth / 2;
  pill.style.transition = 'none';
  pill.style.transform = `translateX(${(navX ?? x)}px) translateX(-50%)`;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    pill.style.transition = '';
    pill.style.transform = `translateX(${x}px) translateX(-50%)`;
  }));
  navX = x;
}

let lastRouteKey = null, enterTimer;
function route() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const params = new URLSearchParams(query);
  const st = store.get();
  document.documentElement.lang = st.settings.lang === 'tl' ? 'tl' : 'en';

  if (!st.profile) {
    nav.hidden = true;
    renderOnboarding(main);
    return;
  }
  const name = routes[path] ? path : 'today';
  nav.hidden = name === 'profile';
  drawNav(name === 'recipe' ? 'add' : name);
  try {
    routes[name](main, params);
    // Animate in when you move to another screen (not when the same screen just refreshes)
    const key = name + (params.get('date') || '');
    if (key !== lastRouteKey) {
      main.classList.remove('page-enter');
      [...main.children].forEach((el, i) => el.style.setProperty('--i', Math.min(i, 8)));
      void main.offsetWidth;
      main.classList.add('page-enter');
      clearTimeout(enterTimer);
      enterTimer = setTimeout(() => main.classList.remove('page-enter'), 1400);
    }
    lastRouteKey = key;
  } catch (err) {
    console.error(err);
    main.innerHTML = `<div class="card"><h3>${t('error')}</h3><p class="muted small">${String(err.message || err)}</p><a class="btn" href="#/today">${t('today')}</a></div>`;
  }
  if (!params.has('keepScroll')) window.scrollTo(0, 0);
}

initLang();
applyTheme();
initRipples();
requestPersistentStorage();
window.addEventListener('hashchange', route);
window.addEventListener('hubog:lang', route);
route();

// New day: if Hubog is left open (or comes back from the background) after midnight,
// refresh so Today shows the new day's empty meals instead of yesterday's.
let shownDay = store.todayKey();
function checkNewDay() {
  const now = store.todayKey();
  if (now === shownDay) return;
  const was = shownDay;
  shownDay = now;
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const d = new URLSearchParams(query).get('date');
  const onToday = (path === '' || path === 'today') && (!d || d === was);
  if (!onToday || document.querySelector('.sheet-wrap')) return;
  if (d) location.hash = '#/today'; else route();
}
setInterval(checkNewDay, 30_000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkNewDay(); });

startReminderLoop({ title: t('creatine_notif_title'), body: g => t('creatine_notif_body', { g }) });

// Offline support + automatic updates (works for the home-screen app too).
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(reg => {
    const check = () => reg.update().catch(() => {});
    // A home-screen app is usually resumed, not reopened, so check whenever it comes back to the front
    document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
    setInterval(check, 30 * 60_000);
  }).catch(e => console.warn('SW failed', e));

  // A new version took over: reload into it, unless you're in the middle of typing or editing something
  let reloading = false;
  const reloadWhenIdle = () => {
    if (reloading) return;
    const busy = document.querySelector('.sheet-wrap') || ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName);
    if (busy) { setTimeout(reloadWhenIdle, 3000); return; }
    reloading = true;
    location.reload();
  };
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) reloadWhenIdle(); });
}
