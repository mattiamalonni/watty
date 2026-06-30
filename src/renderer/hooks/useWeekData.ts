import { useEffect, useState } from 'react';
import type { DailySummary } from '../../main/db';
import type { Prefs } from '../../main/prefs';

interface WeekData {
  summary: DailySummary[];
  weekOffset: number;
  setWeekOffset: React.Dispatch<React.SetStateAction<number>>;
  prefs: Pick<Prefs, 'goalWeek'>;
  earliestEventDate: string | null;
}

export function useWeekData(): WeekData {
  const [summary, setSummary] = useState<DailySummary[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [prefs, setPrefs] = useState<Pick<Prefs, 'goalWeek'>>({ goalWeek: 0 });
  const [earliestEventDate, setEarliestEventDate] = useState<string | null>(null);

  useEffect(() => {
    window.watty.events.getEarliestEventDate().then(setEarliestEventDate);
    window.watty.prefs.get().then((p) => setPrefs({ goalWeek: p.goalWeek }));
  }, []);

  useEffect(() => {
    window.watty.events.getWeekly(weekOffset).then(setSummary);
  }, [weekOffset]);

  return { summary, weekOffset, setWeekOffset, prefs, earliestEventDate };
}
