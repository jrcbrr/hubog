// Backup & restore so data can move between devices (no server needed).
import * as store from './store.js';

export function backupFile() {
  const name = `hubog-backup-${store.todayKey()}.json`;
  return new File([store.exportJSON()], name, { type: 'application/json' });
}

/**
 * Share the backup (Messenger, Gmail, Google Drive, Files…) on phones that support it,
 * otherwise download it. Returns 'shared' | 'downloaded' | 'cancelled'.
 */
export async function saveBackup() {
  const file = backupFile();
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Hubog backup' });
      markBackedUp();
      return 'shared';
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelled';
      // fall through to download
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  markBackedUp();
  return 'downloaded';
}

function markBackedUp() {
  store.update(s => { s.settings.lastBackupAt = Date.now(); s.settings.backupSnoozeUntil = 0; });
}

export async function restoreFromFile(file) {
  const text = await file.text();
  store.importJSON(text);
}

/** True when the user has real data and hasn't backed up in 7+ days. */
export function backupDue(st = store.get()) {
  const daysLogged = Object.values(st.log).filter(d => d.length).length;
  if (daysLogged + st.sessions.length < 3) return false;
  const now = Date.now();
  if ((st.settings.backupSnoozeUntil || 0) > now) return false;
  return now - (st.settings.lastBackupAt || 0) > 7 * 864e5;
}

export function snoozeBackup(days = 3) {
  store.update(s => { s.settings.backupSnoozeUntil = Date.now() + days * 864e5; });
}

/** Ask the browser not to auto-clear Hubog's storage (Chrome/Android honours this). */
export function requestPersistentStorage() {
  navigator.storage?.persist?.().catch(() => {});
}
