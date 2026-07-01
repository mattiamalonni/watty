import React from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailySummary } from '../../main/db';

interface DrinkChartProps {
  data: DailySummary[];
  xAxisFormatter: (value: string) => string;
  referenceLineY?: number;
}

export default function DrinkChart({ data, xAxisFormatter, referenceLineY }: DrinkChartProps): React.JSX.Element {
  return (
    <div
      className="bg-surface border-edge mb-4 rounded-xl border p-4 backdrop-blur-md"
      style={{ backgroundImage: 'linear-gradient(180deg, rgba(0,170,255,0.10) 0%, rgba(0,60,180,0.18) 100%)' }}
    >
      <div className="text-muted mb-3.5 text-xs font-semibold tracking-wider uppercase">Drinks per day</div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 4, left: -20 }}>
          <defs>
            <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5ac8fa" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#0055cc" stopOpacity={0.85} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={xAxisFormatter}
            tick={{ fill: '#8e8e93', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis allowDecimals={false} tick={{ fill: '#8e8e93', fontSize: 11 }} axisLine={false} tickLine={false} />
          <CartesianGrid vertical={false} stroke="rgba(90,200,250,0.18)" strokeDasharray="0" />
          <Tooltip
            cursor={{ stroke: 'rgba(90,200,250,0.4)', strokeWidth: 1, fill: 'rgba(0,170,255,0.06)' }}
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
          <Area
            type="monotone"
            dataKey="drinks"
            fill="url(#waterFill)"
            stroke="#5ac8fa"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#5ac8fa', stroke: '#fff', strokeWidth: 2 }}
          />
          {referenceLineY !== undefined && (
            <ReferenceLine y={referenceLineY} stroke="#5ac8fa" strokeDasharray="4 3" strokeOpacity={0.6} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
