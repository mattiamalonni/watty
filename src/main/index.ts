import { app, ipcMain } from 'electron'
import { getDailyEvents, getWeeklySummary, initDb, logEvent } from './db'
import { loadPrefs, savePrefs, type Prefs } from './prefs'
import { restartTimer, startTimer } from './timer'
import { createTray } from './tray'
import { initUpdater } from './updater'
import { createWindow } from './window'

// macOS: hide from Dock — menu bar only app
app.dock?.hide()

// Single instance lock
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.whenReady().then(() => {
  initDb()
  createWindow()
  createTray()
  startTimer()
  initUpdater()

  // Sync login item setting on startup
  const prefs = loadPrefs()
  app.setLoginItemSettings({ openAtLogin: prefs.launchAtLogin })
})

// Keep app alive when all windows are closed (menu bar app stays alive via tray)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// before-quit fires when tray "Quit" role is triggered; let it proceed normally

// ── IPC handlers ──────────────────────────────────────────────

ipcMain.handle('prefs:get', () => loadPrefs())

ipcMain.handle('prefs:set', (_event, prefs: Prefs) => {
  savePrefs(prefs)
  restartTimer()
})

ipcMain.handle('events:getDaily', (_event, date: string) => getDailyEvents(date))

ipcMain.handle('events:getWeekly', () => getWeeklySummary())

ipcMain.handle('events:log', (_event, type: 'drink' | 'snooze' | 'missed') => {
  logEvent(type)
})
