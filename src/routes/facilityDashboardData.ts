import type { HealthcareFacility, ReferralRecord } from '../types';
import { getFacilityById } from '../data/synthetic/facilities';
import { SYNTHETIC_REFERRALS } from '../data/synthetic/referrals';

/** The receiving facility is resolved from referral destinations, never copied into page data. */
export const resolveFacilityContext = (
  referrals: ReferralRecord[] = SYNTHETIC_REFERRALS
): HealthcareFacility | undefined => {
  const destinationId = referrals.find((referral) => referral.destinationFacilityId)?.destinationFacilityId;
  return destinationId ? getFacilityById(destinationId) : undefined;
};

export type FacilityReferralFilter = 'ALL' | 'PENDING' | 'REACHED' | 'ACTION';

export const matchesFacilityReferralFilter = (
  state: 'REFERRED' | 'REACH_PENDING' | 'REACHED' | 'TIMEOUT',
  filter: FacilityReferralFilter
): boolean => {
  if (filter === 'ALL') return true;
  if (filter === 'PENDING') return state === 'REFERRED' || state === 'REACH_PENDING';
  if (filter === 'REACHED') return state === 'REACHED';
  return state === 'TIMEOUT';
};
