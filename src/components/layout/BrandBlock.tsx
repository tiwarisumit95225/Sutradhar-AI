import React from 'react';
import { SIHBadge } from './SIHBadge';

export interface BrandBlockProps {
  subtitle?: string;
  className?: string;
}

export const BrandBlock: React.FC<BrandBlockProps> = ({
  subtitle = 'Rural Care-Gap Intelligence',
  className = '',
}) => {
  return (
    <div className={`flex flex-col justify-center min-w-0 ${className}`}>
      <div className="flex items-center gap-space-xs">
        <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight truncate">
          Sutradhar AI
        </span>
        <SIHBadge code="SIH26133" />
      </div>
      <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
        {subtitle}
      </span>
    </div>
  );
};
