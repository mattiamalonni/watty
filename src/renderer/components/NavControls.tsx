import React from 'react';
import ChevronLeftIcon from '../assets/icons/chevron-left.svg?react';
import ChevronRightIcon from '../assets/icons/chevron-right.svg?react';

interface NavControlsProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled: boolean;
  nextDisabled: boolean;
  prevAriaLabel?: string;
  nextAriaLabel?: string;
}

export default function NavControls({
  label,
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
  prevAriaLabel = 'Previous',
  nextAriaLabel = 'Next',
}: NavControlsProps): React.JSX.Element {
  return (
    <div className="mb-4 flex items-center justify-between">
      <button
        onClick={onPrev}
        disabled={prevDisabled}
        className="text-muted flex cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent p-1.5 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label={prevAriaLabel}
      >
        <ChevronLeftIcon width={18} height={18} />
      </button>
      <span className="text-primary text-sm font-semibold">{label}</span>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="text-muted flex cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent p-1.5 transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label={nextAriaLabel}
      >
        <ChevronRightIcon width={18} height={18} />
      </button>
    </div>
  );
}
