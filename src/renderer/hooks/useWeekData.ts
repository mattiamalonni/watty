import { useEffect, useState } from 'react';
import type { DailySummary } from '../../main/db';
import type { Prefs } from '../../main/prefs';

interface WeekData {
  summary: DailySummary[];
  prefs: Pick<Prefs, 'goalWeek'>;
}

export function useWeekData(offset: number): WeekData {
  const [summary, setSummary] = useState<DailySummary[]>([]);
  const [prefs, setPrefs] = useState<Pick<Prefs, 'goalWeek'>>({ goalWeek: 0 });

  useEffect(() => {
    window.watty.prefs.get().then((p) => setPrefs({ goalWeek: p.goalWeek }));
  }, []);

  useEffect(() => {
    window.watty.events.getWeekly(offset).then(setSummary);
  }, [offset]);

  return { summary, prefs };
}
