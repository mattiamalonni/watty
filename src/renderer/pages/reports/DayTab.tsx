import React from 'react';
import EventList from '../../components/EventList';
import GoalProgressBar from '../../components/GoalProgressBar';
import { useDayData } from '../../hooks/useDayData';

export default function DayTab({ offset }: { offset: number }): React.JSX.Element {
  const { events, prefs } = useDayData(offset);
  const drinksToday = events.filter((e) => e.type === 'drink').length;

  return (
    <>
      {prefs.goalDay > 0 && (
        <GoalProgressBar label="Daily Goal" current={drinksToday} goal={prefs.goalDay} reachedMessage="Goal reached!" />
      )}
      <EventList events={events} dayOffset={offset} />
    </>
  );
}
