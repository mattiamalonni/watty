import React, { useEffect, useState } from 'react'
import type { Prefs } from '../../main/prefs'

const DEFAULT_PREFS: Prefs = {
  reminderInterval: 45,
  snoozeMinutes: 15,
  launchAtLogin: true
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
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    window.watty.prefs.get().then(setPrefs)
  }, [])

  async function handleSave(): Promise<void> {
    setSaving(true)
    await window.watty.prefs.set(prefs)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

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

      <div className="flex items-center gap-3">
        <button
          className="px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg border-0 cursor-pointer transition-colors duration-100 disabled:opacity-50 disabled:cursor-default"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saved && (
          <span className="text-sm font-medium text-success">✓ Saved</span>
        )}
      </div>
    </>
  )
}
