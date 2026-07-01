import { useEffect, useState } from 'react';
import type { DailySummary } from '../../main/db';
import type { Prefs } from '../../main/prefs';

interface MonthData {
  summary: DailySummary[];
  prefs: Pick<Prefs, 'goalMonth'>;
}

export function useMonthData(offset: number): MonthData {
  const [summary, setSummary] = useState<DailySummary[]>([]);
  const [prefs, setPrefs] = useState<Pick<Prefs, 'goalMonth'>>({ goalMonth: 0 });

  useEffect(() => {
    window.watty.prefs.get().then((p) => setPrefs({ goalMonth: p.goalMonth }));
  }, []);

  useEffect(() => {
    window.watty.events.getMonthly(offset).then(setSummary);
  }, [offset]);

  return { summary, prefs };
}
