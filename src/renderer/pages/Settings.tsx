import React, { useEffect, useRef, useState } from 'react'
import type { Prefs } from '../../main/prefs'

const DEFAULT_PREFS: Prefs = {
  reminderInterval: 45,
  snoozeMinutes: 15,
  launchAtLogin: true,
  dailyReport: true,
  dailyReportHour: 17,
  dailyReportMinute: 30,
  weeklyReport: true,
  weeklyReportHour: 9,
  weeklyReportMinute: 0,
  weeklyReportDay: 1
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 30]
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function TimeSelect({
  hour,
  minute,
  onHourChange,
  onMinuteChange
}: {
  hour: number
  minute: number
  onHourChange: (v: number) => void
  onMinuteChange: (v: number) => void
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-1">
      <select
        className="text-sm bg-input border border-edge rounded-md px-2 py-1 text-primary cursor-pointer"
        value={hour}
        onChange={(e) => onHourChange(Number(e.target.value))}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
        ))}
      </select>
      <span className="text-muted text-sm">:</span>
      <select
        className="text-sm bg-input border border-edge rounded-md px-2 py-1 text-primary cursor-pointer"
        value={minute}
        onChange={(e) => onMinuteChange(Number(e.target.value))}
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
        ))}
      </select>
    </div>
  )
}

function SliderGroup({
  label,
  description,
  min,
  max,
  step,
  value,
  onChange
}: {
  label: string
  description: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
}): React.JSX.Element {
  return (
    <div className="mb-5">
      <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          className="flex-1"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="text-sm font-semibold min-w-14 text-primary bg-input border border-edge rounded-md px-2 py-1 text-center">
          {value} min
        </span>
      </div>
      <p className="text-xs text-muted mt-1">{description}</p>
    </div>
  )
}

export default function Settings(): React.JSX.Element {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const isFirstRender = useRef(true)

  useEffect(() => {
    window.watty.prefs.get().then(setPrefs)
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      window.watty.prefs.set(prefs)
    }, 500)
    return () => clearTimeout(timer)
  }, [prefs])

  return (
    <>
      <h1 className="text-xl font-bold mb-6 text-primary">Settings</h1>

      <SliderGroup
        label="Reminder Interval"
        description={`Watty will remind you to drink every ${prefs.reminderInterval} minutes.`}
        min={5}
        max={120}
        step={5}
        value={prefs.reminderInterval}
        onChange={(v) => setPrefs((p) => ({ ...p, reminderInterval: v }))}
      />

      <SliderGroup
        label="Snooze Duration"
        description="How long to wait before re-firing a snoozed reminder."
        min={5}
        max={60}
        step={5}
        value={prefs.snoozeMinutes}
        onChange={(v) => setPrefs((p) => ({ ...p, snoozeMinutes: v }))}
      />

      {/* Launch at Login */}
      <div className="mb-5">
        <div className="flex items-center justify-between bg-surface border border-edge rounded-xl px-3.5 py-3 backdrop-blur-md">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-primary">Launch at Login</span>
            <span className="text-xs text-muted">Start Watty automatically when you log in.</span>
          </div>
          <label className="relative w-11 h-6 shrink-0">
            <input
              type="checkbox"
              className="toggle-input"
              checked={prefs.launchAtLogin}
              onChange={(e) => setPrefs((p) => ({ ...p, launchAtLogin: e.target.checked }))}
            />
            <span className="toggle-track" />
          </label>
        </div>
      </div>

      {/* Report Notifications */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          Report Notifications
        </label>

        {/* Daily Report */}
        <div className="bg-surface border border-edge rounded-xl px-3.5 py-3 backdrop-blur-md mb-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-primary">Daily Report</span>
              <span className="text-xs text-muted">Get a daily hydration summary notification.</span>
            </div>
            <label className="relative w-11 h-6 shrink-0">
              <input
                type="checkbox"
                className="toggle-input"
                checked={prefs.dailyReport}
                onChange={(e) => setPrefs((p) => ({ ...p, dailyReport: e.target.checked }))}
              />
              <span className="toggle-track" />
            </label>
          </div>
          {prefs.dailyReport && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-edge">
              <span className="text-xs text-muted">At</span>
              <TimeSelect
                hour={prefs.dailyReportHour}
                minute={prefs.dailyReportMinute}
                onHourChange={(v) => setPrefs((p) => ({ ...p, dailyReportHour: v }))}
                onMinuteChange={(v) => setPrefs((p) => ({ ...p, dailyReportMinute: v }))}
              />
            </div>
          )}
        </div>

        {/* Weekly Report */}
        <div className="bg-surface border border-edge rounded-xl px-3.5 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-primary">Weekly Report</span>
              <span className="text-xs text-muted">Get a weekly hydration summary notification.</span>
            </div>
            <label className="relative w-11 h-6 shrink-0">
              <input
                type="checkbox"
                className="toggle-input"
                checked={prefs.weeklyReport}
                onChange={(e) => setPrefs((p) => ({ ...p, weeklyReport: e.target.checked }))}
              />
              <span className="toggle-track" />
            </label>
          </div>
          {prefs.weeklyReport && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-edge">
              <span className="text-xs text-muted">Every</span>
              <select
                className="text-sm bg-input border border-edge rounded-md px-2 py-1 text-primary cursor-pointer"
                value={prefs.weeklyReportDay}
                onChange={(e) => setPrefs((p) => ({ ...p, weeklyReportDay: Number(e.target.value) }))}
              >
                {DAYS.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
              <span className="text-xs text-muted">at</span>
              <TimeSelect
                hour={prefs.weeklyReportHour}
                minute={prefs.weeklyReportMinute}
                onHourChange={(v) => setPrefs((p) => ({ ...p, weeklyReportHour: v }))}
                onMinuteChange={(v) => setPrefs((p) => ({ ...p, weeklyReportMinute: v }))}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="px-5 py-2 bg-surface hover:bg-edge text-primary text-sm font-semibold rounded-lg border border-edge cursor-pointer transition-colors duration-100"
          onClick={() => setPrefs({ ...DEFAULT_PREFS })}
        >
          Reset to Defaults
        </button>
        <button
          className="px-5 py-2 bg-surface hover:bg-red-900/40 text-red-400 text-sm font-semibold rounded-lg border border-red-800/50 cursor-pointer transition-colors duration-100"
          onClick={() => window.watty.events.deleteAll()}
        >
          Delete Data
        </button>
      </div>
    </>
  )
}
