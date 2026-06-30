import { Notification } from 'electron'
import type { Prefs } from './prefs'
import { showWindow } from './window'

let dailyTimer: ReturnType<typeof setTimeout> | null = null
let weeklyTimer: ReturnType<typeof setTimeout> | null = null

/** ms from now until the next occurrence of hour:minute (tomorrow if already past today) */
function msUntilTime(hour: number, minute: number): number {
  const now = new Date()
  const target = new Date(now)
  target.setHours(hour, minute, 0, 0)
  if (target <= now) {
    target.setDate(target.getDate() + 1)
  }
  return target.getTime() - now.getTime()
}

/** ms from now until next occurrence of day-of-week at hour:minute */
function msUntilWeekly(day: number, hour: number, minute: number): number {
  const now = new Date()
  const target = new Date(now)
  target.setHours(hour, minute, 0, 0)

  const daysUntil = (day - now.getDay() + 7) % 7
  if (daysUntil === 0 && target <= now) {
    // same weekday but time already passed — next week
    target.setDate(target.getDate() + 7)
  } else {
    target.setDate(target.getDate() + daysUntil)
  }

  return target.getTime() - now.getTime()
}

function fireDailyNotif(prefs: Prefs): void {
  if (!Notification.isSupported()) return
  const notif = new Notification({
    title: 'Daily Report 📊',
    body: 'Your hydration report for today is ready.'
  })
  notif.on('click', () => showWindow('reports', 'today'))
  notif.show()

  // Reschedule for same time tomorrow
  if (prefs.dailyReport) {
    dailyTimer = setTimeout(
      () => fireDailyNotif(prefs),
      msUntilTime(prefs.dailyReportHour, prefs.dailyReportMinute)
    )
  }
}

function fireWeeklyNotif(prefs: Prefs): void {
  if (!Notification.isSupported()) return
  const notif = new Notification({
    title: 'Weekly Report 📊',
    body: 'Your hydration summary for this week is ready.'
  })
  notif.on('click', () => showWindow('reports', 'week'))
  notif.show()

  // Reschedule for same day+time next week
  if (prefs.weeklyReport) {
    weeklyTimer = setTimeout(
      () => fireWeeklyNotif(prefs),
      msUntilWeekly(prefs.weeklyReportDay, prefs.weeklyReportHour, prefs.weeklyReportMinute)
    )
  }
}

export function startReportNotifiers(prefs: Prefs): void {
  if (prefs.dailyReport) {
    dailyTimer = setTimeout(
      () => fireDailyNotif(prefs),
      msUntilTime(prefs.dailyReportHour, prefs.dailyReportMinute)
    )
  }
  if (prefs.weeklyReport) {
    weeklyTimer = setTimeout(
      () => fireWeeklyNotif(prefs),
      msUntilWeekly(prefs.weeklyReportDay, prefs.weeklyReportHour, prefs.weeklyReportMinute)
    )
  }
}

export function stopReportNotifiers(): void {
  if (dailyTimer !== null) {
    clearTimeout(dailyTimer)
    dailyTimer = null
  }
  if (weeklyTimer !== null) {
    clearTimeout(weeklyTimer)
    weeklyTimer = null
  }
}

export function restartReportNotifiers(prefs: Prefs): void {
  stopReportNotifiers()
  startReportNotifiers(prefs)
}
