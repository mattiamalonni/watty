import React from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

interface DrinkChartProps {
  data: Record<string, string | number>[];
  xAxisKey?: string;
  label?: string;
  xAxisFormatter: (value: string) => string;
  tooltipLabelFormatter?: (value: string | number) => string;
  referenceLineY?: number;
}

export default function DrinkChart({
  data,
  xAxisKey = 'date',
  label,
  xAxisFormatter,
  tooltipLabelFormatter,
  referenceLineY,
}: DrinkChartProps): React.JSX.Element {
  const defaultTooltipLabel = (l: string | number): string =>
    typeof l === 'string' ? new Date(l).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }) : String(l);

  return (
    <div className="mb-4">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5ac8fa" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#0055cc" stopOpacity={0.85} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={(v) => xAxisFormatter(String(v))}
            tick={{ fill: '#8e8e93', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
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
            labelFormatter={(l) => (tooltipLabelFormatter ? tooltipLabelFormatter(l) : defaultTooltipLabel(l))}
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
