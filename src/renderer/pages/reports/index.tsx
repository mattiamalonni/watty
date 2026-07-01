import React, { useEffect, useState } from 'react';
import { dayISO, dayLabel, monthLabel, monthStartISO, weekLabel, windowStartISO } from '../../../utils/date';
import NavControls from '../../components/NavControls';
import DayTab from './DayTab';
import MonthTab from './MonthTab';
import WeekTab from './WeekTab';

type Tab = 'day' | 'week' | 'month';

interface ReportsProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  initialMonthOffset?: number;
}

export default function Reports({ tab, onTabChange, initialMonthOffset = 0 }: ReportsProps): React.JSX.Element {
  const [offset, setOffset] = useState(0);
  const [earliestEventDate, setEarliestEventDate] = useState<string | null>(null);

  useEffect(() => {
    window.watty.events.getEarliestEventDate().then(setEarliestEventDate);
  }, []);

  // Sync deep-link month navigation
  useEffect(() => {
    if (tab === 'month') setOffset(initialMonthOffset);
  }, [initialMonthOffset, tab]);

  function handleTabChange(t: Tab): void {
    setOffset(0);
    onTabChange(t);
  }

  const label = tab === 'day' ? dayLabel(offset) : tab === 'week' ? weekLabel(offset) : monthLabel(offset);

  const prevDisabled =
    !earliestEventDate ||
    (tab === 'day'
      ? dayISO(offset) <= earliestEventDate
      : tab === 'week'
        ? earliestEventDate >= windowStartISO(offset)
        : monthStartISO(offset) <= earliestEventDate.slice(0, 7) + '-01');

  return (
    <>
      <h1 className="text-primary mb-5 text-xl font-bold">Reports</h1>

      {/* Tabs + NavControls row */}
      <div className="mb-5 flex items-center justify-between">
        <div className="bg-surface border-edge flex w-fit gap-0.5 rounded-lg border p-1 backdrop-blur-md">
          {(['day', 'week', 'month'] as Tab[]).map((t) => (
            <button
              key={t}
              className={`cursor-pointer rounded-lg border-none px-4 py-1.5 text-sm font-medium transition-all duration-100 ${
                tab === t ? 'bg-content text-primary shadow-sm' : 'text-muted bg-transparent'
              }`}
              onClick={() => handleTabChange(t)}
            >
              {t === 'day' ? 'Day' : t === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>

        <NavControls
          label={label}
          onPrev={() => setOffset((o) => o + 1)}
          onNext={() => setOffset((o) => o - 1)}
          prevDisabled={prevDisabled}
          nextDisabled={offset === 0}
          prevAriaLabel={`Previous ${tab}`}
          nextAriaLabel={`Next ${tab}`}
          className="flex w-44 items-center justify-between"
        />
      </div>

      {tab === 'day' && <DayTab offset={offset} />}
      {tab === 'week' && <WeekTab offset={offset} />}
      {tab === 'month' && <MonthTab offset={offset} />}
    </>
  );
}
