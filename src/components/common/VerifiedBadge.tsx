import React from 'react';

export interface VerifiedBadgeProps {
  label?: string;
  subtext?: string;
  icon?: string;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  label = 'EVIDENCED',
  subtext,
  icon = 'verified',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-code-xs text-code-xs font-bold bg-tertiary-fixed text-on-tertiary-fixed-variant shadow-xs ${className}`}
    >
      <span className="material-symbols-outlined text-[14px] text-tertiary leading-none">
        {icon}
      </span>
      <span>{label}</span>
      {subtext && (
        <span className="text-[9px] font-normal opacity-85">({subtext})</span>
      )}
    </span>
  );
};
