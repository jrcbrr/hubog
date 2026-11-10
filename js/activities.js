// Exercise / cardio log: calories burned per activity.
// If you don't type the calories from your watch, bike computer or app, Hubog estimates them with
// MET values from the Compendium of Physical Activities:
//   kcal ≈ (MET − 1) × weight kg × hours
// The "− 1" removes the calories you'd burn at rest anyway (already in your daily target), so exercise
// isn't counted twice.

// met: number, or (kmh) => number for activities where speed matters
export const ACTIVITIES = [
  { id: 'cycling', emoji: '🚴', distance: true, met: kmh => !kmh ? 7.5 : kmh < 16 ? 4 : kmh < 19 ? 6.8 : kmh < 22 ? 8 : kmh < 25 ? 10 : kmh < 30 ? 12 : 15.8 },
  { id: 'running', emoji: '🏃', distance: true, met: kmh => !kmh ? 9.8 : Math.min(19, Math.max(6, kmh * 1.02)) },
  { id: 'walking', emoji: '🚶', distance: true, met: kmh => !kmh ? 3.5 : kmh < 4 ? 2.8 : kmh < 5 ? 3.5 : kmh < 6 ? 4.3 : kmh < 7 ? 5 : 7 },
  { id: 'hiking', emoji: '🥾', distance: true, met: 6 },
  { id: 'swimming', emoji: '🏊', distance: true, met: 7 },
  { id: 'strength', emoji: '🏋️', distance: false, met: 5 },
  { id: 'basketball', emoji: '🏀', distance: false, met: 6.5 },
  { id: 'football', emoji: '⚽', distance: false, met: 7 },
  { id: 'volleyball', emoji: '🏐', distance: false, met: 4 },
  { id: 'badminton', emoji: '🏸', distance: false, met: 5.5 },
  { id: 'jumprope', emoji: '🪢', distance: false, met: 11 },
  { id: 'boxing', emoji: '🥊', distance: false, met: 7.8 },
  { id: 'dancing', emoji: '💃', distance: false, met: 5 },
  { id: 'yoga', emoji: '🧘', distance: false, met: 2.5 },
  { id: 'other', emoji: '⚡', distance: false, met: 5 },
];

export const activityById = id => ACTIVITIES.find(a => a.id === id) || ACTIVITIES[ACTIVITIES.length - 1];

export function speedKmh(minutes, km) {
  return minutes > 0 && km > 0 ? km / (minutes / 60) : null;
}

/** Estimated net calories burned. Returns a whole number (0 if not enough info). */
export function estimateBurn({ type, minutes, km, weightKg }) {
  if (!(minutes > 0) || !(weightKg > 0)) return 0;
  const a = activityById(type);
  const met = typeof a.met === 'function' ? a.met(a.distance ? speedKmh(minutes, km) : null) : a.met;
  return Math.max(0, Math.round((met - 1) * weightKg * (minutes / 60)));
}

/** Pace for running/walking (min per km) as "m:ss". */
export function pace(minutes, km) {
  if (!(minutes > 0 && km > 0)) return null;
  const p = minutes / km, m = Math.floor(p), s = Math.round((p - m) * 60);
  return s === 60 ? `${m + 1}:00` : `${m}:${String(s).padStart(2, '0')}`;
}

export const burnedOn = (st, date) => (st.activities?.[date] || []).reduce((a, x) => a + (Number(x.kcal) || 0), 0);

/** Daily calorie goal including exercise (when that setting is on). */
export function effectiveGoal(baseKcal, burned, addExercise = true) {
  return Math.round(baseKcal + (addExercise ? burned : 0));
}
