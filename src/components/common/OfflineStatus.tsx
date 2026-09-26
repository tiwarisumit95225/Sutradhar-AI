import React, { useState } from 'react';
import { useShell } from '../../context/ShellContext';

export interface OfflineStatusProps {
  onSync?: () => void;
  className?: string;
}

export const OfflineStatus: React.FC<OfflineStatusProps> = ({
  onSync,
  className = '',
}) => {
  const shell = useShell();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncClick = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    if (onSync) {
      onSync();
    }
    setTimeout(() => {
      setIsSyncing(false);
      shell.showToast(
        'Offline cache simulation complete',
        'Local queue simulation only. No external registry is contacted.',
        'success'
      );
    }, 800);
  };

  return (
    <div
      className={`bg-surface-container-low px-space-sm py-1.5 rounded-lg flex items-center justify-between gap-space-xs text-on-surface-variant shadow-xs ${className}`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0">
          sync_saved_locally
        </span>
        <span className="font-code-xs text-code-xs leading-tight">
          <span className="block font-bold text-primary">PROTOTYPE • SYNTHETIC DATA</span>
          <span className="block">ABDM-ALIGNED • SIMULATED INTEGRATION</span>
          <span className="block">Offline-ready; changes sync when connected.</span>
        </span>
      </div>

      <button
        type="button"
        onClick={handleSyncClick}
        disabled={isSyncing}
        className="min-h-[48px] min-w-[48px] font-code-xs text-code-xs text-primary font-bold px-2 py-1 rounded bg-surface-container-high hover:bg-secondary-container active:scale-95 transition-all flex items-center justify-center gap-1 flex-shrink-0 cursor-pointer disabled:opacity-50"
      >
        <span
          className={`material-symbols-outlined text-[13px] ${
            isSyncing ? 'animate-spin' : ''
          }`}
        >
          sync
        </span>
        <span>{isSyncing ? 'SYNCING...' : 'SYNC'}</span>
      </button>
    </div>
  );
};
