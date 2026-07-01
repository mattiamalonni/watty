import { useEffect, useState } from 'react';
import type { DrinkEvent } from '../../main/db';
import type { Prefs } from '../../main/prefs';
import { dayISO } from '../../utils/date';

interface DayData {
  events: DrinkEvent[];
  prefs: Pick<Prefs, 'goalDay'>;
}

export function useDayData(offset: number): DayData {
  const [events, setEvents] = useState<DrinkEvent[]>([]);
  const [prefs, setPrefs] = useState<Pick<Prefs, 'goalDay'>>({ goalDay: 0 });

  useEffect(() => {
    window.watty.prefs.get().then((p) => setPrefs({ goalDay: p.goalDay }));
  }, []);

  useEffect(() => {
    window.watty.events.getDaily(dayISO(offset)).then(setEvents);
  }, [offset]);

  return { events, prefs };
}
