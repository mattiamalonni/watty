import { Notification } from 'electron';
import { getMondayStr } from '../utils/date';
import { getDailyEvents, getMonthSummary, getWeeklySummary } from './db';
import type { Prefs } from './prefs';
import { showMonthReport, showWindow } from './window';

let pollInterval: ReturnType<typeof setInterval> | null = null;

const lastFired: { daily: string; weekly: string; monthly: string } = {
  daily: '',
  weekly: '',
  monthly: '',
};

function fireDailyNotif(): void {
  if (!Notification.isSupported()) return;
  const notif = new Notification({
    title: 'Daily Report 📊',
    body: 'Your hydration report for today is ready.',
  });
  notif.on('click', () => showWindow('reports', 'day'));
  notif.show();
}

function fireWeeklyNotif(): void {
  if (!Notification.isSupported()) return;
  const notif = new Notification({
    title: 'Weekly Report 📊',
    body: 'Your hydration summary for this week is ready.',
  });
  notif.on('click', () => showWindow('reports', 'week'));
  notif.show();
}

function fireMonthlyNotif(): void {
  if (!Notification.isSupported()) return;
  const notif = new Notification({
    title: 'Monthly Report 📊',
    body: 'Your hydration summary for last month is ready.',
  });
  notif.on('click', () => showMonthReport(-1));
  notif.show();
}

function checkReports(prefs: Prefs, catchup: boolean): void {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const currentDay = now.getDay();
  const currentDate = now.getDate();
  const mondayStr = getMondayStr(now);
  const monthKey = todayStr.slice(0, 7);

  // Daily report
  if (prefs.dailyReport && lastFired.daily !== todayStr) {
    const reportMins = prefs.dailyReportHour * 60 + prefs.dailyReportMinute;
    const due = catchup ? nowMins >= reportMins : nowMins === reportMins;
    if (due && getDailyEvents(todayStr).length > 0) {
      lastFired.daily = todayStr;
      fireDailyNotif();
    }
  }

  // Weekly report — fires on Monday
  if (prefs.weeklyReport && currentDay === 1 && lastFired.weekly !== mondayStr) {
    const reportMins = prefs.weeklyReportHour * 60 + prefs.weeklyReportMinute;
    const due = catchup ? nowMins >= reportMins : nowMins === reportMins;
    if (due && getWeeklySummary(0).some((d) => d.drinks > 0)) {
      lastFired.weekly = mondayStr;
      fireWeeklyNotif();
    }
  }

  // Monthly report — fires on 1st of month, shows last month's data
  if (prefs.monthlyReport && currentDate === 1 && lastFired.monthly !== monthKey) {
    const reportMins = prefs.monthlyReportHour * 60 + prefs.monthlyReportMinute;
    const due = catchup ? nowMins >= reportMins : nowMins === reportMins;
    if (due && getMonthSummary(-1).some((d) => d.drinks > 0)) {
      lastFired.monthly = monthKey;
      fireMonthlyNotif();
    }
  }
}

export function startReportNotifiers(prefs: Prefs): void {
  checkReports(prefs, true); // immediate catchup on startup
  pollInterval = setInterval(() => checkReports(prefs, false), 60_000);
}

export function stopReportNotifiers(): void {
  if (pollInterval !== null) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

export function restartReportNotifiers(prefs: Prefs): void {
  stopReportNotifiers();
  startReportNotifiers(prefs);
}
