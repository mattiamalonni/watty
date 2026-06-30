import Database from 'better-sqlite3';
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
  db.prepare('INSERT INTO events (timestamp, type) VALUES (?, ?)').run(new Date().toISOString(), type);
}

export function getDailyEvents(date: string): DrinkEvent[] {
  // date format: YYYY-MM-DD
  return db
    .prepare(
      `SELECT * FROM events
       WHERE timestamp >= ? AND timestamp < ?
       ORDER BY timestamp ASC`,
    )
    .all(`${date}T00:00:00.000Z`, `${date}T23:59:59.999Z`) as DrinkEvent[];
}

export function getWeeklySummary(weekOffset: number = 0): DailySummary[] {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(now.getDate() - weekOffset * 7);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6);
  const start = startDate.toISOString().slice(0, 10);
  const end = endDate.toISOString().slice(0, 10);

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
    .all(start, end) as Array<{
    date: string;
    drinks: number;
    snoozes: number;
    missed: number;
    total: number;
  }>;

  return rows.map((r) => ({
    ...r,
    compliance: r.total > 0 ? Math.round((r.drinks / r.total) * 100) : 0,
  }));
}

export function getEarliestEventDate(): string | null {
  const row = db.prepare(`SELECT MIN(substr(timestamp, 1, 10)) AS date FROM events`).get() as { date: string | null };
  return row?.date ?? null;
}

export function deleteAllEvents(): void {
  db.prepare('DELETE FROM events').run();
}
