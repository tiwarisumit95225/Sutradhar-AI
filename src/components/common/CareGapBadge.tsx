import React from 'react';

export interface CareGapBadgeProps {
  label?: string;
  isExpired?: boolean;
  className?: string;
}

export const CareGapBadge: React.FC<CareGapBadgeProps> = ({
  label = 'ACTION REQ',
  isExpired = false,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-code-xs text-code-xs font-bold shadow-xs ${
        isExpired
          ? 'bg-error text-on-error animate-pulse'
          : 'bg-error-container text-on-error-container'
      } ${className}`}
    >
      <span className="material-symbols-outlined text-[13px] leading-none">
        warning
      </span>
      <span>{label}</span>
    </span>
  );
};
