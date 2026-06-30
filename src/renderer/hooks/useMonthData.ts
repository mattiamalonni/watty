import { useEffect, useState } from 'react';
import type { DailySummary } from '../../main/db';
import type { Prefs } from '../../main/prefs';

interface MonthData {
  summary: DailySummary[];
  monthOffset: number;
  setMonthOffset: React.Dispatch<React.SetStateAction<number>>;
  prefs: Pick<Prefs, 'goalMonth'>;
  earliestEventDate: string | null;
}

export function useMonthData(initialOffset: number = 0): MonthData {
  const [summary, setSummary] = useState<DailySummary[]>([]);
  const [monthOffset, setMonthOffset] = useState(initialOffset);
  const [prefs, setPrefs] = useState<Pick<Prefs, 'goalMonth'>>({ goalMonth: 0 });
  const [earliestEventDate, setEarliestEventDate] = useState<string | null>(null);

  useEffect(() => {
    window.watty.events.getEarliestEventDate().then(setEarliestEventDate);
    window.watty.prefs.get().then((p) => setPrefs({ goalMonth: p.goalMonth }));
  }, []);

  useEffect(() => {
    window.watty.events.getMonthly(monthOffset).then(setSummary);
  }, [monthOffset]);

  return { summary, monthOffset, setMonthOffset, prefs, earliestEventDate };
}
