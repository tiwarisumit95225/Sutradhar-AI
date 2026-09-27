/**
 * Smart Referral & Digital Handshake Protocol Types
 * PROTOTYPE / SYNTHETIC DATA ONLY
 */

export type JourneyMilestone = 'SCREENED' | 'REFERRED' | 'REACH_PENDING' | 'RECEIVED' | 'CLOSED';
export type ReferralLifecycleState = 'REFERRED' | 'REACH_PENDING' | 'REACHED' | 'TIMEOUT';

export interface ReferralLifecycleEvent {
  id: string;
  state: ReferralLifecycleState;
  detail: string;
  source: 'SYNTHETIC_RECORD' | 'SIMULATION' | 'HANDSHAKE_SIMULATION';
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
  generatedAt: string;
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
}
