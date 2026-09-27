import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { ReferralLifecycleSnapshot, ReferralLifecycleState } from '../types';
import { SYNTHETIC_REFERRALS } from '../data/synthetic/referrals';
import { createInitialReferralSnapshot, transitionReferralLifecycle, type ReferralTransitionResult } from '../rules/referralLifecycle';

export type UserRole = 'FRONTLINE_ASHA' | 'FACILITY_CLINICIAN';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type?: 'success' | 'alert' | 'info';
}

export interface ShellContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  toggleOnline: () => void;
  toast: ToastMessage | null;
  showToast: (title: string, description: string, type?: 'success' | 'alert' | 'info') => void;
  hideToast: () => void;
  referralLifecycle: Record<string, ReferralLifecycleSnapshot>;
  transitionReferralState: (referralId: string, nextState: ReferralLifecycleState) => ReferralTransitionResult | undefined;
}

const ShellContext = createContext<ShellContextType | undefined>(undefined);

export const ShellProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('FRONTLINE_ASHA');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [referralLifecycle, setReferralLifecycle] = useState<Record<string, ReferralLifecycleSnapshot>>(() =>
    Object.fromEntries(SYNTHETIC_REFERRALS.map((referral) => [referral.id, createInitialReferralSnapshot(referral)]))
  );

  const toggleOnline = () => setIsOnline((prev) => !prev);

  const showToast = (title: string, description: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setToast({
      id: Date.now().toString(),
      title,
      description,
      type,
    });
  };

  const hideToast = () => setToast(null);
  const transitionReferralState = (referralId: string, nextState: ReferralLifecycleState) => {
    const referral = SYNTHETIC_REFERRALS.find((item) => item.id === referralId);
    if (!referral) return undefined;
    const current = referralLifecycle[referralId] ?? createInitialReferralSnapshot(referral);
    const result = transitionReferralLifecycle(current, nextState);
    if (result.ok) {
      setReferralLifecycle((previous) => ({ ...previous, [referralId]: result.snapshot }));
    }
    return result;
  };

  return (
    <ShellContext.Provider
      value={{
        role,
        setRole,
        activeTab,
        setActiveTab,
        isOnline,
        toggleOnline,
        toast,
        showToast,
        hideToast,
        referralLifecycle,
        transitionReferralState,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
};

export const useShell = (): ShellContextType => {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
};
