import Database from 'better-sqlite3';
import { addDays, endOfMonth, format, getDaysInMonth, startOfMonth, startOfWeek, subMonths, subWeeks } from 'date-fns';
import { app } from 'electron';
import path from 'path';

export type EventType = 'drink' | 'snooze' | 'missed';

export interface DrinkEvent {
  id: number;
  timestamp: string;
  type: EventType;
}

export interface DailySummary {
  date: string;
  drinks: number;
  snoozes: number;
  missed: number;
  total: number;
  compliance: number;
}

let db: Database.Database;

export function initDb(): void {
  const dbPath = path.join(app.getPath('userData'), 'watty.db');
  db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT    NOT NULL,
      type      TEXT    NOT NULL CHECK(type IN ('drink','snooze','missed'))
    );
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
  `);
}

export function logEvent(type: EventType): void {
  db.prepare('INSERT INTO events (timestamp, type) VALUES (?, ?)').run(format(new Date(), 'yyyy-MM-dd HH:mm:ss'), type);
}

export function getDailyEvents(date: string): DrinkEvent[] {
  // date format: YYYY-MM-DD
  return db
    .prepare(
      `SELECT * FROM events
       WHERE timestamp >= ? AND timestamp < ?
       ORDER BY timestamp ASC`,
    )
    .all(`${date} 00:00:00.000`, `${date} 23:59:59.999`) as DrinkEvent[];
}

export function getWeeklySummary(weekOffset: number = 0): DailySummary[] {
  const monday = startOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const start = format(monday, 'yyyy-MM-dd');
  const end = format(addDays(monday, 6), 'yyyy-MM-dd');

  const rows = db
    .prepare(
      `SELECT
         substr(timestamp, 1, 10) AS date,
         SUM(CASE WHEN type = 'drink'  THEN 1 ELSE 0 END) AS drinks,
         SUM(CASE WHEN type = 'snooze' THEN 1 ELSE 0 END) AS snoozes,
         SUM(CASE WHEN type = 'missed' THEN 1 ELSE 0 END) AS missed,
         COUNT(*) AS total
       FROM events
       WHERE substr(timestamp, 1, 10) >= ? AND substr(timestamp, 1, 10) <= ?
       GROUP BY date
       ORDER BY date ASC`,
    )
    .all(start, end) as Array<{ date: string; drinks: number; snoozes: number; missed: number; total: number }>;

  const rowMap = new Map(rows.map((r) => [r.date, r]));
  const result: DailySummary[] = [];
  for (let d = 0; d < 7; d++) {
    const dateStr = format(addDays(monday, d), 'yyyy-MM-dd');
    const r = rowMap.get(dateStr);
    result.push(
      r
        ? { ...r, compliance: r.total > 0 ? Math.round((r.drinks / r.total) * 100) : 0 }
        : { date: dateStr, drinks: 0, snoozes: 0, missed: 0, total: 0, compliance: 0 },
    );
  }
  return result;
}

export function getMonthSummary(monthOffset: number = 0): DailySummary[] {
  const targetDate = subMonths(startOfMonth(new Date()), monthOffset);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const start = format(targetDate, 'yyyy-MM-dd');
  const end = format(endOfMonth(targetDate), 'yyyy-MM-dd');

  const rows = db
    .prepare(
      `SELECT
         substr(timestamp, 1, 10) AS date,
         SUM(CASE WHEN type = 'drink'  THEN 1 ELSE 0 END) AS drinks,
         SUM(CASE WHEN type = 'snooze' THEN 1 ELSE 0 END) AS snoozes,
         SUM(CASE WHEN type = 'missed' THEN 1 ELSE 0 END) AS missed,
         COUNT(*) AS total
       FROM events
       WHERE substr(timestamp, 1, 10) >= ? AND substr(timestamp, 1, 10) <= ?
       GROUP BY date
       ORDER BY date ASC`,
    )
    .all(start, end) as Array<{ date: string; drinks: number; snoozes: number; missed: number; total: number }>;

  const rowMap = new Map(rows.map((r) => [r.date, r]));
  const totalDays = getDaysInMonth(targetDate);
  const result: DailySummary[] = [];
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = format(new Date(year, month, d), 'yyyy-MM-dd');
    const r = rowMap.get(dateStr);
    result.push(
      r
        ? { ...r, compliance: r.total > 0 ? Math.round((r.drinks / r.total) * 100) : 0 }
        : { date: dateStr, drinks: 0, snoozes: 0, missed: 0, total: 0, compliance: 0 },
    );
  }
  return result;
}

export function getEarliestEventDate(): string | null {
  const row = db.prepare(`SELECT MIN(substr(timestamp, 1, 10)) AS date FROM events`).get() as { date: string | null };
  return row?.date ?? null;
}

export function deleteAllEvents(): void {
  db.prepare('DELETE FROM events').run();
}
