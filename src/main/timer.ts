import { Notification } from 'electron'
import { logEvent } from './db'
import { loadPrefs } from './prefs'

let reminderTimer: ReturnType<typeof setTimeout> | null = null
let snoozeTimer: ReturnType<typeof setTimeout> | null = null

function scheduleReminder(delayMs: number): void {
  if (reminderTimer) clearTimeout(reminderTimer)
  reminderTimer = setTimeout(() => {
    fireReminder()
  }, delayMs)
}

function fireReminder(): void {
  const prefs = loadPrefs()
  let actionTaken = false

  const notification = new Notification({
    title: 'Time to drink! 💧',
    body: 'Stay hydrated — have a glass of water.',
    actions: [
      { type: 'button', text: '💧 I drank' },
      { type: 'button', text: `Snooze ${prefs.snoozeMinutes}min` }
    ],
    closeButtonText: 'Dismiss'
  })

  notification.on('action', (_event, index) => {
    actionTaken = true
    if (index === 0) {
      // "I drank"
      logEvent('drink')
      scheduleReminder(prefs.reminderInterval * 60 * 1000)
    } else if (index === 1) {
      // "Snooze"
      logEvent('snooze')
      snoozeReminder(prefs.snoozeMinutes)
    }
  })

  // close fires on dismiss (no action) AND after action on macOS UNNotification.
  // Use actionTaken flag to avoid double-logging.
  notification.on('close', () => {
    if (!actionTaken) {
      logEvent('missed')
      scheduleReminder(prefs.reminderInterval * 60 * 1000)
    }
  })

  // Electron 42: notifications emit 'failed' when app is not code-signed.
  notification.on('failed', (_event, error) => {
    console.error('[notification] failed to display:', error)
    if (!actionTaken) {
      // Still keep the reminder cycle alive even without a visible notification
      scheduleReminder(prefs.reminderInterval * 60 * 1000)
    }
  })

  notification.show()
}

function snoozeReminder(snoozeMinutes: number): void {
  if (snoozeTimer) clearTimeout(snoozeTimer)
  if (reminderTimer) clearTimeout(reminderTimer)

  snoozeTimer = setTimeout(() => {
    fireReminder()
  }, snoozeMinutes * 60 * 1000)
}

export function startTimer(): void {
  const prefs = loadPrefs()
  scheduleReminder(prefs.reminderInterval * 60 * 1000)
}

export function restartTimer(): void {
  if (reminderTimer) clearTimeout(reminderTimer)
  if (snoozeTimer) clearTimeout(snoozeTimer)
  startTimer()
}
