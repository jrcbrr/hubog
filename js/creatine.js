// Daily creatine check-off + reminders (no server: in-app nudge, notification while Hubog is open,
// and an optional daily calendar alarm that works even when the app is closed).
import * as store from './store.js';

export const DEFAULT_CREATINE = { on: false, doseG: 5, time: '08:00' };

export const cfg = (st = store.get()) => ({ ...DEFAULT_CREATINE, ...(st.settings.creatine || {}) });
export const takenOn = (date, st = store.get()) => !!(st.creatineLog || {})[date];

export function setCfg(patch) {
  store.update(s => { s.settings.creatine = { ...cfg(s), ...patch }; });
}

export function toggleTaken(date) {
  store.update(s => {
    s.creatineLog ||= {};
    if (s.creatineLog[date]) delete s.creatineLog[date];
    else s.creatineLog[date] = Date.now();
  });
}

/** Consecutive days taken, ending today (or yesterday if not yet taken today). */
export function creatineStreak(log = {}, today, shiftDay) {
  let d = log[today] ? today : shiftDay(today, -1), n = 0;
  while (log[d]) { n++; d = shiftDay(d, -1); }
  return n;
}

/** True once the reminder time has passed today and it hasn't been taken. */
export function isDue(now = new Date(), st = store.get()) {
  const c = cfg(st);
  if (!c.on) return false;
  const [h, m] = c.time.split(':').map(Number);
  const due = new Date(now); due.setHours(h, m, 0, 0);
  return now >= due && !takenOn(store.todayKey(now), st);
}

export const notifySupported = () => 'Notification' in window && 'serviceWorker' in navigator;

export async function enableNotifications() {
  if (!notifySupported()) return 'unsupported';
  const p = await Notification.requestPermission();
  return p;
}

async function maybeNotify(texts) {
  const st = store.get();
  const today = store.todayKey();
  if (!isDue(new Date(), st) || !notifySupported() || Notification.permission !== 'granted') return;
  if (st.settings.creatineNotified === today) return;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return;
  await reg.showNotification(texts.title, { body: texts.body(cfg(st).doseG), tag: 'hubog-creatine', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url: './#/today' } });
  store.update(s => { s.settings.creatineNotified = today; });
}

/** Check now, when the app comes back to the foreground, and every minute while open. */
export function startReminderLoop(texts) {
  const tick = () => maybeNotify(texts).catch(() => {});
  tick();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  setInterval(tick, 60_000);
}

/** iCalendar file with a daily repeating event + alarm at the reminder time. */
export function calendarFile({ doseG, time }, { title, body }) {
  const [h, m] = time.split(':');
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hubog//Creatine reminder//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:hubog-creatine-${ymd}@hubog`, `DTSTAMP:${stamp}`,
    `DTSTART:${ymd}T${h}${m}00`, 'DURATION:PT5M',
    'RRULE:FREQ=DAILY',
    `SUMMARY:${title}`, `DESCRIPTION:${body(doseG)}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${title}`, 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
  return new File([ics], 'hubog-creatine-reminder.ics', { type: 'text/calendar' });
}
