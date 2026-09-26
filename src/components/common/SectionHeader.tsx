import React, { ReactNode } from 'react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  tag?: string;
  action?: ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  tag,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-space-xs mb-space-xs ${className}`}
    >
      <div className="flex flex-col min-w-0">
        <span className="font-label-lg text-label-lg text-on-surface font-bold uppercase tracking-wide truncate">
          {title}
        </span>
        {subtitle && (
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {subtitle}
          </span>
        )}
      </div>

      <div className="flex items-center gap-space-xs flex-shrink-0">
        {tag && (
          <span className="font-code-xs text-code-xs text-secondary tracking-wider uppercase font-semibold">
            {tag}
          </span>
        )}
        {action}
      </div>
    </div>
  );
};
