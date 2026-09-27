import React, { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { BottomNavigation } from './BottomNavigation';
import { PageContainer } from './PageContainer';
import { Toast } from '../common/Toast';
import { useShell } from '../../context/ShellContext';

export interface GlobalAppShellProps {
  children: ReactNode;
  subtitle?: string;
  hasBottomNav?: boolean;
  className?: string;
  pageContentClassName?: string;
}

export const GlobalAppShell: React.FC<GlobalAppShellProps> = ({
  children,
  subtitle = 'Rural Care-Gap Intelligence',
  hasBottomNav = true,
  className = '',
  pageContentClassName = '',
}) => {
  const shell = useShell();

  return (
    <div className={`min-h-screen bg-surface flex flex-col w-full ${className}`}>
      <AppHeader subtitle={subtitle} />

      <PageContainer hasBottomNav={hasBottomNav} contentClassName={pageContentClassName}>
        {children}
      </PageContainer>

      {hasBottomNav && <BottomNavigation />}

      <Toast toast={shell.toast} onClose={shell.hideToast} />
    </div>
  );
};
