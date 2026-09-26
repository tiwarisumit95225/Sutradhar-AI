import React from 'react';

export interface SIHBadgeProps {
  code?: string;
  className?: string;
}

export const SIHBadge: React.FC<SIHBadgeProps> = ({
  code = 'SIH26133',
  className = '',
}) => {
  return (
    <span
      className={`font-code-xs text-code-xs bg-primary-container text-on-primary font-semibold px-space-xs py-0.5 rounded shadow-xs ${className}`}
    >
      {code}
    </span>
  );
};
