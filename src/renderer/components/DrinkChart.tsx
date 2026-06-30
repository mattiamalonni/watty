import React from 'react';
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailySummary } from '../../main/db';

interface DrinkChartProps {
  data: DailySummary[];
  xAxisFormatter: (value: string) => string;
  referenceLineY?: number;
}

export default function DrinkChart({ data, xAxisFormatter, referenceLineY }: DrinkChartProps): React.JSX.Element {
  return (
    <div className="bg-surface border-edge mb-4 rounded-xl border p-4 backdrop-blur-md">
      <div className="text-muted mb-3.5 text-xs font-semibold tracking-wider uppercase">Drinks per day</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
          <XAxis
            dataKey="date"
            tickFormatter={xAxisFormatter}
            tick={{ fill: '#8e8e93', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis allowDecimals={false} tick={{ fill: '#8e8e93', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            labelFormatter={(l) =>
              typeof l === 'string'
                ? new Date(l).toLocaleDateString([], {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })
                : String(l)
            }
          />
          <Bar dataKey="drinks" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          {referenceLineY !== undefined && (
            <ReferenceLine y={referenceLineY} stroke="var(--accent)" strokeDasharray="4 3" strokeOpacity={0.5} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
