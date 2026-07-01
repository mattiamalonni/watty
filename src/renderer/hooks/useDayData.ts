import { useEffect, useState } from 'react';
import type { DrinkEvent } from '../../main/db';
import type { Prefs } from '../../main/prefs';
import { dayISO } from '../../utils/date';

interface HourlySummary {
  hour: number;
  drinks: number;
}

interface DayData {
  hourlySummary: HourlySummary[];
  prefs: Pick<Prefs, 'goalDay'>;
}

function buildHourlySummary(events: DrinkEvent[]): HourlySummary[] {
  const counts = Array.from({ length: 24 }, (_, h) => ({ hour: h, drinks: 0 }));
  for (const e of events) {
    if (e.type === 'drink') {
      const h = parseInt(e.timestamp.slice(11, 13), 10);
      if (h >= 0 && h < 24) counts[h].drinks++;
    }
  }
  return counts;
}

export function useDayData(offset: number): DayData {
  const [hourlySummary, setHourlySummary] = useState<HourlySummary[]>(() =>
    Array.from({ length: 24 }, (_, h) => ({ hour: h, drinks: 0 })),
  );
  const [prefs, setPrefs] = useState<Pick<Prefs, 'goalDay'>>({ goalDay: 0 });

  useEffect(() => {
    window.watty.prefs.get().then((p) => setPrefs({ goalDay: p.goalDay }));
  }, []);

  useEffect(() => {
    window.watty.events.getDaily(dayISO(offset)).then((events) => setHourlySummary(buildHourlySummary(events)));
  }, [offset]);

  return { hourlySummary, prefs };
}
