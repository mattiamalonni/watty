import React, { useEffect, useState } from 'react'
import {
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import type { DailySummary, DrinkEvent } from '../../main/db'
import ChartBarIcon from '../assets/icons/chart-bar.svg?react'
import DropletIcon from '../assets/icons/droplet.svg?react'
import FlameIcon from '../assets/icons/flame.svg?react'
import SkipForwardIcon from '../assets/icons/skip-forward.svg?react'
import XCircleIcon from '../assets/icons/x-circle.svg?react'

type Tab = 'today' | 'week'

const EVENT_ICON_COMPONENTS: Record<string, React.ReactNode> = {
  drink: <DropletIcon width={18} height={18} />,
  snooze: <SkipForwardIcon width={18} height={18} />,
  missed: <XCircleIcon width={18} height={18} />
}

const EVENT_LABELS: Record<string, string> = {
  drink: 'Had a drink',
  snooze: 'Snoozed reminder',
  missed: 'Missed reminder'
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function shortDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString([], { weekday: 'short' })
}

function calcStreak(summaries: DailySummary[]): number {
  const today = todayISO()
  let streak = 0
  const sorted = [...summaries].sort((a, b) => b.date.localeCompare(a.date))
  for (const s of sorted) {
    if (s.date > today) continue
    if (s.drinks > 0) streak++
    else break
  }
  return streak
}

export default function Reports(): React.JSX.Element {
  const [tab, setTab] = useState<Tab>('today')
  const [dailyEvents, setDailyEvents] = useState<DrinkEvent[]>([])
  const [weeklySummary, setWeeklySummary] = useState<DailySummary[]>([])

  useEffect(() => {
    window.watty.events.getDaily(todayISO()).then(setDailyEvents)
    window.watty.events.getWeekly().then(setWeeklySummary)
  }, [])

  const totalToday = dailyEvents.length
  const drinksToday = dailyEvents.filter((e) => e.type === 'drink').length
  const complianceToday =
    totalToday > 0 ? Math.round((drinksToday / totalToday) * 100) : 0

  const streak = calcStreak(weeklySummary)

  return (
    <>
      <h1 className="text-xl font-bold mb-5 text-primary">Reports</h1>

      {/* Tabs */}
      <div className="flex gap-0.5 bg-surface border border-edge rounded-lg p-1 mb-5 w-fit backdrop-blur-md">
        {(['today', 'week'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer border-none transition-all duration-100 ${
              tab === t
                ? 'bg-content text-primary shadow-sm'
                : 'bg-transparent text-muted'
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
          <div className="inline-flex items-baseline gap-1.5 bg-surface border border-edge rounded-full px-4 py-1.5 text-2xl font-bold mb-5 backdrop-blur-md">
            {complianceToday}%
            <span className="text-muted text-xs font-normal">
              compliance today ({drinksToday}/{totalToday} reminders)
            </span>
          </div>

          {dailyEvents.length === 0 ? (
            <div className="text-center py-12 text-muted text-sm">
              <div className="flex justify-center mb-2.5 text-muted"><DropletIcon width={36} height={36} /></div>
              No reminders yet today. Stay hydrated!
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {dailyEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 bg-surface border border-edge rounded-xl px-3.5 py-2.5 backdrop-blur-md"
                >
                  <span className="w-6 flex items-center justify-center shrink-0">{EVENT_ICON_COMPONENTS[event.type]}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-primary">{formatTime(event.timestamp)}</div>
                    <div className="text-xs text-muted mt-px">{EVENT_LABELS[event.type]}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'week' && (
        <>
          {weeklySummary.length === 0 ? (
            <div className="text-center py-12 text-muted text-sm">
              <div className="flex justify-center mb-2.5 text-muted"><ChartBarIcon width={36} height={36} /></div>
              No data for this week yet.
            </div>
          ) : (
            <>
              {/* Chart */}
              <div className="bg-surface border border-edge rounded-xl p-4 mb-4 backdrop-blur-md">
                <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3.5">
                  Drinks per day
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={weeklySummary} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={shortDay}
                      tick={{ fill: '#8e8e93', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#8e8e93', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        color: 'var(--text)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)'
                      }}
                      labelFormatter={(l) =>
                        typeof l === 'string'
                          ? new Date(l).toLocaleDateString([], {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric'
                            })
                          : String(l)
                      }
                    />
                    <Bar dataKey="drinks" radius={[4, 4, 0, 0]}>
                      {weeklySummary.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.compliance >= 50 ? '#30d158' : '#ff453a'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Streak */}
              <div className="bg-gradient-to-br from-[#ff9500] to-[#ff6b00] text-white rounded-xl px-4 py-3.5 flex items-center gap-3">
                <FlameIcon width={28} height={28} />
                <div>
                  <strong className="text-2xl font-extrabold">{streak}</strong>
                  <p className="text-xs opacity-85 mt-0.5">day streak — keep it up!</p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}
