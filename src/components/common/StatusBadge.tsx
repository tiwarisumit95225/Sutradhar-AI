
import React from 'react';

export type StatusBadgeVariant =
  | 'critical'
  | 'warning'
  | 'success'
  | 'primary'
  | 'neutral'
  | 'in-transit';

export interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  icon?: string;
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  pulse = false,
  className = '',
}) => {
  const variantStyles: Record<StatusBadgeVariant, { bg: string; text: string; dot?: string }> = {
    critical: {
      bg: 'bg-error-container',
      text: 'text-on-error-container',
      dot: 'bg-error',
    },
    warning: {
      bg: 'bg-secondary-container',
      text: 'text-on-surface',
      dot: 'bg-warning',
    },
    success: {
      bg: 'bg-tertiary-fixed',
      text: 'text-on-tertiary-fixed-variant',
      dot: 'bg-tertiary',
    },
    primary: {
      bg: 'bg-primary-fixed',
      text: 'text-on-primary-fixed',
      dot: 'bg-primary',
    },
    neutral: {
      bg: 'bg-surface-container-high',
      text: 'text-on-surface',
      dot: 'bg-secondary',
    },
    'in-transit': {
      bg: 'bg-secondary-container',
      text: 'text-on-secondary-fixed',
      dot: 'bg-primary',
    },
  };

  const style = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full font-code-xs text-code-xs font-bold uppercase tracking-wide shadow-xs ${style.bg} ${style.text} ${className}`}
    >
      {(pulse || variant === 'warning') && style.dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      )}
      {icon && (
        <span className="material-symbols-outlined text-[13px] leading-none">
          {icon}
        </span>
      )}
      <span className="truncate">{label}</span>
    </span>
  );
};
