// Hubog — local data store (browser localStorage, no backend)
const KEY = 'hubog:v1';

const defaults = () => ({
  version: 1,
  profile: null, // set during onboarding
  settings: { lang: 'en', theme: 'auto', waterGoalMl: 2000, units: 'metric' },
  log: {},        // { 'YYYY-MM-DD': [entry] }
  water: {},      // { 'YYYY-MM-DD': ml }
  weights: [],    // [{ date, kg }]
  customFoods: [],
  recipes: [],
  favorites: [],  // food ids
  recents: [],    // food snapshots (max 20)
  sessions: [],   // workout sessions
  activePlan: null,
  activeSession: null,
  creatineLog: {},
});

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return migrate({ ...defaults(), ...JSON.parse(raw) });
  } catch (e) {
    console.warn('Hubog: could not read saved data', e);
    // Never overwrite data we couldn't read: keep a copy before starting fresh
    try { const raw = localStorage.getItem(KEY); if (raw) localStorage.setItem(KEY + ':recovered-' + Date.now(), raw); } catch {}
    return defaults();
  }
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { console.warn('Hubog: could not save', e); }
  listeners.forEach(fn => fn(state));
}

// Upgrade data saved by older versions.
// (function declaration on purpose: it is hoisted, so load() can call it at startup)
export function migrate(s) {
  const legacyGoal = { lose: 'cut', mild_lose: 'cut', gain: 'lean_bulk' };
  if (s.profile && legacyGoal[s.profile.goal]) s.profile.goal = legacyGoal[s.profile.goal];
  return s;
}

export const get = () => state;
export function update(fn) { fn(state); save(); }
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function exportJSON() { return JSON.stringify(state, null, 2); }
export function importJSON(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object' || !('log' in data) || !('profile' in data)) throw new Error('Not a Hubog backup');
  const d = defaults();
  state = migrate({ ...d, ...data, settings: { ...d.settings, ...data.settings, lastBackupAt: Date.now() } });
  save();
}
export function resetAll() { state = defaults(); save(); }

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function todayKey(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function shiftDay(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  return todayKey(new Date(y, m - 1, d + n));
}
