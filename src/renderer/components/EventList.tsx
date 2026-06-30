import React from 'react';
import type { DrinkEvent } from '../../main/db';
import { formatTime } from '../../utils/date';
import DropletIcon from '../assets/icons/droplet.svg?react';
import SkipForwardIcon from '../assets/icons/skip-forward.svg?react';
import XCircleIcon from '../assets/icons/x-circle.svg?react';

const EVENT_ICON_COMPONENTS: Record<string, React.ReactNode> = {
  drink: <DropletIcon width={18} height={18} />,
  snooze: <SkipForwardIcon width={18} height={18} />,
  missed: <XCircleIcon width={18} height={18} />,
};

const EVENT_LABELS: Record<string, string> = {
  drink: 'Had a drink',
  snooze: 'Snoozed reminder',
  missed: 'Missed reminder',
};

interface EventListProps {
  events: DrinkEvent[];
  dayOffset: number;
}

export default function EventList({ events, dayOffset }: EventListProps): React.JSX.Element {
  if (events.length === 0) {
    return (
      <div className="text-muted py-12 text-center text-sm">
        <div className="text-muted mb-2.5 flex justify-center">
          <DropletIcon width={36} height={36} />
        </div>
        {dayOffset === 0 ? 'No reminders yet today. Stay hydrated!' : 'No reminders on this day.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-surface border-edge flex items-center gap-3 rounded-xl border px-3.5 py-2.5 backdrop-blur-md"
        >
          <span className="flex w-6 shrink-0 items-center justify-center">{EVENT_ICON_COMPONENTS[event.type]}</span>
          <div className="flex-1">
            <div className="text-primary text-sm font-medium">{formatTime(event.timestamp)}</div>
            <div className="text-muted mt-px text-xs">{EVENT_LABELS[event.type]}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
