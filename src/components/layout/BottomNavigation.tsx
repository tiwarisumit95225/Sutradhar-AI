import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useShell } from '../../context/ShellContext';
import { DEMO_PATIENT_ID, DEMO_REFERRAL_ID, ROUTE_PATHS } from '../../routes/paths';

export interface NavTabItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

export const DEFAULT_NAV_TABS: NavTabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' },
  { id: 'screening', label: 'Screening', icon: 'clinical_notes' },
  { id: 'referrals', label: 'Referrals', icon: 'local_hospital', badge: 4 },
  { id: 'care-gaps', label: 'Care Gaps', icon: 'crisis_alert', badge: 3 },
  { id: 'district', label: 'District Intel', icon: 'analytics' },
];

export interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  tabs?: NavTabItem[];
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  tabs = DEFAULT_NAV_TABS,
  className = '',
}) => {
  const shell = useShell();
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId, referralId } = useParams<'patientId' | 'referralId'>();
  const currentRole = location.pathname.startsWith('/facility/')
    ? 'FACILITY_CLINICIAN'
    : shell.role;
  const inferredTab = location.pathname.includes('/screening/')
    ? 'screening'
    : location.pathname.includes('/care-gaps')
      ? 'care-gaps'
      : location.pathname.includes('/referral/') || location.pathname.includes('/closure/')
        ? 'referrals'
        : location.pathname.includes('/district/')
          ? 'district'
          : shell.activeTab;
  const currentTab = activeTab ?? inferredTab;

  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
      return;
    }

    shell.setActiveTab(tabId);
    const isFacility = currentRole === 'FACILITY_CLINICIAN';
    const destinationByTab: Record<string, string> = {
      dashboard: isFacility
        ? ROUTE_PATHS.facilityDashboard
        : ROUTE_PATHS.frontlineDashboard,
      screening: ROUTE_PATHS.frontlineScreening(patientId ?? DEMO_PATIENT_ID),
      referrals: isFacility
        ? ROUTE_PATHS.facilityReferral(referralId ?? DEMO_REFERRAL_ID)
        : ROUTE_PATHS.frontlineReferral(referralId ?? DEMO_REFERRAL_ID),
      'care-gaps': ROUTE_PATHS.frontlineCareGaps,
      district: ROUTE_PATHS.districtIntelligence,
    };
    const destination = destinationByTab[tabId];
    if (destination) navigate(destination);
  };

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed inset-x-0 bottom-0 z-50 pb-safe bg-surface-container-lowest border-t border-outline-variant/30 shadow-[0_-2px_12px_rgba(0,0,0,0.03)] ${className}`}
    >
      <div className="h-16 px-space-sm flex items-center justify-around max-w-screen-xl mx-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
              className={`flex flex-1 min-w-0 min-h-[48px] flex-col items-center justify-center gap-0.5 py-1 cursor-pointer transition-colors relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary ${
                isActive
                  ? 'text-primary'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              {isActive ? (
                <div className="w-10 h-7 rounded-full bg-primary-container/15 flex items-center justify-center">
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                    {tab.icon}
                  </span>
                </div>
              ) : (
                <div className="w-10 h-7 flex items-center justify-center relative">
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                    {tab.icon}
                  </span>
                  {tab.badge && tab.badge > 0 ? (
                    <span aria-hidden="true" className="absolute top-0 right-1 w-2 h-2 rounded-full bg-error" />
                  ) : null}
                </div>
              )}
              <span
                className={`font-label-sm text-[10px] whitespace-nowrap ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
