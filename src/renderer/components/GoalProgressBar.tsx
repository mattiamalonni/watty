import React from 'react';
import FlameIcon from '../assets/icons/flame.svg?react';

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
        <div className="flex items-center gap-2">
          <span className="text-muted text-xs font-semibold tracking-wider uppercase">{label}</span>
          {reached && (
            <span className="flex items-center gap-1 text-xs text-[#30d158]">
              <FlameIcon width={12} height={12} />
              {reachedMessage}
            </span>
          )}
        </div>
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
    </div>
  );
}
