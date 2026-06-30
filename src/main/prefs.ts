import { app } from 'electron';
import fs from 'fs';
import path from 'path';

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
}

const DEFAULTS: Prefs = {
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
};

function prefsPath(): string {
  return path.join(app.getPath('userData'), 'prefs.json');
}

export function loadPrefs(): Prefs {
  try {
    const raw = fs.readFileSync(prefsPath(), 'utf-8');
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePrefs(prefs: Prefs): void {
  fs.mkdirSync(path.dirname(prefsPath()), { recursive: true });
  fs.writeFileSync(prefsPath(), JSON.stringify(prefs, null, 2), 'utf-8');
  app.setLoginItemSettings({ openAtLogin: prefs.launchAtLogin });
}
