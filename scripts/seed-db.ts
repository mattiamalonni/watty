/**
 * seed-db.ts — Populate watty.db with realistic fake data for testing reports.
 *
 * Usage:
 *   npm run seed
 *   npm run seed -- --days 30
 *   npm run seed -- --db /path/to/custom/watty.db
 *   npm run seed -- --append
 */

import { format, subDays } from 'date-fns';
import { DatabaseSync } from 'node:sqlite';
import os from 'os';
import path from 'path';

// ── Config ────────────────────────────────────────────────────────────────────

const REMINDER_INTERVAL_MIN = 30; // minutes between reminders
const ACTIVE_HOUR_START = 8; // first reminder at 08:00
const ACTIVE_HOUR_END = 22; // no reminders after 22:00
const SKIP_DAY_PROBABILITY = 0.15; // 15% of days have zero events

// Weighted event types: 70% drink, 15% snooze, 15% missed
const EVENT_WEIGHTS: { type: 'drink' | 'snooze' | 'missed'; weight: number }[] = [
  { type: 'drink', weight: 0.7 },
  { type: 'snooze', weight: 0.15 },
  { type: 'missed', weight: 0.15 },
];

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function getFlag(name: string): string | undefined {
  const idx = args.indexOf(name);
  return idx !== -1 ? args[idx + 1] : undefined;
}

const days = parseInt(getFlag('--days') ?? '90', 10);
const append = args.includes('--append');
const dbPath = getFlag('--db') ?? path.join(os.homedir(), 'Library', 'Application Support', 'Watty', 'watty.db');

// ── Helpers ───────────────────────────────────────────────────────────────────

function pickType(): 'drink' | 'snooze' | 'missed' {
  const r = Math.random();
  let cumulative = 0;
  for (const { type, weight } of EVENT_WEIGHTS) {
    cumulative += weight;
    if (r < cumulative) return type;
  }
  return 'drink';
}

function generateDayEvents(dateStr: string): { timestamp: string; type: string }[] {
  if (Math.random() < SKIP_DAY_PROBABILITY) return [];

  const events: { timestamp: string; type: string }[] = [];
  const activeMinutes = (ACTIVE_HOUR_END - ACTIVE_HOUR_START) * 60;
  const slots = Math.floor(activeMinutes / REMINDER_INTERVAL_MIN);

  for (let i = 0; i < slots; i++) {
    const totalMinutes = ACTIVE_HOUR_START * 60 + i * REMINDER_INTERVAL_MIN;
    // Add up to ±5 min jitter so timestamps don't look mechanical
    const jitter = Math.floor(Math.random() * 11) - 5;
    const finalMinutes = Math.min(Math.max(totalMinutes + jitter, ACTIVE_HOUR_START * 60), ACTIVE_HOUR_END * 60 - 1);
    const hh = String(Math.floor(finalMinutes / 60)).padStart(2, '0');
    const mm = String(finalMinutes % 60).padStart(2, '0');
    const ss = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    events.push({ timestamp: `${dateStr} ${hh}:${mm}:${ss}`, type: pickType() });
  }

  return events;
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log(`DB path: ${dbPath}`);
console.log(`Days:    ${days}`);
console.log(`Mode:    ${append ? 'append' : 'wipe + reseed'}`);
console.log();

const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    type      TEXT NOT NULL CHECK(type IN ('drink','snooze','missed'))
  );
  CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
`);

if (!append) {
  const deleteStmt = db.prepare('DELETE FROM events');
  const deleted = deleteStmt.run();
  console.log(`Wiped ${deleted.changes} existing rows.`);
}

const insert = db.prepare('INSERT INTO events (timestamp, type) VALUES (?, ?)');

const today = new Date();
let totalInserted = 0;

db.exec('BEGIN');
try {
  for (let d = days - 1; d >= 0; d--) {
    const date = subDays(today, d);
    const dateStr = format(date, 'yyyy-MM-dd');
    const events = generateDayEvents(dateStr);
    for (const row of events) {
      insert.run(row.timestamp, row.type);
    }
    totalInserted += events.length;
  }
  db.exec('COMMIT');
} catch (err) {
  db.exec('ROLLBACK');
  throw err;
}

console.log(`Inserted ${totalInserted} events across ${days} days.`);
db.close();
