import { Notification, app, dialog, ipcMain } from 'electron';
import { DEFAULT_PREFS } from '../utils/prefs';
import { deleteAllEvents, getDailyEvents, getEarliestEventDate, getMonthSummary, getWeeklySummary, initDb, logEvent } from './db';
import { loadPrefs, savePrefs, type Prefs } from './prefs';
import { restartReportNotifiers, startReportNotifiers } from './report-notifier';
import { restartTimer, startTimer } from './timer';
import { createTray, refreshTrayTitle } from './tray';
import { initUpdater } from './updater';
import { createWindow } from './window';

// macOS: hide from Dock — menu bar only app
app.dock?.hide();

// Single instance lock
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

app.whenReady().then(() => {
  initDb();
  createWindow();
  createTray();
  startTimer();
  startReportNotifiers(loadPrefs());
  initUpdater();

  // Sync login item setting on startup
  const prefs = loadPrefs();
  app.setLoginItemSettings({ openAtLogin: prefs.launchAtLogin });
});

// Keep app alive when all windows are closed (menu bar app stays alive via tray)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// before-quit fires when tray "Quit" role is triggered; let it proceed normally

// ── IPC handlers ──────────────────────────────────────────────

ipcMain.handle('prefs:get', () => loadPrefs());

ipcMain.handle('prefs:set', (_event, prefs: Prefs) => {
  savePrefs(prefs);
  restartTimer();
  restartReportNotifiers(prefs);
  refreshTrayTitle();
});

ipcMain.handle('events:getDaily', (_event, date: string) => getDailyEvents(date));

ipcMain.handle('events:getWeekly', (_event, weekOffset: number = 0) => getWeeklySummary(weekOffset));

ipcMain.handle('events:getEarliestEventDate', () => getEarliestEventDate());

ipcMain.handle('events:getMonthly', (_event, monthOffset: number = 0) => getMonthSummary(monthOffset));

ipcMain.handle('events:log', (_event, type: 'drink' | 'snooze' | 'missed') => {
  logEvent(type);
  refreshTrayTitle();
});

ipcMain.handle('notification:test', () => {
  new Notification({
    title: 'Notifications are working! 💧',
    body: 'Watty can send you reminders and reports.',
  }).show();
});

ipcMain.handle('prefs:reset', async () => {
  const { response } = await dialog.showMessageBox({
    type: 'warning',
    buttons: ['Reset', 'Cancel'],
    defaultId: 1,
    cancelId: 1,
    message: 'Reset to defaults?',
    detail: 'This will restore all preferences to their original values.',
  });
  if (response === 0) {
    savePrefs({ ...DEFAULT_PREFS } as Prefs);
    restartTimer();
    restartReportNotifiers({ ...DEFAULT_PREFS } as Prefs);
    refreshTrayTitle();
    return { reset: true };
  }
  return { reset: false };
});

ipcMain.handle('events:deleteAll', async () => {
  const { response } = await dialog.showMessageBox({
    type: 'warning',
    buttons: ['Delete', 'Cancel'],
    defaultId: 1,
    cancelId: 1,
    message: 'Delete all data?',
    detail: 'This will permanently delete all drink history. This cannot be undone.',
  });
  if (response === 0) {
    deleteAllEvents();
    refreshTrayTitle();
    return { deleted: true };
  }
  return { deleted: false };
});
