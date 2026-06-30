import { useEffect, useState } from 'react';
import type { DrinkEvent } from '../../main/db';
import type { Prefs } from '../../main/prefs';
import { dayISO } from '../../utils/date';

interface DayData {
  events: DrinkEvent[];
  dayOffset: number;
  setDayOffset: React.Dispatch<React.SetStateAction<number>>;
  prefs: Pick<Prefs, 'goalDay'>;
  earliestEventDate: string | null;
}

export function useDayData(): DayData {
  const [events, setEvents] = useState<DrinkEvent[]>([]);
  const [dayOffset, setDayOffset] = useState(0);
  const [prefs, setPrefs] = useState<Pick<Prefs, 'goalDay'>>({ goalDay: 0 });
  const [earliestEventDate, setEarliestEventDate] = useState<string | null>(null);

  useEffect(() => {
    window.watty.events.getEarliestEventDate().then(setEarliestEventDate);
    window.watty.prefs.get().then((p) => setPrefs({ goalDay: p.goalDay }));
  }, []);

  useEffect(() => {
    window.watty.events.getDaily(dayISO(dayOffset)).then(setEvents);
  }, [dayOffset]);

  return { events, dayOffset, setDayOffset, prefs, earliestEventDate };
}
