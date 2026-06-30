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
  monthlyReport: boolean;
  monthlyReportHour: number; // 0–23
  monthlyReportMinute: number; // 0 or 30
  goalDay: number; // drinks per day, 0 = off
  goalWeek: number; // drinks per week, 0 = off
  goalMonth: number; // drinks per month, 0 = off
  showDrinkCount: boolean;
}

export const DEFAULT_PREFS: Prefs = {
  reminderInterval: 30,
  snoozeMinutes: 15,
  launchAtLogin: true,
  dailyReport: true,
  dailyReportHour: 17,
  dailyReportMinute: 30,
  weeklyReport: true,
  weeklyReportHour: 9,
  weeklyReportMinute: 0,
  monthlyReport: true,
  monthlyReportHour: 9,
  monthlyReportMinute: 0,
  goalDay: 10,
  goalWeek: 50,
  goalMonth: 200,
  showDrinkCount: true,
};
