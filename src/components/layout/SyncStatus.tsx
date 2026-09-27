import React from 'react';

export interface SyncStatusProps {
  isOnline?: boolean;
  label?: string;
  onClick?: () => void;
  className?: string;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  isOnline = true,
  label,
  onClick,
  className = '',
}) => {
  const displayLabel = label || (isOnline ? 'ONLINE' : 'OFFLINE');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[48px] flex items-center justify-center gap-1.5 px-space-sm py-1 rounded bg-surface-container-high text-on-surface transition-colors cursor-pointer hover:bg-surface-container-highest ${className}`}
      title="Sync pending local actions · simulated only"
      aria-label={displayLabel}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-tertiary animate-pulse' : 'bg-error animate-ping'
        }`}
      />
      <span className="font-label-sm text-label-sm font-medium">
        {displayLabel}
      </span>
    </button>
  );
};
