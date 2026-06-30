import React, { useEffect } from 'react';
import { dayISO, dayLabel } from '../../../utils/date';
import EventList from '../../components/EventList';
import GoalProgressBar from '../../components/GoalProgressBar';
import NavControls from '../../components/NavControls';
import { useDayData } from '../../hooks/useDayData';

export default function DayTab(): React.JSX.Element {
  const { events, dayOffset, setDayOffset, prefs, earliestEventDate } = useDayData();
  const drinksToday = events.filter((e) => e.type === 'drink').length;

  useEffect(() => {
    setDayOffset(0);
  }, [setDayOffset]);

  return (
    <>
      <NavControls
        label={dayLabel(dayOffset)}
        onPrev={() => setDayOffset((o) => o + 1)}
        onNext={() => setDayOffset((o) => o - 1)}
        prevDisabled={!earliestEventDate || dayISO(dayOffset) <= earliestEventDate}
        nextDisabled={dayOffset === 0}
        prevAriaLabel="Previous day"
        nextAriaLabel="Next day"
      />

      {prefs.goalDay > 0 && (
        <GoalProgressBar
          label="Daily Goal"
          current={drinksToday}
          goal={prefs.goalDay}
          reachedMessage={dayOffset === 0 ? 'Goal reached today! 🎉' : 'Goal reached! 🎉'}
        />
      )}

      <EventList events={events} dayOffset={dayOffset} />
    </>
  );
}
