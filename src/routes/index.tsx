import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { ShellProvider, useShell } from '../context/ShellContext';
import { BrandBlock, GlobalAppShell } from '../components/layout';
import {
  Card,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
  ResolutionButton,
  DestructiveButton,
  StatusBadge,
  CareGapBadge,
  ReferralStatusBadge,
  VerifiedBadge,
  OfflineStatus,
  PatientIdentity,
  Toast,
} from '../components/common';
import type { UserRole } from '../context/ShellContext';
import FrontlineDashboardPage from './FrontlineDashboardPage';
import CareGapCenterPage from './CareGapCenterPage';
import PatientProfilePage from './PatientProfilePage';
import ScreeningPage from './ScreeningPage';
import FacilityDirectoryPage from './FacilityDirectoryPage';
import SmartReferralPage from './SmartReferralPage';
import FacilityDashboardPage from './FacilityDashboardPage';
import FacilityReferralDetailPage from './FacilityReferralDetailPage';
import { ROUTE_PATHS } from './paths';

/**
 * Shared context spans login and authenticated-shell placeholder routes.
 */
const RootLayout: React.FC = () => {
  return <ShellProvider><Outlet /></ShellProvider>;
};

/**
 * Loop 1 Design System & Shell Verification Entry Point
 * Demonstrates shell controls, design system tokens, and UI components
 * WITHOUT implementing any of the 5 feature screens or business logic.
 */
const DesignSystemVerificationPage: React.FC = () => {
  const shell = useShell();
  const navigate = useNavigate();

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
              navigate(
                shell.role === 'FRONTLINE_ASHA'
                  ? ROUTE_PATHS.frontlineDashboard
                  : ROUTE_PATHS.facilityDashboard
              )
            }
            className="min-h-[48px] px-space-sm font-code-xs text-code-xs text-primary font-bold hover:underline cursor-pointer"
          >
            Open role dashboard
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

interface RoutePlaceholderProps {
  title: string;
  dashboardPath: string;
  parameterLabel?: 'Patient ID' | 'Referral ID';
  parameterValue?: string;
}

const RoutePlaceholder: React.FC<RoutePlaceholderProps> = ({
  title,
  dashboardPath,
  parameterLabel,
  parameterValue,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col gap-space-sm px-margin py-space-sm">
      <OfflineStatus />
      <Card variant="default" padding="md">
        <SectionHeader title={title} tag="PLACEHOLDER" />
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
          {title}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
          Prototype destination only. This feature is not implemented.
        </p>
        <div className="mt-space-sm rounded-lg bg-surface-container-low p-space-sm">
          <span className="block font-code-xs text-code-xs text-on-surface-variant">
            CURRENT DESTINATION
          </span>
          <span className="block break-all font-code-sm text-code-sm text-primary">
            {location.pathname}
          </span>
        </div>
        {parameterLabel && parameterValue && (
          <div className="mt-space-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {parameterLabel}
            </span>
            <span className="ml-space-sm font-code-sm text-code-sm text-on-surface">
              {parameterValue}
            </span>
          </div>
        )}
        <SecondaryButton
          icon="arrow_back"
          className="mt-space-md"
          onClick={() => navigate(dashboardPath)}
        >
          Back to dashboard
        </SecondaryButton>
      </Card>
    </div>
  );
};

const FrontlineClosurePage: React.FC = () => {
  const { patientId } = useParams<'patientId'>();
  return (
    <RoutePlaceholder
      title="Care Closure"
      dashboardPath={ROUTE_PATHS.frontlineDashboard}
      parameterLabel="Patient ID"
      parameterValue={patientId}
    />
  );
};

const FacilityClosurePage: React.FC = () => {
  const { patientId } = useParams<'patientId'>();
  return (
    <RoutePlaceholder
      title="Facility Closure"
      dashboardPath={ROUTE_PATHS.facilityDashboard}
      parameterLabel="Patient ID"
      parameterValue={patientId}
    />
  );
};

const LoginPage: React.FC = () => {
  const shell = useShell();
  const navigate = useNavigate();

  const selectRole = (role: UserRole) => {
    shell.setRole(role);
    navigate(
      role === 'FRONTLINE_ASHA'
        ? ROUTE_PATHS.frontlineDashboard
        : ROUTE_PATHS.facilityDashboard
    );
  };

  return (
    <main className="min-h-screen bg-surface px-margin py-space-lg pt-safe pb-safe flex items-center">
      <div className="mx-auto flex w-full max-w-md flex-col gap-space-md">
        <BrandBlock />
        <OfflineStatus />
        <Card variant="default" padding="lg">
          <SectionHeader title="Prototype Role Selection" tag="NO SIGN-IN" />
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            Choose your role
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs mb-space-md">
            Select a prototype view. Authentication is not implemented.
          </p>
          <div className="flex flex-col gap-space-sm">
            <PrimaryButton icon="groups" onClick={() => selectRole('FRONTLINE_ASHA')}>
              Frontline Worker
            </PrimaryButton>
            <SecondaryButton
              icon="medical_services"
              onClick={() => selectRole('FACILITY_CLINICIAN')}
            >
              Facility / Clinician
            </SecondaryButton>
          </div>
        </Card>
      </div>
      <Toast toast={shell.toast} onClose={shell.hideToast} />
    </main>
  );
};

const NotFoundPage: React.FC = () => (
  <RoutePlaceholder
    title="Page Not Found"
    dashboardPath={ROUTE_PATHS.frontlineDashboard}
  />
);

const activeTabForPath = (pathname: string): string => {
  if (pathname.includes('/screening/')) return 'screening';
  if (pathname.includes('/care-gaps')) return 'care-gaps';
  if (pathname.includes('/referral/') || pathname.includes('/closure/')) return 'referrals';
  if (pathname.includes('/district/')) return 'district';
  return 'dashboard';
};

const ApplicationShellLayout: React.FC = () => {
  const { pathname } = useLocation();
  const { setActiveTab, setRole } = useShell();

  useEffect(() => {
    if (pathname.startsWith('/frontline/')) setRole('FRONTLINE_ASHA');
    if (pathname.startsWith('/facility/')) setRole('FACILITY_CLINICIAN');
    setActiveTab(activeTabForPath(pathname));
  }, [pathname, setActiveTab, setRole]);

  return (
    <GlobalAppShell pageContentClassName={pathname.startsWith('/frontline/referral/') ? 'max-w-7xl' : ''}>
      <Outlet />
    </GlobalAppShell>
  );
};

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTE_PATHS.login} replace /> },
      { path: ROUTE_PATHS.login, element: <LoginPage /> },
      {
        element: <ApplicationShellLayout />,
        children: [
          { path: ROUTE_PATHS.designSystem, element: <DesignSystemVerificationPage /> },
          { path: ROUTE_PATHS.frontlineDashboard, element: <FrontlineDashboardPage /> },
          { path: '/frontline/patient/:patientId', element: <PatientProfilePage /> },
          { path: '/frontline/screening/:patientId', element: <ScreeningPage /> },
          { path: ROUTE_PATHS.frontlineCareGaps, element: <CareGapCenterPage /> },
          { path: ROUTE_PATHS.frontlineFacilities, element: <FacilityDirectoryPage /> },
          { path: '/frontline/referral/:referralId', element: <SmartReferralPage /> },
          { path: '/frontline/closure/:patientId', element: <FrontlineClosurePage /> },
          { path: ROUTE_PATHS.facilityDashboard, element: <FacilityDashboardPage /> },
          { path: '/facility/referral/:referralId', element: <FacilityReferralDetailPage /> },
          { path: '/facility/closure/:patientId', element: <FacilityClosurePage /> },
          { path: ROUTE_PATHS.districtIntelligence, element: <RoutePlaceholder title="District Intelligence" dashboardPath={ROUTE_PATHS.frontlineDashboard} /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
