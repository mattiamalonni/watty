import React, { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailySummary, DrinkEvent } from '../../main/db';
import type { Prefs } from '../../main/prefs';
import ChartBarIcon from '../assets/icons/chart-bar.svg?react';
import ChevronLeftIcon from '../assets/icons/chevron-left.svg?react';
import ChevronRightIcon from '../assets/icons/chevron-right.svg?react';
import DropletIcon from '../assets/icons/droplet.svg?react';
import FlameIcon from '../assets/icons/flame.svg?react';
import SkipForwardIcon from '../assets/icons/skip-forward.svg?react';
import XCircleIcon from '../assets/icons/x-circle.svg?react';

type Tab = 'today' | 'week';

const EVENT_ICON_COMPONENTS: Record<string, React.ReactNode> = {
  drink: <DropletIcon width={18} height={18} />,
  snooze: <SkipForwardIcon width={18} height={18} />,
  missed: <XCircleIcon width={18} height={18} />,
};

const EVENT_LABELS: Record<string, string> = {
  drink: 'Had a drink',
  snooze: 'Snoozed reminder',
  missed: 'Missed reminder',
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function shortDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString([], { weekday: 'short' });
}

function weekLabel(offset: number): string {
  if (offset === 0) return 'This Week';
  if (offset === 1) return 'Last Week';
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() - offset * 7);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  const fmt = (d: Date): string => d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

function windowStartISO(offset: number): string {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (offset * 7 + 6));
  return start.toISOString().slice(0, 10);
}

function calcStreak(summaries: DailySummary[]): number {
  const today = todayISO();
  let streak = 0;
  const sorted = [...summaries].sort((a, b) => b.date.localeCompare(a.date));
  for (const s of sorted) {
    if (s.date > today) continue;
    if (s.drinks > 0) streak++;
    else break;
  }
  return streak;
}

export default function Reports({ tab: tabProp }: { tab: 'today' | 'week' }): React.JSX.Element {
  const [tab, setTab] = useState<Tab>(tabProp);
  const [prevTabProp, setPrevTabProp] = useState(tabProp);
  const [dailyEvents, setDailyEvents] = useState<DrinkEvent[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<DailySummary[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [earliestEventDate, setEarliestEventDate] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Pick<Prefs, 'goalEnabled' | 'goalTarget'>>({ goalEnabled: false, goalTarget: 8 });

  if (prevTabProp !== tabProp) {
    setPrevTabProp(tabProp);
    setTab(tabProp);
  }

  useEffect(() => {
    window.watty.events.getDaily(todayISO()).then(setDailyEvents);
    window.watty.events.getEarliestEventDate().then(setEarliestEventDate);
    window.watty.prefs.get().then((p) => setPrefs({ goalEnabled: p.goalEnabled, goalTarget: p.goalTarget }));
  }, []);

  useEffect(() => {
    window.watty.events.getWeekly(weekOffset).then(setWeeklySummary);
  }, [weekOffset]);

  const totalToday = dailyEvents.length;
  const drinksToday = dailyEvents.filter((e) => e.type === 'drink').length;
  const complianceToday = totalToday > 0 ? Math.round((drinksToday / totalToday) * 100) : 0;

  const streak = calcStreak(weeklySummary);

  return (
    <>
      <h1 className="text-primary mb-5 text-xl font-bold">Reports</h1>

      {/* Tabs */}
      <div className="bg-surface border-edge mb-5 flex w-fit gap-0.5 rounded-lg border p-1 backdrop-blur-md">
        {(['today', 'week'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`cursor-pointer rounded-lg border-none px-4 py-1.5 text-sm font-medium transition-all duration-100 ${
              tab === t ? 'bg-content text-primary shadow-sm' : 'text-muted bg-transparent'
            }`}
            onClick={() => setTab(t)}
          >
            {t === 'today' ? 'Today' : 'This Week'}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <>
          {/* Compliance badge */}
          <div className="bg-surface border-edge mb-5 inline-flex items-baseline gap-1.5 rounded-full border px-4 py-1.5 text-2xl font-bold backdrop-blur-md">
            {complianceToday}%
            <span className="text-muted text-xs font-normal">
              compliance today ({drinksToday}/{totalToday} reminders)
            </span>
          </div>

          {/* Goal progress bar */}
          {prefs.goalEnabled && (
            <div className="bg-surface border-edge mb-5 rounded-xl border px-4 py-3 backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-muted text-xs font-semibold tracking-wider uppercase">Daily Goal</span>
                <span className="text-primary text-sm font-bold">
                  {drinksToday} / {prefs.goalTarget}
                </span>
              </div>
              <div className="bg-edge h-2 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((drinksToday / prefs.goalTarget) * 100))}%`,
                    background: drinksToday >= prefs.goalTarget ? '#30d158' : 'var(--accent)',
                  }}
                />
              </div>
              {drinksToday >= prefs.goalTarget && <p className="text-muted mt-1.5 text-xs">Goal reached today! 🎉</p>}
            </div>
          )}

          {dailyEvents.length === 0 ? (
            <div className="text-muted py-12 text-center text-sm">
              <div className="text-muted mb-2.5 flex justify-center">
                <DropletIcon width={36} height={36} />
              </div>
              No reminders yet today. Stay hydrated!
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {dailyEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-surface border-edge flex items-center gap-3 rounded-xl border px-3.5 py-2.5 backdrop-blur-md"
                >
                  <span className="flex w-6 shrink-0 items-center justify-center">{EVENT_ICON_COMPONENTS[event.type]}</span>
                  <div className="flex-1">
                    <div className="text-primary text-sm font-medium">{formatTime(event.timestamp)}</div>
                    <div className="text-muted mt-px text-xs">{EVENT_LABELS[event.type]}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'week' && (
        <>
          {/* Week navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setWeekOffset((o) => o + 1)}
              disabled={!earliestEventDate || earliestEventDate >= windowStartISO(weekOffset)}
              className="text-muted flex cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent p-1.5 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous week"
            >
              <ChevronLeftIcon width={18} height={18} />
            </button>
            <span className="text-primary text-sm font-semibold">{weekLabel(weekOffset)}</span>
            <button
              onClick={() => setWeekOffset((o) => o - 1)}
              disabled={weekOffset === 0}
              className="text-muted flex cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent p-1.5 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next week"
            >
              <ChevronRightIcon width={18} height={18} />
            </button>
          </div>

          {weeklySummary.length === 0 ? (
            <div className="text-muted py-12 text-center text-sm">
              <div className="text-muted mb-2.5 flex justify-center">
                <ChartBarIcon width={36} height={36} />
              </div>
              No data for this week yet.
            </div>
          ) : (
            <>
              {/* Chart */}
              <div className="bg-surface border-edge mb-4 rounded-xl border p-4 backdrop-blur-md">
                <div className="text-muted mb-3.5 text-xs font-semibold tracking-wider uppercase">Drinks per day</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={weeklySummary} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={shortDay}
                      tick={{ fill: '#8e8e93', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: '#8e8e93', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        color: 'var(--text)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                      }}
                      labelFormatter={(l) =>
                        typeof l === 'string'
                          ? new Date(l).toLocaleDateString([], {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                            })
                          : String(l)
                      }
                    />
                    <Bar dataKey="drinks" radius={[4, 4, 0, 0]}>
                      {weeklySummary.map((entry, index) => (
                        <Cell key={index} fill={entry.compliance >= 50 ? '#30d158' : '#ff453a'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Streak */}
              <div className="flex items-center gap-3 rounded-xl bg-linear-to-br from-[#ff9500] to-[#ff6b00] px-4 py-3.5 text-white">
                <FlameIcon width={28} height={28} />
                <div>
                  <strong className="text-2xl font-extrabold">{streak}</strong>
                  <p className="mt-0.5 text-xs opacity-85">day streak — keep it up!</p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
