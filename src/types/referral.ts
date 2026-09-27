/**
 * Smart Referral & Digital Handshake Protocol Types
 * PROTOTYPE / SYNTHETIC DATA ONLY
 */

export type JourneyMilestone = 'SCREENED' | 'REFERRED' | 'REACH_PENDING' | 'RECEIVED' | 'CARE_RECEIVED' | 'CLOSED';
export type ReferralLifecycleState = 'REFERRED' | 'REACH_PENDING' | 'REACHED' | 'CARE_RECEIVED' | 'CLOSED' | 'TIMEOUT';

export interface CareJourneyEvidence {
  referralId: string;
  patientId: string;
  expectedStep: string;
  event: 'CARE_RECEIVED' | 'CLOSURE_CONFIRMED';
  evidenceType: 'SYNTHETIC_FACILITY_RECORD';
  evidenceSource: 'FACILITY_SIMULATION';
  status: 'RECORDED' | 'CONFIRMED';
  synthetic: true;
}

export interface ReferralLifecycleEvent {
  id: string;
  state: ReferralLifecycleState;
  detail: string;
  source: 'SYNTHETIC_RECORD' | 'SIMULATION' | 'HANDSHAKE_SIMULATION' | 'FACILITY_SIMULATION';
  evidence?: CareJourneyEvidence;
  /** Only populated when the existing synthetic record provides a timestamp. */
  timestamp?: string;
}

export interface ReferralLifecycleSnapshot {
  state: ReferralLifecycleState;
  history: ReferralLifecycleEvent[];
}

export interface MilestoneProgress {
  milestone: JourneyMilestone;
  label: string;
  completed: boolean;
  active: boolean;
  timestamp?: string;
}

export interface HandshakeToken {
  tokenCode: string; // e.g. "SH-28491"
  referralId: string; // e.g. "REF-2026-00125"
  patientAbhaId: string;
  issuingAshaId: string;
  destinationFacilityId: string;
  targetDesk: string; // e.g. "OPD Desk 2 (Dr. M. Verma)"
  /** Omitted for re-referrals created without a simulated issuance timestamp. */
  generatedAt?: string;
  smsDispatchStatus: 'SENT' | 'DELIVERED' | 'PENDING';
  arrivalAcknowledged: boolean; // REACH = TRUE
  acknowledgedAt?: string;
}

export interface ReferralRecord {
  id: string; // e.g. "REF-2026-00125"
  beneficiaryId: string;
  destinationFacilityId: string;
  handshake: HandshakeToken;
  milestones: MilestoneProgress[];
  clinicalIndication: string;
  currentTransitStatus: string;
  etaMinutes: number;
  remainingKm: number;
  /** Optional during migration; derived from existing milestone/handshake fields when absent. */
  lifecycleState?: ReferralLifecycleState;
  /** Links a synthetic retry to its historical failed referral without replacing it. */
  sourceReferralId?: string;
  sourceCareGapId?: string;
}

export type FollowUpStatus = 'REQUIRED' | 'IN_PROGRESS' | 'COMPLETED';
export type FollowUpAction = 'REVIEW_AND_REENGAGE';
export type FollowUpEventType = 'FOLLOW_UP_STARTED' | 'FOLLOW_UP_COMPLETED' | 'RE_REFERRAL_CREATED';

export interface SyntheticFollowUpEvent {
  id: string;
  referralId: string;
  patientId: string;
  careGapId?: string;
  action: FollowUpAction;
  assignedWorker: string;
  status: FollowUpStatus;
  event: FollowUpEventType;
  synthetic: true;
  detail: string;
}

export interface SyntheticFollowUp {
  referralId: string;
  patientId: string;
  careGapId?: string;
  action: FollowUpAction;
  assignedWorker: string;
  status: FollowUpStatus;
  synthetic: true;
  events: SyntheticFollowUpEvent[];
  reReferralId?: string;
}
