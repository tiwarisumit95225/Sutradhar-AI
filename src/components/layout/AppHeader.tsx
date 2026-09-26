import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandBlock } from './BrandBlock';
import { SyncStatus } from './SyncStatus';
import { RoleSwitcher } from './RoleSwitcher';
import { UserProfile } from './UserProfile';
import { useShell, UserRole } from '../../context/ShellContext';
import { ROUTE_PATHS } from '../../routes/paths';

export interface AppHeaderProps {
  subtitle?: string;
  role?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  isOnline?: boolean;
  onToggleOnline?: () => void;
  className?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  subtitle = 'Rural Care-Gap Intelligence',
  role,
  onRoleChange,
  isOnline,
  onToggleOnline,
  className = '',
}) => {
  const shell = useShell();
  const navigate = useNavigate();

  const activeRole = role ?? shell.role;
  const handleRoleChange = (nextRole: UserRole) => {
    (onRoleChange ?? shell.setRole)(nextRole);
    navigate(
      nextRole === 'FRONTLINE_ASHA'
        ? ROUTE_PATHS.frontlineDashboard
        : ROUTE_PATHS.facilityDashboard
    );
  };
  const activeOnline = isOnline ?? shell.isOnline;
  const handleToggleOnline = onToggleOnline ?? shell.toggleOnline;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-safe bg-surface border-b border-outline-variant/30 shadow-sm ${className}`}
    >
      <div className="px-margin py-space-xs flex flex-col gap-space-xs max-w-screen-xl mx-auto sm:h-20 sm:flex-row sm:items-center sm:justify-between sm:gap-space-sm sm:py-0">
        <div className="flex items-center justify-between gap-space-sm min-w-0">
          <BrandBlock subtitle={subtitle} className="flex-1" />
          <UserProfile className="sm:hidden" />
        </div>

        <div className="flex items-center justify-between gap-space-xs sm:justify-end sm:gap-space-sm">
          <SyncStatus
            isOnline={activeOnline}
            onClick={handleToggleOnline}
            className="flex-1 sm:flex-none"
          />
          <RoleSwitcher
            currentRole={activeRole}
            onRoleChange={handleRoleChange}
          />
          <UserProfile className="hidden sm:flex" />
        </div>
      </div>
    </header>
  );
};
