import React, { useEffect, useRef, useState } from 'react';
import type { Prefs } from '../../main/prefs';

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
  weeklyReportDay: 1,
  goalEnabled: false,
  goalTarget: 8,
  showDrinkCount: false,
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 30];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function TimeSelect({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}: {
  hour: number;
  minute: number;
  onHourChange: (v: number) => void;
  onMinuteChange: (v: number) => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-1">
      <select
        className="bg-input border-edge text-primary cursor-pointer rounded-md border px-2 py-1 text-sm"
        value={hour}
        onChange={(e) => onHourChange(Number(e.target.value))}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {String(h).padStart(2, '0')}
          </option>
        ))}
      </select>
      <span className="text-muted text-sm">:</span>
      <select
        className="bg-input border-edge text-primary cursor-pointer rounded-md border px-2 py-1 text-sm"
        value={minute}
        onChange={(e) => onMinuteChange(Number(e.target.value))}
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {String(m).padStart(2, '0')}
          </option>
        ))}
      </select>
    </div>
  );
}

function SliderGroup({
  label,
  description,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}): React.JSX.Element {
  return (
    <div className="mb-5">
      <label className="text-muted mb-2 block text-xs font-semibold tracking-wider uppercase">{label}</label>
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
        <span className="text-primary bg-input border-edge min-w-14 rounded-md border px-2 py-1 text-center text-sm font-semibold">
          {value} min
        </span>
      </div>
      <p className="text-muted mt-1 text-xs">{description}</p>
    </div>
  );
}

function TestNotificationButton(): React.JSX.Element {
  const [sent, setSent] = useState(false);

  function handleClick(): void {
    window.watty.testNotification();
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  }

  return (
    <button
      className="bg-surface hover:bg-edge text-primary border-edge shrink-0 cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={handleClick}
      disabled={sent}
    >
      {sent ? 'Sent!' : 'Send Test'}
    </button>
  );
}

export default function Settings(): React.JSX.Element {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const isFirstRender = useRef(true);

  useEffect(() => {
    window.watty.prefs.get().then(setPrefs);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      window.watty.prefs.set(prefs);
    }, 500);
    return () => clearTimeout(timer);
  }, [prefs]);

  return (
    <>
      <h1 className="text-primary mb-6 text-xl font-bold">Settings</h1>

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
        <div className="bg-surface border-edge flex items-center justify-between rounded-xl border px-3.5 py-3 backdrop-blur-md">
          <div className="flex flex-col gap-0.5">
            <span className="text-primary text-sm font-medium">Launch at Login</span>
            <span className="text-muted text-xs">Start Watty automatically when you log in.</span>
          </div>
          <label className="relative h-6 w-11 shrink-0">
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

      {/* Show Drink Count in Menu Bar */}
      <div className="mb-5">
        <div className="bg-surface border-edge flex items-center justify-between rounded-xl border px-3.5 py-3 backdrop-blur-md">
          <div className="flex flex-col gap-0.5">
            <span className="text-primary text-sm font-medium">Show Drink Count in Menu Bar</span>
            <span className="text-muted text-xs">Display today&apos;s drink count next to the menu bar icon.</span>
          </div>
          <label className="relative h-6 w-11 shrink-0">
            <input
              type="checkbox"
              className="toggle-input"
              checked={prefs.showDrinkCount}
              onChange={(e) => setPrefs((p) => ({ ...p, showDrinkCount: e.target.checked }))}
            />
            <span className="toggle-track" />
          </label>
        </div>
      </div>

      {/* Daily Drink Goal */}
      <div className="mb-5">
        <div className="bg-surface border-edge rounded-xl border px-3.5 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-primary text-sm font-medium">Daily Drink Goal</span>
              <span className="text-muted text-xs">Track progress toward a daily drink count target.</span>
            </div>
            <label className="relative h-6 w-11 shrink-0">
              <input
                type="checkbox"
                className="toggle-input"
                checked={prefs.goalEnabled}
                onChange={(e) => setPrefs((p) => ({ ...p, goalEnabled: e.target.checked }))}
              />
              <span className="toggle-track" />
            </label>
          </div>
          {prefs.goalEnabled && (
            <div className="border-edge mt-3 flex items-center gap-2 border-t pt-3">
              <span className="text-muted text-xs">Target</span>
              <input
                type="number"
                min={1}
                max={20}
                step={1}
                value={prefs.goalTarget}
                onChange={(e) => {
                  const v = Math.min(20, Math.max(1, Number(e.target.value)));
                  setPrefs((p) => ({ ...p, goalTarget: v }));
                }}
                className="bg-input border-edge text-primary w-16 rounded-md border px-2 py-1 text-center text-sm font-semibold"
              />
              <span className="text-muted text-xs">drinks / day</span>
            </div>
          )}
        </div>
      </div>

      {/* Report Notifications */}
      <div className="mb-5">
        <label className="text-muted mb-2 block text-xs font-semibold tracking-wider uppercase">Report Notifications</label>

        {/* Daily Report */}
        <div className="bg-surface border-edge mb-2 rounded-xl border px-3.5 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-primary text-sm font-medium">Daily Report</span>
              <span className="text-muted text-xs">Get a daily hydration summary notification.</span>
            </div>
            <label className="relative h-6 w-11 shrink-0">
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
            <div className="border-edge mt-3 flex items-center gap-2 border-t pt-3">
              <span className="text-muted text-xs">At</span>
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
        <div className="bg-surface border-edge rounded-xl border px-3.5 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-primary text-sm font-medium">Weekly Report</span>
              <span className="text-muted text-xs">Get a weekly hydration summary notification.</span>
            </div>
            <label className="relative h-6 w-11 shrink-0">
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
            <div className="border-edge mt-3 flex items-center gap-2 border-t pt-3">
              <span className="text-muted text-xs">Every</span>
              <select
                className="bg-input border-edge text-primary cursor-pointer rounded-md border px-2 py-1 text-sm"
                value={prefs.weeklyReportDay}
                onChange={(e) => setPrefs((p) => ({ ...p, weeklyReportDay: Number(e.target.value) }))}
              >
                {DAYS.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
              <span className="text-muted text-xs">at</span>
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

      {/* Test Notification */}
      <div className="mb-5">
        <div className="bg-surface border-edge flex items-center justify-between rounded-xl border px-3.5 py-3 backdrop-blur-md">
          <div className="flex flex-col gap-0.5">
            <span className="text-primary text-sm font-medium">Test Notification</span>
            <span className="text-muted text-xs">Send a test notification to verify system permissions.</span>
          </div>
          <TestNotificationButton />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="bg-surface hover:bg-edge text-primary border-edge cursor-pointer rounded-lg border px-5 py-2 text-sm font-semibold transition-colors duration-100"
          onClick={() => setPrefs({ ...DEFAULT_PREFS })}
        >
          Reset to Defaults
        </button>
        <button
          className="bg-surface cursor-pointer rounded-lg border border-red-800/50 px-5 py-2 text-sm font-semibold text-red-400 transition-colors duration-100 hover:bg-red-900/40"
          onClick={() => window.watty.events.deleteAll()}
        >
          Delete Data
        </button>
      </div>
    </>
  );
}
