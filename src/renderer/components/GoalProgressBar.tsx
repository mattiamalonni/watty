import React from 'react';

interface GoalProgressBarProps {
  label: string;
  current: number;
  goal: number;
  reachedMessage: string;
}

export default function GoalProgressBar({ label, current, goal, reachedMessage }: GoalProgressBarProps): React.JSX.Element {
  const reached = current >= goal;
  return (
    <div className="bg-surface border-edge mb-4 rounded-xl border px-4 py-3 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-muted text-xs font-semibold tracking-wider uppercase">{label}</span>
        <span className="text-primary text-sm font-bold">
          {current} / {goal}
        </span>
      </div>
      <div className="bg-edge h-2 w-full overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(100, Math.round((current / goal) * 100))}%`,
            background: reached ? '#30d158' : 'var(--accent)',
          }}
        />
      </div>
      {reached && <p className="text-muted mt-1.5 text-xs">{reachedMessage}</p>}
    </div>
  );
}
