import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

/**
 * Foundational Layout Shell
 * Establishes routing dependency & base container without implementing feature UI screens yet.
 */
const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface flex flex-col">
      <Outlet />
    </div>
  );
};

/**
 * Foundation Status Placeholder
 * Confirms foundation setup, theme configuration, and ready state for subsequent development loops.
 */
const FoundationEntryPoint: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-margin py-space-xl text-center bg-surface">
      <div className="max-w-md w-full bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col items-center gap-space-md">
        <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-[32px]">health_and_safety</span>
        </div>

        <div className="flex flex-col gap-1 items-center">
          <div className="flex items-center gap-space-xs">
            <h1 className="font-headline-md text-headline-md text-primary font-bold">Sutradhar AI</h1>
            <span className="font-code-xs text-code-xs bg-primary-container text-on-primary font-semibold px-space-xs py-0.5 rounded">
              SIH26133
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Rural Care-Gap Intelligence
          </span>
        </div>

        <div className="w-full bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1 text-left">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">Project Foundation</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-lowest text-tertiary font-code-xs text-code-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              INITIALIZED
            </span>
          </div>
          <p className="font-code-xs text-code-xs text-on-surface-variant">
            Vite + React 18 + TypeScript + Tailwind CSS
          </p>
        </div>

        <div className="w-full text-left flex flex-col gap-1.5 text-on-surface-variant font-code-xs text-code-xs border-t border-outline-variant/20 pt-space-sm">
          <p className="font-bold text-on-surface uppercase tracking-wider">Visual Truth Target:</p>
          <p>• Stitch Project: <span className="font-mono text-primary font-semibold">17303241276460966652</span></p>
          <p>• Design Theme: <span className="font-semibold text-on-surface">Rural Care Orchestration</span></p>
          <p>• Target Viewport: <span className="font-semibold text-on-surface">Mobile (390px / 780px canvas)</span></p>
          <p>• Scope: <span className="text-secondary font-medium">Foundation Only (Screens & Features Unmounted)</span></p>
        </div>
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <FoundationEntryPoint />,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
