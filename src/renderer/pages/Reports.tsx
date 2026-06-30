import React, { useEffect, useState } from 'react';
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailySummary, DrinkEvent } from '../../main/db';
import type { Prefs } from '../../main/prefs';
import ChartBarIcon from '../assets/icons/chart-bar.svg?react';
import ChevronLeftIcon from '../assets/icons/chevron-left.svg?react';
import ChevronRightIcon from '../assets/icons/chevron-right.svg?react';
import DropletIcon from '../assets/icons/droplet.svg?react';
import SkipForwardIcon from '../assets/icons/skip-forward.svg?react';
import XCircleIcon from '../assets/icons/x-circle.svg?react';

type Tab = 'today' | 'week' | 'month';

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

function monthLabel(offset: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  return d.toLocaleDateString([], { month: 'long', year: 'numeric' });
}

function monthStartISO(offset: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  return d.toISOString().slice(0, 10);
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

function dayISO(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

function dayLabel(offset: number): string {
  if (offset === 0) return 'Today';
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function Reports({ tab: tabProp }: { tab: 'today' | 'week' | 'month' }): React.JSX.Element {
  const [tab, setTab] = useState<Tab>(tabProp);
  const [prevTabProp, setPrevTabProp] = useState(tabProp);
  const [dailyEvents, setDailyEvents] = useState<DrinkEvent[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<DailySummary[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [dayOffset, setDayOffset] = useState(0);
  const [monthlySummary, setMonthlySummary] = useState<DailySummary[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [earliestEventDate, setEarliestEventDate] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Pick<Prefs, 'goalDay' | 'goalWeek' | 'goalMonth'>>({
    goalDay: 0,
    goalWeek: 0,
    goalMonth: 0,
  });

  if (prevTabProp !== tabProp) {
    setPrevTabProp(tabProp);
    setTab(tabProp);
  }

  useEffect(() => {
    window.watty.events.getEarliestEventDate().then(setEarliestEventDate);
    window.watty.prefs.get().then((p) => setPrefs({ goalDay: p.goalDay, goalWeek: p.goalWeek, goalMonth: p.goalMonth }));
  }, []);

  useEffect(() => {
    setDayOffset(0);
  }, [tab]);

  useEffect(() => {
    window.watty.events.getDaily(dayISO(dayOffset)).then(setDailyEvents);
  }, [dayOffset]);

  useEffect(() => {
    window.watty.events.getWeekly(weekOffset).then(setWeeklySummary);
  }, [weekOffset]);

  useEffect(() => {
    window.watty.events.getMonthly(monthOffset).then(setMonthlySummary);
  }, [monthOffset]);

  const drinksToday = dailyEvents.filter((e) => e.type === 'drink').length;

  return (
    <>
      <h1 className="text-primary mb-5 text-xl font-bold">Reports</h1>

      {/* Tabs */}
      <div className="bg-surface border-edge mb-5 flex w-fit gap-0.5 rounded-lg border p-1 backdrop-blur-md">
        {(['today', 'week', 'month'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`cursor-pointer rounded-lg border-none px-4 py-1.5 text-sm font-medium transition-all duration-100 ${
              tab === t ? 'bg-content text-primary shadow-sm' : 'text-muted bg-transparent'
            }`}
            onClick={() => setTab(t)}
          >
            {t === 'today' ? 'Today' : t === 'week' ? 'Week' : 'Month'}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <>
          {/* Day navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setDayOffset((o) => o + 1)}
              disabled={!earliestEventDate || dayISO(dayOffset) <= earliestEventDate}
              className="text-muted flex cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent p-1.5 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous day"
            >
              <ChevronLeftIcon width={18} height={18} />
            </button>
            <span className="text-primary text-sm font-semibold">{dayLabel(dayOffset)}</span>
            <button
              onClick={() => setDayOffset((o) => o - 1)}
              disabled={dayOffset === 0}
              className="text-muted flex cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent p-1.5 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next day"
            >
              <ChevronRightIcon width={18} height={18} />
            </button>
          </div>

          {/* Goal progress bar */}
          {prefs.goalDay > 0 && (
            <div className="bg-surface border-edge mb-5 rounded-xl border px-4 py-3 backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-muted text-xs font-semibold tracking-wider uppercase">Daily Goal</span>
                <span className="text-primary text-sm font-bold">
                  {drinksToday} / {prefs.goalDay}
                </span>
              </div>
              <div className="bg-edge h-2 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((drinksToday / prefs.goalDay) * 100))}%`,
                    background: drinksToday >= prefs.goalDay ? '#30d158' : 'var(--accent)',
                  }}
                />
              </div>
              {drinksToday >= prefs.goalDay && (
                <p className="text-muted mt-1.5 text-xs">{dayOffset === 0 ? 'Goal reached today! 🎉' : 'Goal reached! 🎉'}</p>
              )}
            </div>
          )}

          {dailyEvents.length === 0 ? (
            <div className="text-muted py-12 text-center text-sm">
              <div className="text-muted mb-2.5 flex justify-center">
                <DropletIcon width={36} height={36} />
              </div>
              {dayOffset === 0 ? 'No reminders yet today. Stay hydrated!' : 'No reminders on this day.'}
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
              {/* Week goal progress bar */}
              {prefs.goalWeek > 0 &&
                (() => {
                  const weekDrinks = weeklySummary.reduce((s, d) => s + d.drinks, 0);
                  return (
                    <div className="bg-surface border-edge mb-4 rounded-xl border px-4 py-3 backdrop-blur-md">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-muted text-xs font-semibold tracking-wider uppercase">Weekly Goal</span>
                        <span className="text-primary text-sm font-bold">
                          {weekDrinks} / {prefs.goalWeek}
                        </span>
                      </div>
                      <div className="bg-edge h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round((weekDrinks / prefs.goalWeek) * 100))}%`,
                            background: weekDrinks >= prefs.goalWeek ? '#30d158' : 'var(--accent)',
                          }}
                        />
                      </div>
                      {weekDrinks >= prefs.goalWeek && <p className="text-muted mt-1.5 text-xs">Goal reached this week! 🎉</p>}
                    </div>
                  );
                })()}

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
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
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
                    <Bar dataKey="drinks" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                    {prefs.goalWeek > 0 && (
                      <ReferenceLine y={prefs.goalWeek / 7} stroke="var(--accent)" strokeDasharray="4 3" strokeOpacity={0.5} />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'month' && (
        <>
          {/* Month navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setMonthOffset((o) => o + 1)}
              disabled={!earliestEventDate || monthStartISO(monthOffset) <= earliestEventDate.slice(0, 7) + '-01'}
              className="text-muted flex cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent p-1.5 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous month"
            >
              <ChevronLeftIcon width={18} height={18} />
            </button>
            <span className="text-primary text-sm font-semibold">{monthLabel(monthOffset)}</span>
            <button
              onClick={() => setMonthOffset((o) => o - 1)}
              disabled={monthOffset === 0}
              className="text-muted flex cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent p-1.5 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next month"
            >
              <ChevronRightIcon width={18} height={18} />
            </button>
          </div>

          {monthlySummary.every((d) => d.total === 0) ? (
            <div className="text-muted py-12 text-center text-sm">
              <div className="text-muted mb-2.5 flex justify-center">
                <ChartBarIcon width={36} height={36} />
              </div>
              No data for this month yet.
            </div>
          ) : (
            <>
              {/* Month goal progress bar */}
              {prefs.goalMonth > 0 &&
                (() => {
                  const monthDrinks = monthlySummary.reduce((s, d) => s + d.drinks, 0);
                  return (
                    <div className="bg-surface border-edge mb-4 rounded-xl border px-4 py-3 backdrop-blur-md">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-muted text-xs font-semibold tracking-wider uppercase">Monthly Goal</span>
                        <span className="text-primary text-sm font-bold">
                          {monthDrinks} / {prefs.goalMonth}
                        </span>
                      </div>
                      <div className="bg-edge h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round((monthDrinks / prefs.goalMonth) * 100))}%`,
                            background: monthDrinks >= prefs.goalMonth ? '#30d158' : 'var(--accent)',
                          }}
                        />
                      </div>
                      {monthDrinks >= prefs.goalMonth && <p className="text-muted mt-1.5 text-xs">Goal reached this month! 🎉</p>}
                    </div>
                  );
                })()}

              {/* Chart */}
              <div className="bg-surface border-edge mb-4 rounded-xl border p-4 backdrop-blur-md">
                <div className="text-muted mb-3.5 text-xs font-semibold tracking-wider uppercase">Drinks per day</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={monthlySummary.filter((d) => d.date <= todayISO())}
                    margin={{ top: 4, right: 4, bottom: 4, left: -20 }}
                  >
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => String(new Date(d).getDate())}
                      interval={4}
                      tick={{ fill: '#8e8e93', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: '#8e8e93', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
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
                    <Bar dataKey="drinks" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                    {prefs.goalMonth > 0 && (
                      <ReferenceLine
                        y={
                          prefs.goalMonth /
                          new Date(new Date().getFullYear(), new Date().getMonth() - monthOffset + 1, 0).getDate()
                        }
                        stroke="var(--accent)"
                        strokeDasharray="4 3"
                        strokeOpacity={0.5}
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
