import React, { useEffect } from 'react';
import { ToastMessage } from '../../context/ShellContext';

export interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
  autoCloseDuration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  toast,
  onClose,
  autoCloseDuration = 4000,
}) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);
    return () => clearTimeout(timer);
  }, [toast, onClose, autoCloseDuration]);

  if (!toast) return null;

  const iconMap: Record<string, { icon: string; color: string }> = {
    success: { icon: 'task_alt', color: 'text-tertiary' },
    alert: { icon: 'warning', color: 'text-error' },
    info: { icon: 'info', color: 'text-primary' },
  };

  const currentIcon = iconMap[toast.type || 'info'];

  return (
    <div
      role="alert"
      className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 p-space-sm rounded-xl bg-surface-container-lowest text-on-surface shadow-xl border border-outline-variant/40 flex items-start gap-space-sm transition-all"
    >
      <span
        className={`material-symbols-outlined text-[22px] flex-shrink-0 ${currentIcon.color}`}
      >
        {currentIcon.icon}
      </span>

      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-label-md text-label-md font-bold text-on-surface truncate">
          {toast.title}
        </span>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
          {toast.description}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="min-h-[48px] min-w-[48px] rounded text-secondary hover:text-on-surface active:bg-surface-container transition-colors flex items-center justify-center cursor-pointer"
        aria-label="Close notification"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};
