import React from 'react';
import ChartBarIcon from '../../assets/icons/chart-bar.svg?react';
import DrinkChart from '../../components/DrinkChart';
import GoalProgressBar from '../../components/GoalProgressBar';
import { useMonthData } from '../../hooks/useMonthData';

export default function MonthTab({ offset }: { offset: number }): React.JSX.Element {
  const { summary, prefs } = useMonthData(offset);
  const monthDrinks = summary.reduce((s, d) => s + d.drinks, 0);

  const now = new Date();
  const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0).getDate();

  return (
    <>
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
            <GoalProgressBar label="Monthly Goal" current={monthDrinks} goal={prefs.goalMonth} reachedMessage="Goal reached!" />
          )}
          <DrinkChart
            data={summary}
            xAxisFormatter={(d) => String(new Date(d).getDate())}
            referenceLineY={prefs.goalMonth > 0 ? prefs.goalMonth / daysInCurrentMonth : undefined}
          />
        </>
      )}
    </>
  );
}
