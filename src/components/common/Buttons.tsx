import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: string;
  iconRight?: string;
  isLoading?: boolean;
  isFullWidth?: boolean;
  className?: string;
}

export const PrimaryButton: React.FC<BaseButtonProps> = ({
  children,
  icon,
  iconRight,
  isLoading = false,
  isFullWidth = true,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`min-h-[48px] px-space-md py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:bg-on-primary-fixed-variant active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isFullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined text-[18px] animate-spin">
          progress_activity
        </span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      <span>{children}</span>
      {iconRight && !isLoading && (
        <span className="material-symbols-outlined text-[18px]">{iconRight}</span>
      )}
    </button>
  );
};

export const SecondaryButton: React.FC<BaseButtonProps> = ({
  children,
  icon,
  iconRight,
  isLoading = false,
  isFullWidth = true,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`min-h-[48px] px-space-md py-3 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-md text-label-md font-bold flex items-center justify-center gap-2 active:bg-secondary-container active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isFullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined text-[18px] animate-spin">
          progress_activity
        </span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px] text-primary">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
      {iconRight && !isLoading && (
        <span className="material-symbols-outlined text-[18px]">{iconRight}</span>
      )}
    </button>
  );
};

export const ResolutionButton: React.FC<BaseButtonProps> = ({
  children,
  icon = 'verified',
  iconRight,
  isLoading = false,
  isFullWidth = true,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`min-h-[48px] px-space-md py-3 rounded-lg bg-tertiary text-on-tertiary font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:bg-tertiary-container active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isFullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined text-[18px] animate-spin">
          progress_activity
        </span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      <span>{children}</span>
      {iconRight && !isLoading && (
        <span className="material-symbols-outlined text-[18px]">{iconRight}</span>
      )}
    </button>
  );
};

export const DestructiveButton: React.FC<BaseButtonProps> = ({
  children,
  icon,
  iconRight,
  isLoading = false,
  isFullWidth = true,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`min-h-[48px] px-space-md py-3 rounded-xl bg-surface-container-high text-error hover:bg-error-container hover:text-on-error-container font-label-md text-label-md font-semibold flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isFullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined text-[18px] animate-spin">
          progress_activity
        </span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      <span>{children}</span>
      {iconRight && !isLoading && (
        <span className="material-symbols-outlined text-[18px]">{iconRight}</span>
      )}
    </button>
  );
};
