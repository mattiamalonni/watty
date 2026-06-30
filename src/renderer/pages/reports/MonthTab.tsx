import React from 'react';
import { monthLabel, monthStartISO, todayISO } from '../../../utils/date';
import ChartBarIcon from '../../assets/icons/chart-bar.svg?react';
import DrinkChart from '../../components/DrinkChart';
import GoalProgressBar from '../../components/GoalProgressBar';
import NavControls from '../../components/NavControls';
import { useMonthData } from '../../hooks/useMonthData';

export default function MonthTab(): React.JSX.Element {
  const { summary, monthOffset, setMonthOffset, prefs, earliestEventDate } = useMonthData();
  const monthDrinks = summary.reduce((s, d) => s + d.drinks, 0);

  const now = new Date();
  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0).getDate();
  const filteredData = summary.filter((d) => d.date <= todayISO());

  return (
    <>
      <NavControls
        label={monthLabel(monthOffset)}
        onPrev={() => setMonthOffset((o) => o + 1)}
        onNext={() => setMonthOffset((o) => o - 1)}
        prevDisabled={!earliestEventDate || monthStartISO(monthOffset) <= earliestEventDate.slice(0, 7) + '-01'}
        nextDisabled={monthOffset === 0}
        prevAriaLabel="Previous month"
        nextAriaLabel="Next month"
      />

      {summary.every((d) => d.total === 0) ? (
        <div className="text-muted py-12 text-center text-sm">
          <div className="text-muted mb-2.5 flex justify-center">
            <ChartBarIcon width={36} height={36} />
          </div>
          No data for this month yet.
        </div>
      ) : (
        <>
          {prefs.goalMonth > 0 && (
            <GoalProgressBar
              label="Monthly Goal"
              current={monthDrinks}
              goal={prefs.goalMonth}
              reachedMessage="Goal reached this month! 🎉"
            />
          )}
          <DrinkChart
            data={filteredData}
            xAxisFormatter={(d) => String(new Date(d).getDate())}
            referenceLineY={prefs.goalMonth > 0 ? prefs.goalMonth / daysInCurrentMonth : undefined}
          />
        </>
      )}
    </>
  );
}
