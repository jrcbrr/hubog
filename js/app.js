// Hubog — app entry & hash router
import * as store from './store.js';
import { t, initLang } from './i18n.js';
import { applyTheme } from './theme.js';
import { requestPersistentStorage } from './backup.js';
import { ICON } from './icons.js';
import { startReminderLoop } from './creatine.js';
import { renderOnboarding } from './views/onboarding.js';
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

function drawNav(active) {
  const item = r =>
    `<a href="#/${r}" class="${active === r ? 'on' : ''}" ${active === r ? 'aria-current="page"' : ''}>${ICON[r]}<span>${t(r)}</span></a>`;
  nav.innerHTML = item('today') + item('progress') +
    `<a href="#/add" class="nav-add" aria-label="${t('add_food')}"><span>${ICON.plus}</span></a>` +
    item('workouts') + item('me');
}

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
  } catch (err) {
    console.error(err);
    main.innerHTML = `<div class="card"><h3>${t('error')}</h3><p class="muted small">${String(err.message || err)}</p><a class="btn" href="#/today">${t('today')}</a></div>`;
  }
  if (!params.has('keepScroll')) window.scrollTo(0, 0);
}

initLang();
applyTheme();
requestPersistentStorage();
window.addEventListener('hashchange', route);
window.addEventListener('hubog:lang', route);
route();
startReminderLoop({ title: t('creatine_notif_title'), body: g => t('creatine_notif_body', { g }) });

// Offline support
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(e => console.warn('SW failed', e));
}
