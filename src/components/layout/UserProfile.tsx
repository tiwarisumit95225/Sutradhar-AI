import React from 'react';

export interface UserProfileProps {
  initials?: string;
  onClick?: () => void;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  initials,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-xs active:opacity-85 transition-opacity ${className}`}
      title="User Profile & Settings"
      aria-label="User profile and settings"
    >
      {initials ? (
        <span className="font-label-sm text-code-xs text-on-primary font-bold">
          {initials}
        </span>
      ) : (
        <span className="material-symbols-outlined text-on-primary text-[18px]">
          person
        </span>
      )}
    </button>
  );
};
