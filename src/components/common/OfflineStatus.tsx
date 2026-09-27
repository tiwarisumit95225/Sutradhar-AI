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
    const syncedCount = shell.syncPendingActions();
    if (onSync) {
      onSync();
    }
    window.setTimeout(() => {
      setIsSyncing(false);
      shell.showToast(shell.isOnline ? 'Simulated sync complete' : 'Still offline', shell.isOnline
        ? `${syncedCount} local action${syncedCount === 1 ? '' : 's'} marked SYNCED. No server acknowledgement was received.`
        : 'Actions remain in local prototype storage with PENDING SYNC status.', shell.isOnline ? 'success' : 'info');
    }, 250);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`bg-surface-container-low px-space-sm py-1.5 rounded-lg flex items-center justify-between gap-space-xs text-on-surface-variant shadow-xs ${className}`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0">
          sync_saved_locally
        </span>
        <span className="font-code-xs text-code-xs leading-tight">
          <span className="block font-bold text-primary">PROTOTYPE • SYNTHETIC DATA</span>
          <span className="block">{shell.isOnline ? (shell.pendingSyncCount ? 'PENDING SYNC' : shell.localQueue.length ? 'SYNCED' : 'ONLINE') : 'OFFLINE'}</span>
          {!shell.isOnline && shell.pendingSyncCount > 0 && <span className="block">PENDING SYNC · {shell.pendingSyncCount} ACTIONS</span>}
          <span className="block">{!shell.isOnline && shell.pendingSyncCount ? 'Saved locally — will sync when connection returns.' : 'SIMULATED SYNC · LOCAL PROTOTYPE STORAGE · NO SERVER'}</span>
        </span>
      </div>

      <button
        type="button"
        onClick={handleSyncClick}
        aria-label="Sync pending prototype actions"
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
