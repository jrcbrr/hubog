// Line icons (24×24, currentColor) — drawn for Hubog.
const i = d => `<svg class="ic" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ICON = {
  today: i('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5"/><circle cx="12" cy="12" r="2.5"/>'),
  progress: i('<path d="M4 19h16"/><path d="M6 15l4-4 3 3 5-6"/><path d="M15 8h3v3"/>'),
  workouts: i('<path d="M2.5 10v4M6 6.5v11M18 6.5v11M21.5 10v4M6 12h12"/>'),
  me: i('<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"/>'),
  plus: i('<path d="M12 5v14M5 12h14"/>'),
  barcode: i('<path d="M4 6v12M7 6v12M11 6v12M14 6v12M17 6v12M20 6v12" stroke-width="1.8"/>'),
  camera: i('<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
  bolt: i('<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>'),
  pencil: i('<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>'),
  chevL: i('<path d="M15 5l-7 7 7 7"/>'),
  chevR: i('<path d="M9 5l7 7-7 7"/>'),
  drop: i('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'),
  flame: i('<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 1.5-5 3-6.5.3 2 1.2 3.2 2.5 3.7C11 8 11 5 12 2z"/>'),
  search: i('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'),
  star: i('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>'),
  play: i('<path d="M7 4.5v15l12-7.5z"/>'),
  scale: i('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 9a5 5 0 0 1 8 0l-3 3"/>'),
};
export const MEAL_EMOJI = { breakfast: '☕', lunch: '🍛', dinner: '🌙', snacks: '🍌' };
