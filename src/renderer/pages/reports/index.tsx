import React from 'react';
import DayTab from './DayTab';
import MonthTab from './MonthTab';
import WeekTab from './WeekTab';

type Tab = 'day' | 'week' | 'month';

interface ReportsProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Reports({ tab, onTabChange }: ReportsProps): React.JSX.Element {
  return (
    <>
      <h1 className="text-primary mb-5 text-xl font-bold">Reports</h1>

      {/* Tabs */}
      <div className="bg-surface border-edge mb-5 flex w-fit gap-0.5 rounded-lg border p-1 backdrop-blur-md">
        {(['day', 'week', 'month'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`cursor-pointer rounded-lg border-none px-4 py-1.5 text-sm font-medium transition-all duration-100 ${
              tab === t ? 'bg-content text-primary shadow-sm' : 'text-muted bg-transparent'
            }`}
            onClick={() => onTabChange(t)}
          >
            {t === 'day' ? 'Day' : t === 'week' ? 'Week' : 'Month'}
          </button>
        ))}
      </div>

      {tab === 'day' && <DayTab />}
      {tab === 'week' && <WeekTab />}
      {tab === 'month' && <MonthTab />}
    </>
  );
}
