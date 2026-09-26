import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ShellProvider, useShell } from '../context/ShellContext';
import { GlobalAppShell } from '../components/layout';
import {
  Card,
  SectionHeader,
  PrimaryButton,
  SecondaryButton,
  ResolutionButton,
  DestructiveButton,
  StatusBadge,
  CareGapBadge,
  ReferralStatusBadge,
  VerifiedBadge,
  OfflineStatus,
  PatientIdentity,
} from '../components/common';

/**
 * Foundational Root Layout Shell
 * Wraps routes in ShellProvider context and GlobalAppShell.
 */
const RootLayout: React.FC = () => {
  return (
    <ShellProvider>
      <GlobalAppShell>
        <Outlet />
      </GlobalAppShell>
    </ShellProvider>
  );
};

/**
 * Loop 1 Design System & Shell Verification Entry Point
 * Demonstrates shell controls, design system tokens, and UI components
 * WITHOUT implementing any of the 5 feature screens or business logic.
 */
const DesignSystemVerificationPage: React.FC = () => {
  const shell = useShell();

  const handleTestToast = () => {
    shell.showToast(
      'Sample feedback',
      'Simulated component state from the Loop 1 placeholder.',
      'success'
    );
  };

  return (
    <div className="flex flex-col gap-space-sm px-margin py-space-sm w-full">
      {/* Offline Status Sub-Banner */}
      <OfflineStatus />

      {/* Persona / Role Active State Card */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between">
          <span className="font-code-xs text-code-xs text-secondary tracking-wider uppercase font-semibold">
            Active Persona Context
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container text-primary font-code-xs text-code-xs font-bold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {shell.role === 'FRONTLINE_ASHA'
              ? 'FRONTLINE (ASHA)'
              : 'FACILITY (CLINICIAN)'}
          </span>
        </div>

        <div className="mt-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            {shell.role === 'FRONTLINE_ASHA' ? 'Frontline role' : 'Facility role'}
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Shared application shell preview. No feature workflow is implemented.
          </p>
        </div>

        <div className="mt-space-sm pt-space-xs border-t border-outline-variant/20 flex items-center justify-between">
          <span className="font-code-xs text-code-xs text-on-surface-variant">
            Active Bottom Tab: <strong className="text-primary font-bold uppercase">{shell.activeTab}</strong>
          </span>
          <button
            type="button"
            onClick={() =>
              shell.setRole(
                shell.role === 'FRONTLINE_ASHA'
                  ? 'FACILITY_CLINICIAN'
                  : 'FRONTLINE_ASHA'
              )
            }
            className="min-h-[48px] px-space-sm font-code-xs text-code-xs text-primary font-bold hover:underline cursor-pointer"
          >
            Toggle Role
          </button>
        </div>
      </Card>

      {/* Patient Identity Showcase */}
      <Card variant="alert" padding="md">
        <SectionHeader title="Synthetic Identity Component" tag="DEMO" />
        <PatientIdentity
          fullName="Demo Beneficiary"
          initials="DB"
          syntheticId="DEMO-00125"
        />
      </Card>

      {/* Status Badges Showcase */}
      <Card variant="default" padding="md">
        <SectionHeader title="Status & Priority Chips" tag="DETERMINISTIC" />
        <div className="flex flex-wrap items-center gap-space-xs">
          <CareGapBadge label="2 CRITICAL" isExpired />
          <CareGapBadge label="ACTION REQ" />
          <ReferralStatusBadge status="IN_TRANSIT" />
          <ReferralStatusBadge status="AWAITING_ARRIVAL" />
          <ReferralStatusBadge status="ARRIVED" />
          <VerifiedBadge label="EVIDENCED" subtext="Closure" />
          <StatusBadge label="Local Cache Synced" variant="success" pulse />
          <StatusBadge label="Offline Queue" variant="warning" />
        </div>
      </Card>

      {/* Interactive Controls & Buttons Showcase */}
      <Card variant="default" padding="md">
        <SectionHeader
          title="Interactive Buttons"
          tag="≥ 48px TOUCH FOOTPRINT"
        />
        <div className="flex flex-col gap-space-xs mt-space-xs">
          <PrimaryButton
            icon="notifications"
            onClick={handleTestToast}
          >
            Trigger Verification Feedback Toast
          </PrimaryButton>

          <SecondaryButton
            icon="sync"
            onClick={shell.toggleOnline}
          >
            Simulate Connection: Currently {shell.isOnline ? 'ONLINE' : 'OFFLINE'}
          </SecondaryButton>

          <div className="grid grid-cols-2 gap-space-xs mt-0.5">
            <ResolutionButton
              icon="task_alt"
              onClick={() =>
                shell.showToast(
                    'Success state sample',
                    'Simulated component feedback only.',
                  'success'
                )
              }
            >
              Success state
            </ResolutionButton>

            <DestructiveButton
              icon="emergency"
              onClick={() =>
                shell.showToast(
                    'Alert state sample',
                    'Simulated component feedback only.',
                  'alert'
                )
              }
            >
              Alert state
            </DestructiveButton>
          </div>
        </div>
      </Card>

      {/* Visual Source of Truth Notice */}
      <div className="px-space-xs py-space-sm text-center">
        <span className="font-code-xs text-code-xs text-secondary leading-tight block">
          Loop 1 Complete • Frozen Visual Truth: Stitch Project 17303241276460966652
          <br />
          No feature screens mounted • Foundation &amp; Design System Operational
        </span>
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
        element: <DesignSystemVerificationPage />,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
