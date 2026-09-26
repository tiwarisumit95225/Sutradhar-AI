import React, { ReactNode } from 'react';

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
  hasBottomNav?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  hasBottomNav = true,
}) => {
  return (
    <main
      className={`flex flex-col relative w-full pt-[calc(112px+env(safe-area-inset-top,0px))] sm:pt-[calc(80px+env(safe-area-inset-top,0px))] ${
        hasBottomNav ? 'pb-24' : 'pb-8'
      } bg-surface min-h-screen overflow-x-hidden ${className}`}
    >
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl mx-auto flex flex-col flex-1">
        {children}
      </div>
    </main>
  );
};
