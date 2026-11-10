import * as store from './store.js';

export function applyTheme() {
  const pref = store.get().settings.theme || 'auto';
  const dark = pref === 'dark' || (pref === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0A1224' : '#F3F6FB');
}
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
