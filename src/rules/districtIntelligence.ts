import type { CareGapEngineResult } from './careGapEngine';
import { createInitialReferralSnapshot } from './referralLifecycle';
import type { HealthcareFacility, ReferralLifecycleSnapshot, ReferralRecord, SyntheticFollowUp } from '../types';

export type DistrictJourneyStage = 'SCREEN' | 'REFER' | 'REACH' | 'RECEIVE' | 'CLOSURE';

export interface DistrictIntelligenceInput {
  results: CareGapEngineResult[];
  referrals: ReferralRecord[];
  referralLifecycle: Record<string, ReferralLifecycleSnapshot>;
  followUps: Record<string, SyntheticFollowUp>;
  facilities: HealthcareFacility[];
}

export interface DistrictIntelligenceSummary {
  activeCareGaps: number;
  reachGaps: number;
  followUpRequired: number;
  followUpInProgress: number;
  reReferralEvents: number;
  currentReferrals: number;
  closurePending: number;
}

export interface DistrictCase {
  beneficiaryId: string;
  fullName: string;
  village: string;
  section: string;
  gapResults: CareGapEngineResult[];
  currentReferral?: ReferralRecord;
  currentState?: string;
  followUp?: SyntheticFollowUp;
  facilityName?: string;
}

const REASON_INTERPRETATIONS: Record<string, string> = {
  REFERRAL_ARRIVAL_NOT_CONFIRMED: 'Referral arrival has not been confirmed in the linked synthetic records.',
  REFERRAL_TIMEOUT_RISK: 'A referral remains in its represented transit state without arrival acknowledgement.',
  EXPECTED_STEP_MISSING: 'The engine found an unresolved expected care step in the source synthetic record.',
};

const stageForResult = (result: CareGapEngineResult, state?: string): DistrictJourneyStage | undefined => {
  if (state === 'REACH_PENDING' || state === 'TIMEOUT') return 'REACH';
  if (state === 'REFERRED') return 'REFER';
  if (state === 'REACHED') return 'RECEIVE';
  const expected = `${result.expectedStep} ${result.careGap?.title ?? ''} ${result.careGap?.subType ?? ''}`.toLocaleLowerCase();
  if (/screen/.test(expected)) return 'SCREEN';
  if (/refer|dispatch/.test(expected)) return 'REFER';
  if (/reach|arrival|handshake/.test(expected) || result.reasonCode === 'REFERRAL_ARRIVAL_NOT_CONFIRMED' || result.reasonCode === 'REFERRAL_TIMEOUT_RISK') return 'REACH';
  if (/receive|care received|expected care/.test(expected)) return 'RECEIVE';
  if (/clos/.test(expected)) return 'CLOSURE';
  return undefined;
};

export const getDistrictReasonInterpretation = (reasonCode: string): string =>
  REASON_INTERPRETATIONS[reasonCode] ?? 'Operational reason supplied by the Care-Gap Engine.';

export const aggregateDistrictIntelligence = ({ results, referrals, referralLifecycle, followUps, facilities }: DistrictIntelligenceInput) => {
  const latestByBeneficiary = new Map<string, ReferralRecord>();
  referrals.forEach((referral) => latestByBeneficiary.set(referral.beneficiaryId, referral));
  const currentReferral = (beneficiaryId: string) => latestByBeneficiary.get(beneficiaryId);
  const stateOf = (referral: ReferralRecord) =>
    (referralLifecycle[referral.id] ?? createInitialReferralSnapshot(referral)).state;
  const currentReferrals = [...latestByBeneficiary.values()].filter((referral) =>
    stateOf(referral) !== 'TIMEOUT' && stateOf(referral) !== 'CLOSED'
  );
  const latestTimeouts = [...latestByBeneficiary.values()].filter((referral) => stateOf(referral) === 'TIMEOUT');
  const followUpRequired = latestTimeouts.filter((referral) =>
    !followUps[referral.id] || followUps[referral.id].status === 'REQUIRED'
  ).length;
  const followUpInProgress = latestTimeouts.filter((referral) => followUps[referral.id]?.status === 'IN_PROGRESS').length;
  const reReferralEvents = Object.values(followUps).reduce((count, followUp) =>
    count + followUp.events.filter((event) => event.event === 'RE_REFERRAL_CREATED').length, 0);
  const closurePending = currentReferrals.filter((referral) => stateOf(referral) === 'CARE_RECEIVED').length;
  const reachGapResults = results.filter((result) => result.result === 'CARE_GAP'
    && (result.reasonCode === 'REFERRAL_ARRIVAL_NOT_CONFIRMED' || result.reasonCode === 'REFERRAL_TIMEOUT_RISK'));

  const summary: DistrictIntelligenceSummary = {
    activeCareGaps: results.filter((result) => result.result === 'CARE_GAP').length,
    reachGaps: new Set(reachGapResults.map((result) => result.beneficiary.id)).size,
    followUpRequired,
    followUpInProgress,
    reReferralEvents,
    currentReferrals: currentReferrals.length,
    closurePending,
  };

  const stageCounts = new Map<DistrictJourneyStage, Set<string>>([
    ['SCREEN', new Set()], ['REFER', new Set()], ['REACH', new Set()], ['RECEIVE', new Set()], ['CLOSURE', new Set()],
  ]);
  for (const result of results) {
    const referral = currentReferral(result.beneficiary.id);
    const state = referral ? stateOf(referral) : undefined;
    const stage = stageForResult(result, state);
    if (stage) stageCounts.get(stage)?.add(result.beneficiary.id);
  }
  const stages: { stage: DistrictJourneyStage; count: number; description: string }[] = [
    { stage: 'SCREEN', count: stageCounts.get('SCREEN')?.size ?? 0, description: 'Screening-related gaps explicitly represented by engine results.' },
    { stage: 'REFER', count: stageCounts.get('REFER')?.size ?? 0, description: 'Referral dispatch or referred-state gaps represented by engine results.' },
    { stage: 'REACH', count: stageCounts.get('REACH')?.size ?? 0, description: 'Arrival or handshake gaps represented by engine results.' },
    { stage: 'RECEIVE', count: stageCounts.get('RECEIVE')?.size ?? 0, description: 'Cases with arrival recorded while the expected care step remains unresolved.' },
    { stage: 'CLOSURE', count: stageCounts.get('CLOSURE')?.size ?? 0, description: 'Closure-related gaps explicitly represented by engine results.' },
  ];

  const scopedResults = results.filter((result) => {
    const current = currentReferral(result.beneficiary.id);
    return !result.referral || !current || result.referral.id === current.id;
  });
  const scopedReachCases = new Set(scopedResults.filter((result) =>
    result.reasonCode === 'REFERRAL_ARRIVAL_NOT_CONFIRMED' || result.reasonCode === 'REFERRAL_TIMEOUT_RISK'
  ).map((result) => result.beneficiary.id));
  const reasonCounts = new Map<string, Set<string>>();
  scopedResults.forEach((result) => {
    const cases = reasonCounts.get(result.reasonCode) ?? new Set<string>();
    cases.add(result.beneficiary.id);
    reasonCounts.set(result.reasonCode, cases);
  });
  const reasons = [...reasonCounts.entries()].map(([reasonCode, cases]) => ({
    reasonCode,
    count: cases.size,
    interpretation: getDistrictReasonInterpretation(reasonCode),
  })).sort((left, right) => left.reasonCode.localeCompare(right.reasonCode));

  const beneficiaryIds = new Set(results.map((result) => result.beneficiary.id));
  Object.values(followUps).forEach((followUp) => beneficiaryIds.add(followUp.patientId));
  const beneficiaries = new Map(results.map((result) => [result.beneficiary.id, result.beneficiary]));
  const cases: DistrictCase[] = [...beneficiaryIds].flatMap((beneficiaryId) => {
    const beneficiary = beneficiaries.get(beneficiaryId);
    if (!beneficiary) return [];
    const referral = currentReferral(beneficiaryId);
    const followUp = Object.values(followUps).find((item) => item.patientId === beneficiaryId);
    const facility = referral && facilities.find((item) => item.id === referral.destinationFacilityId);
    return [{
      beneficiaryId,
      fullName: beneficiary.fullName,
      village: beneficiary.village,
      section: beneficiary.section,
      gapResults: results.filter((result) => result.beneficiary.id === beneficiaryId && result.result === 'CARE_GAP'),
      ...(referral ? { currentReferral: referral, currentState: stateOf(referral) } : {}),
      ...(followUp ? { followUp } : {}),
      ...(facility ? { facilityName: facility.name } : {}),
    }];
  });

  const facilitiesOverview = facilities.map((facility) => {
    const facilityResults = results.filter((result) => result.result === 'CARE_GAP' && result.referral?.destinationFacilityId === facility.id);
    const activeFacilityReferrals = currentReferrals.filter((referral) => referral.destinationFacilityId === facility.id);
    const facilityFollowUps = Object.values(followUps).filter((followUp) => {
      const source = referrals.find((referral) => referral.id === followUp.referralId);
      return source?.destinationFacilityId === facility.id && (followUp.status === 'REQUIRED' || followUp.status === 'IN_PROGRESS');
    });
    return { facility, activeGaps: facilityResults.length, currentReferrals: activeFacilityReferrals.length, followUps: facilityFollowUps.length };
  });

  return {
    summary,
    stages,
    reasons,
    cases,
    facilities: facilitiesOverview,
    actions: [
      { label: 'FOLLOW-UP REQUIRED', count: followUpRequired, detail: 'Latest referral timed out and follow-up has not started.' },
      { label: 'FOLLOW-UP IN PROGRESS', count: followUpInProgress, detail: 'Shared follow-up record is in progress.' },
      { label: 'REFERRAL REQUIRES REVIEW', count: scopedReachCases.size, detail: 'Engine-reported current arrival or handshake gap; human review remains required.' },
      { label: 'RE-REFERRAL ACTIVITY', count: reReferralEvents, detail: 'Historical re-referral events recorded in this session.' },
      { label: 'CLOSURE PENDING', count: closurePending, detail: 'Latest active referral has care-received evidence and awaits closure.' },
    ],
  };
};
