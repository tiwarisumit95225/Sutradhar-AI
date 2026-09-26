import React from 'react';

export type ReferralStatusType = 'IN_TRANSIT' | 'AWAITING_ARRIVAL' | 'DISPATCHED' | 'ARRIVED';

export interface ReferralStatusBadgeProps {
  status?: ReferralStatusType;
  label?: string;
  className?: string;
}

export const ReferralStatusBadge: React.FC<ReferralStatusBadgeProps> = ({
  status = 'IN_TRANSIT',
  label,
  className = '',
}) => {
  const configs: Record<
    ReferralStatusType,
    { defaultLabel: string; bg: string; text: string; icon: string; dot?: boolean; dotColor?: string }
  > = {
    IN_TRANSIT: {
      defaultLabel: 'IN TRANSIT',
      bg: 'bg-primary-fixed',
      text: 'text-on-primary-fixed',
      icon: 'forward_media',
      dot: true,
      dotColor: 'bg-primary',
    },
    AWAITING_ARRIVAL: {
      defaultLabel: 'Awaiting Arrival',
      bg: 'bg-secondary-container',
      text: 'text-on-surface',
      icon: 'schedule',
      dot: true,
      dotColor: 'bg-warning',
    },
    DISPATCHED: {
      defaultLabel: 'DISPATCHED',
      bg: 'bg-surface-container-high',
      text: 'text-primary',
      icon: 'send',
      dot: false,
    },
    ARRIVED: {
      defaultLabel: 'ARRIVED (REACH=TRUE)',
      bg: 'bg-tertiary-fixed',
      text: 'text-on-tertiary-fixed-variant',
      icon: 'task_alt',
      dot: false,
    },
  };

  const config = configs[status];
  const displayLabel = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-code-xs text-code-xs font-bold uppercase tracking-wide shadow-xs ${config.bg} ${config.text} ${className}`}
    >
      {config.dot && (
        <span className={`w-1.5 h-1.5 rounded-full animate-ping ${config.dotColor}`} />
      )}
      <span className="material-symbols-outlined text-[13px] leading-none">
        {config.icon}
      </span>
      <span>{displayLabel}</span>
    </span>
  );
};
