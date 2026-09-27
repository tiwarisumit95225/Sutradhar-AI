import type { CareGap } from '../types';

export type CareGapReasonCode =
  | 'EXPECTED_STEP_MISSING'
  | 'REFERRAL_ARRIVAL_NOT_CONFIRMED'
  | 'REFERRAL_TIMEOUT_RISK';

export const isUnresolvedCareGap = (gap: CareGap): boolean => gap.status !== 'CLOSED';

export const hasExplicitExpiryEvidence = (gap: CareGap): boolean =>
  gap.status === 'EXPIRED' || gap.explanation.evidenceTrail.some((event) => event.statusType === 'EXPIRY');

