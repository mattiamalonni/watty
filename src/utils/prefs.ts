export interface Prefs {
  reminderInterval: number; // minutes, 15–120
  snoozeMinutes: number; // minutes
  launchAtLogin: boolean;
  dailyReport: boolean;
  dailyReportHour: number; // 0–23
  dailyReportMinute: number; // 0 or 30
  weeklyReport: boolean;
  weeklyReportHour: number; // 0–23
  weeklyReportMinute: number; // 0 or 30
  weeklyReportDay: number; // 0=Sun … 6=Sat
  goalDay: number; // drinks per day, 0 = off
  goalWeek: number; // drinks per week, 0 = off
  goalMonth: number; // drinks per month, 0 = off
  showDrinkCount: boolean;
}

export const DEFAULT_PREFS: Prefs = {
  reminderInterval: 45,
  snoozeMinutes: 15,
  launchAtLogin: true,
  dailyReport: true,
  dailyReportHour: 17,
  dailyReportMinute: 30,
  weeklyReport: true,
  weeklyReportHour: 9,
  weeklyReportMinute: 0,
  weeklyReportDay: 1,
  goalDay: 8,
  goalWeek: 50,
  goalMonth: 200,
  showDrinkCount: true,
};
