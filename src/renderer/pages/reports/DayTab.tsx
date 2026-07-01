import React from 'react';
import DrinkChart from '../../components/DrinkChart';
import GoalProgressBar from '../../components/GoalProgressBar';
import { useDayData } from '../../hooks/useDayData';

function formatHour(v: string): string {
  const h = Number(v);
  if (h === 0) return '12a';
  if (h < 12) return `${h}a`;
  if (h === 12) return '12p';
  return `${h - 12}p`;
}

export default function DayTab({ offset }: { offset: number }): React.JSX.Element {
  const { hourlySummary, prefs } = useDayData(offset);
  const drinksToday = hourlySummary.reduce((s, h) => s + h.drinks, 0);

  return (
    <>
      {prefs.goalDay > 0 && (
        <GoalProgressBar label="Daily Goal" current={drinksToday} goal={prefs.goalDay} reachedMessage="Goal reached!" />
      )}
      <DrinkChart
        data={hourlySummary}
        xAxisKey="hour"
        label="Drinks per hour"
        xAxisFormatter={formatHour}
        tooltipLabelFormatter={(h) => {
          const n = Number(h);
          const period = n < 12 ? 'AM' : 'PM';
          const display = n === 0 ? 12 : n > 12 ? n - 12 : n;
          return `${display}:00 ${period}`;
        }}
      />
    </>
  );
}
