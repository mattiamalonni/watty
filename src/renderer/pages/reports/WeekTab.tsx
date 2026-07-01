import React from 'react';
import { shortDay } from '../../../utils/date';
import ChartBarIcon from '../../assets/icons/chart-bar.svg?react';
import DrinkChart from '../../components/DrinkChart';
import GoalProgressBar from '../../components/GoalProgressBar';
import { useWeekData } from '../../hooks/useWeekData';

export default function WeekTab({ offset }: { offset: number }): React.JSX.Element {
  const { summary, prefs } = useWeekData(offset);
  const weekDrinks = summary.reduce((s, d) => s + d.drinks, 0);

  return (
    <>
      {summary.length === 0 ? (
        <div className="text-muted py-12 text-center text-sm">
          <div className="text-muted mb-2.5 flex justify-center">
            <ChartBarIcon width={36} height={36} />
          </div>
          No data for this week yet.
        </div>
      ) : (
        <>
          {prefs.goalWeek > 0 && (
            <GoalProgressBar label="Weekly Goal" current={weekDrinks} goal={prefs.goalWeek} reachedMessage="Goal reached!" />
          )}
          <DrinkChart
            data={summary}
            xAxisFormatter={shortDay}
            referenceLineY={prefs.goalWeek > 0 ? prefs.goalWeek / 7 : undefined}
          />
        </>
      )}
    </>
  );
}
