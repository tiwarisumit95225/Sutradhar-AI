/**
 * Care Gap & Operational Reasoning Types
 * PROTOTYPE / SYNTHETIC DATA ONLY
 */

export type CareGapStatus = 'DETECTED' | 'PREDICTED' | 'DISPATCHED' | 'EXPIRED' | 'CLOSED';

export interface ScreeningObservation {
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  hemoglobinGdl: number;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  facilityOrLocation: string;
  statusType: 'SCREENING' | 'DISPATCH' | 'EXPIRY' | 'ALERT' | 'CLOSURE';
  isHighlighted?: boolean;
  screeningObservation?: ScreeningObservation;
}

export interface OperationalExplanation {
  detectedSignal: string;
  operationalContext: string;
  rootCauseFactors: string[];
  evidenceTrail: TimelineEvent[];
}

export interface CareGap {
  id: string; // e.g. "GAP-2026-081"
  beneficiaryId: string;
  /** Links this expected care-step gap to the referral whose evidence can resolve it. */
  expectedReferralId?: string;
  title: string;
  subType: string;
  status: CareGapStatus;
  breachWindowHours: number;
  explanation: OperationalExplanation;
  recommendedAction: string;
}
