import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { FollowUpStatus, ReferralLifecycleSnapshot, ReferralLifecycleState, ReferralRecord, SyntheticFollowUp, SyntheticFollowUpEvent } from '../types';
import { SYNTHETIC_REFERRALS } from '../data/synthetic/referrals';
import { createInitialReferralSnapshot, transitionReferralLifecycle, verifyHandshakeCredentials, type HandshakeVerificationResult, type ReferralTransitionResult } from '../rules/referralLifecycle';

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
  referrals: ReferralRecord[];
  followUps: Record<string, SyntheticFollowUp>;
  startFollowUp: (referralId: string, careGapId?: string) => boolean;
  completeFollowUp: (referralId: string) => boolean;
  createReReferral: (referralId: string, facilityId: string) => ReferralRecord | undefined;
  transitionReferralState: (referralId: string, nextState: ReferralLifecycleState) => ReferralTransitionResult | undefined;
  verifyReferralHandshake: (referralId: string, token: string, passcode: string) => HandshakeVerificationResult | undefined;
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
  const [referrals, setReferrals] = useState<ReferralRecord[]>(SYNTHETIC_REFERRALS);
  const [followUps, setFollowUps] = useState<Record<string, SyntheticFollowUp>>({});

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
    const referral = referrals.find((item) => item.id === referralId);
    if (!referral) return undefined;
    const current = referralLifecycle[referralId] ?? createInitialReferralSnapshot(referral);
    const result = transitionReferralLifecycle(
      current,
      nextState,
      nextState === 'CARE_RECEIVED' || nextState === 'CLOSED' ? 'FACILITY_SIMULATION' : 'SIMULATION',
      nextState === 'CARE_RECEIVED' || nextState === 'CLOSED'
        ? { referralId: referral.id, patientId: referral.beneficiaryId, expectedStep: referral.clinicalIndication }
        : undefined
    );
    if (result.ok) {
      setReferralLifecycle((previous) => ({ ...previous, [referralId]: result.snapshot }));
    }
    return result;
  };
  const verifyReferralHandshake = (referralId: string, token: string, passcode: string) => {
    const referral = referrals.find((item) => item.id === referralId);
    if (!referral) return undefined;
    const current = referralLifecycle[referralId] ?? createInitialReferralSnapshot(referral);
    const result = verifyHandshakeCredentials(referral, current, token, passcode);
    if (result.ok && result.snapshot !== current) {
      setReferralLifecycle((previous) => ({ ...previous, [referralId]: result.snapshot }));
    }
    return result;
  };

  const addFollowUpEvent = (record: SyntheticFollowUp, status: FollowUpStatus, event: SyntheticFollowUpEvent['event'], detail: string): SyntheticFollowUp => {
    const nextEvent: SyntheticFollowUpEvent = {
      id: `${record.referralId}-${event.toLowerCase().replace(/_/g, '-')}-${record.events.length + 1}`,
      referralId: record.referralId,
      patientId: record.patientId,
      ...(record.careGapId ? { careGapId: record.careGapId } : {}),
      action: record.action,
      assignedWorker: record.assignedWorker,
      status,
      event,
      synthetic: true,
      detail,
    };
    return { ...record, status, events: [...record.events, nextEvent] };
  };

  const startFollowUp = (referralId: string, careGapId?: string): boolean => {
    const referral = referrals.find((item) => item.id === referralId);
    const lifecycle = referral && (referralLifecycle[referralId] ?? createInitialReferralSnapshot(referral));
    if (!referral || lifecycle?.state !== 'TIMEOUT' || followUps[referralId]) return false;
    const required: SyntheticFollowUp = {
      referralId,
      patientId: referral.beneficiaryId,
      ...(careGapId ? { careGapId } : referral.sourceCareGapId ? { careGapId: referral.sourceCareGapId } : {}),
      action: 'REVIEW_AND_REENGAGE',
      assignedWorker: 'Meena Bai',
      status: 'REQUIRED',
      synthetic: true,
      events: [],
    };
    setFollowUps((previous) => ({ ...previous, [referralId]: addFollowUpEvent(required, 'IN_PROGRESS', 'FOLLOW_UP_STARTED', 'Follow-up started — simulated. Review the referral and re-engage the patient to confirm a next care option.') }));
    return true;
  };

  const completeFollowUp = (referralId: string): boolean => {
    const record = followUps[referralId];
    if (!record || record.status !== 'IN_PROGRESS') return false;
    setFollowUps((previous) => ({ ...previous, [referralId]: addFollowUpEvent(record, 'COMPLETED', 'FOLLOW_UP_COMPLETED', 'Follow-up completed — simulated. No patient contact is asserted.') }));
    return true;
  };

  const createReReferral = (referralId: string, facilityId: string): ReferralRecord | undefined => {
    const source = referrals.find((item) => item.id === referralId);
    const followUp = followUps[referralId];
    const sourceLifecycle = source && (referralLifecycle[referralId] ?? createInitialReferralSnapshot(source));
    if (!source || sourceLifecycle?.state !== 'TIMEOUT' || followUp?.status !== 'COMPLETED' || !facilityId) return undefined;
    if (followUp.reReferralId) return referrals.find((item) => item.id === followUp.reReferralId);
    let attempt = 1;
    while (referrals.some((item) => item.id === `${source.id}-R${attempt}`)) attempt += 1;
    const id = `${source.id}-R${attempt}`;
    const newReferral: ReferralRecord = {
      ...source,
      id,
      destinationFacilityId: facilityId,
      sourceReferralId: source.id,
      ...(followUp.careGapId ? { sourceCareGapId: followUp.careGapId } : {}),
      lifecycleState: 'REACH_PENDING',
      currentTransitStatus: 'Awaiting arrival · re-referral simulation',
      handshake: {
        ...source.handshake,
        referralId: id,
        tokenCode: `${source.handshake.tokenCode}-R${attempt}`,
        destinationFacilityId: facilityId,
        generatedAt: undefined,
        arrivalAcknowledged: false,
        acknowledgedAt: undefined,
      },
      milestones: source.milestones.map((milestone) => milestone.milestone === 'REFERRED'
        ? { ...milestone, completed: true, active: false }
        : milestone.milestone === 'REACH_PENDING'
          ? { ...milestone, completed: false, active: true }
          : { ...milestone, completed: false, active: false, timestamp: undefined }),
    };
    const linkedFollowUp = addFollowUpEvent({ ...followUp, reReferralId: id }, 'COMPLETED', 'RE_REFERRAL_CREATED', `New synthetic referral ${id} created in REACH_PENDING; original ${source.id} remains timed out.`);
    setReferrals((previous) => [...previous, newReferral]);
    setReferralLifecycle((previous) => ({ ...previous, [id]: createInitialReferralSnapshot(newReferral) }));
    setFollowUps((previous) => ({ ...previous, [referralId]: linkedFollowUp }));
    return newReferral;
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
        referrals,
        followUps,
        startFollowUp,
        completeFollowUp,
        createReReferral,
        transitionReferralState,
        verifyReferralHandshake,
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
