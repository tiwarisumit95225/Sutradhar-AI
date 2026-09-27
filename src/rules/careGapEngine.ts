import type { Beneficiary, CareGap, ReferralLifecycleSnapshot, ReferralRecord, TimelineEvent } from '../types';
import { hasExplicitExpiryEvidence, isUnresolvedCareGap } from './careGapRules';
import type { CareGapReasonCode } from './careGapRules';
import { createInitialReferralSnapshot, getCareReceivedEvidence } from './referralLifecycle';
import type { SyntheticFollowUp } from '../types';

export interface CareGapEngineInput {
  beneficiaries: Beneficiary[];
  careGaps: CareGap[];
  referrals: ReferralRecord[];
  referralLifecycle?: Record<string, ReferralLifecycleSnapshot>;
  followUps?: Record<string, SyntheticFollowUp>;
}

export interface CareGapEvidence {
  sourceType: 'CARE_GAP' | 'REFERRAL' | 'REFERRAL_LIFECYCLE' | 'SCREENING_EVENT';
  sourceId: string;
  label: string;
  detail: string;
}

export interface CareGapEngineResult {
  id: string;
  beneficiary: Beneficiary;
  careGap?: CareGap;
  referral?: ReferralRecord;
  expectedStep: string;
  actualState: string;
  timeStateCondition: string;
  result: 'CARE_GAP' | 'AT_RISK';
  status: 'CONFIRMED' | 'PROBABLE / UNCONFIRMED';
  priority: Beneficiary['urgencyTier'];
  confidence: 'EVIDENCE CONFIRMED' | 'UNCONFIRMED SIGNAL';
  reasonCode: CareGapReasonCode;
  explanation: string;
  predictedStep?: string;
  riskLevel?: 'HIGH' | 'MODERATE';
  predictionReason?: string;
  suggestedAction: string;
  evidence: CareGapEvidence[];
}

const toEvidence = (gap: CareGap): CareGapEvidence[] => [
  { sourceType: 'CARE_GAP', sourceId: gap.id, label: `Existing care gap ${gap.id}`, detail: gap.explanation.detectedSignal },
  ...gap.explanation.evidenceTrail.map((event) => ({
    sourceType: (event.statusType === 'SCREENING' ? 'SCREENING_EVENT' : 'CARE_GAP') as CareGapEvidence['sourceType'],
    sourceId: event.id,
    label: `${event.title} · ${event.date}`,
    detail: event.description,
  })),
];

const screeningEvidence = (gap: CareGap | undefined): TimelineEvent[] =>
  gap?.explanation.evidenceTrail.filter((event) => event.statusType === 'SCREENING') ?? [];

/** Deterministic operational rules using only supplied synthetic records. */
export const evaluateCareGaps = ({ beneficiaries, careGaps, referrals, referralLifecycle = {}, followUps = {} }: CareGapEngineInput): CareGapEngineResult[] => {
  const results: CareGapEngineResult[] = [];
  const knownIds = new Set(beneficiaries.map((beneficiary) => beneficiary.id));

  for (const gap of careGaps) {
    const beneficiary = beneficiaries.find((item) => item.id === gap.beneficiaryId);
    if (!beneficiary || !isUnresolvedCareGap(gap)) continue;

    const referral = gap.expectedReferralId
      ? referrals.find((item) => item.id === gap.expectedReferralId && item.beneficiaryId === beneficiary.id)
      : referrals.find((item) => item.beneficiaryId === beneficiary.id);
    const gapEvidence = toEvidence(gap);
    const screenings = screeningEvidence(gap);
    for (const event of screenings) {
      if (!gapEvidence.some((item) => item.sourceId === event.id)) {
        gapEvidence.push({ sourceType: 'SCREENING_EVENT', sourceId: event.id, label: `${event.title} · ${event.date}`, detail: event.description });
      }
    }

    const lifecycle = referral
      ? referralLifecycle[referral.id] ?? createInitialReferralSnapshot(referral)
      : undefined;
    const referralState = lifecycle?.state;
    const careReceivedEvidence = referral && lifecycle ? getCareReceivedEvidence(lifecycle, referral.id) : undefined;
    const expectedStepResolved = Boolean(referral && gap.expectedReferralId === referral.id
      && careReceivedEvidence?.expectedStep === referral.clinicalIndication
      && (referralState === 'CARE_RECEIVED' || referralState === 'CLOSED'));
    if (expectedStepResolved) continue;
    const arrivalReached = Boolean(referral && (referralState === 'REACHED' || referralState === 'CARE_RECEIVED' || referralState === 'CLOSED' || (referralState !== 'TIMEOUT' && referral.handshake.arrivalAcknowledged)));
    const timeoutEvent = lifecycle?.history.find((event) => event.state === 'TIMEOUT' && event.source === 'SIMULATION');
    const timeoutEvidenceExists = Boolean(timeoutEvent && referralState === 'TIMEOUT');
    const referralExpired = Boolean(referral && !arrivalReached && (timeoutEvidenceExists || hasExplicitExpiryEvidence(gap)));
    if (referral) {
      gapEvidence.push({
        sourceType: 'REFERRAL',
        sourceId: referral.id,
        label: `Referral ${referral.id}`,
        detail: `Lifecycle state ${referralState ?? 'REFERRED'}; ${arrivalReached ? 'arrival is represented as reached' : 'arrival is not reached'}.`,
      });
      lifecycle?.history.forEach((event) => gapEvidence.push({
        sourceType: 'REFERRAL_LIFECYCLE',
        sourceId: event.id,
        label: `${event.state}${event.timestamp ? ` · ${event.timestamp}` : ''}`,
        detail: event.detail,
      }));
      const followUp = followUps[referral.id];
      followUp?.events.forEach((event) => gapEvidence.push({
        sourceType: 'REFERRAL_LIFECYCLE',
        sourceId: event.id,
        label: `${event.event.replace(/_/g, ' ')} · SIMULATED`,
        detail: event.detail,
      }));
    }
    const confirmed = hasExplicitExpiryEvidence(gap) || timeoutEvidenceExists;
    const reachExpected = referral && !arrivalReached && (timeoutEvidenceExists || referralExpired || /reach|arrival|handshake/i.test(`${gap.title} ${gap.subType}`));

    results.push({
      id: gap.id,
      beneficiary,
      careGap: gap,
      referral,
      expectedStep: reachExpected ? 'REACH — patient reaches referred facility' : gap.title,
      actualState: timeoutEvidenceExists
        ? 'Referral timed out before arrival was confirmed.'
        : arrivalReached
          ? 'Arrival is recorded as simulated for this prototype session; the care gap itself remains unresolved.'
          : reachExpected
            ? 'Arrival acknowledgement is missing.'
            : `Existing gap remains ${gap.status.toLowerCase()}.`,
      timeStateCondition: confirmed
        ? timeoutEvidenceExists
          ? 'A simulated referral timeout event is present in the lifecycle history.'
          : `Explicit expiry/breach evidence is recorded (${gap.breachWindowHours} breach-window hours).`
        : 'An unresolved gap is recorded, but no explicit expiry is present.',
      result: 'CARE_GAP',
      status: confirmed ? 'CONFIRMED' : 'PROBABLE / UNCONFIRMED',
      priority: beneficiary.urgencyTier,
      confidence: confirmed ? 'EVIDENCE CONFIRMED' : 'UNCONFIRMED SIGNAL',
      reasonCode: reachExpected ? 'REFERRAL_ARRIVAL_NOT_CONFIRMED' : 'EXPECTED_STEP_MISSING',
      explanation: timeoutEvidenceExists
        ? 'The lifecycle records a simulated referral timeout before arrival. This is operational demo evidence, not a live facility acknowledgement.'
        : reachExpected
        ? confirmed
          ? 'The linked referral has no arrival acknowledgement and its evidence trail records an expired arrival window.'
          : 'The linked referral has no arrival acknowledgement; the records do not establish that its expected window has expired.'
        : `${gap.explanation.detectedSignal} ${confirmed ? 'The source record marks the expected care step as breached.' : 'The recorded source gap is unresolved, but breach is not explicitly confirmed.'}`,
      ...(referral && !arrivalReached && referralState === 'REACH_PENDING' ? {
        predictedStep: 'REACH — patient reaches referred facility',
        riskLevel: confirmed ? 'HIGH' as const : 'MODERATE' as const,
        predictionReason: confirmed
          ? 'Arrival remains unacknowledged after the source gap recorded an expired window.'
          : `Arrival is still pending while the referral reports ${referral.currentTransitStatus.toLowerCase()} (ETA ${referral.etaMinutes} minutes).`,
      } : {}),
      suggestedAction: arrivalReached
        ? 'Human review: simulated arrival does not confirm care received; review the still-open source care gap.'
        : timeoutEvidenceExists
          ? 'Human review: review the timed-out referral and resulting operational care gap.'
          : gap.recommendedAction,
      evidence: gapEvidence,
    });
  }

  // Unresolved referrals without a source care-gap record still surface from lifecycle evidence.
  for (const referral of referrals) {
    if (!knownIds.has(referral.beneficiaryId)) continue;
    const lifecycle = referralLifecycle[referral.id] ?? createInitialReferralSnapshot(referral);
    const timeoutEvent = lifecycle.history.find((event) => event.state === 'TIMEOUT' && event.source === 'SIMULATION');
    const timeoutEvidenceExists = lifecycle.state === 'TIMEOUT' && Boolean(timeoutEvent);
    const careReceivedEvidence = getCareReceivedEvidence(lifecycle, referral.id);
    const careRecorded = Boolean(careReceivedEvidence && careReceivedEvidence.expectedStep === referral.clinicalIndication
      && (lifecycle.state === 'CARE_RECEIVED' || lifecycle.state === 'CLOSED'));
    if (careRecorded) continue;
    const arrivalReached = lifecycle.state === 'REACHED' || lifecycle.state === 'CARE_RECEIVED' || lifecycle.state === 'CLOSED' || (lifecycle.state !== 'TIMEOUT' && referral.handshake.arrivalAcknowledged);
    if (arrivalReached || (!timeoutEvidenceExists && referral.handshake.arrivalAcknowledged)) continue;
    const beneficiary = beneficiaries.find((item) => item.id === referral.beneficiaryId);
    if (!beneficiary) continue;
    const existing = results.find((item) => item.beneficiary.id === beneficiary.id && item.referral?.id === referral.id);
    if (existing) continue;
    results.push({
      id: timeoutEvidenceExists ? `TIMEOUT-${referral.id}` : `PRED-${referral.id}`,
      beneficiary,
      referral,
      expectedStep: 'REACH — patient reaches referred facility',
      actualState: timeoutEvidenceExists
        ? 'Referral timed out before arrival was confirmed.'
        : 'Arrival acknowledgement is missing.',
      timeStateCondition: timeoutEvidenceExists
        ? 'A simulated timeout event is present in the lifecycle history.'
        : `Referral is still in the represented transit state; ETA ${referral.etaMinutes} minutes. No expired window is recorded.`,
      result: timeoutEvidenceExists ? 'CARE_GAP' : 'AT_RISK',
      status: timeoutEvidenceExists ? 'CONFIRMED' : 'PROBABLE / UNCONFIRMED',
      priority: beneficiary.urgencyTier,
      confidence: timeoutEvidenceExists ? 'EVIDENCE CONFIRMED' : 'UNCONFIRMED SIGNAL',
      reasonCode: timeoutEvidenceExists ? 'REFERRAL_ARRIVAL_NOT_CONFIRMED' : 'REFERRAL_TIMEOUT_RISK',
      explanation: timeoutEvidenceExists
        ? 'The referral timed out before arrival was confirmed, based on an explicit simulated lifecycle event.'
        : `The referral remains unacknowledged while its recorded transit state is “${referral.currentTransitStatus}”; no lifecycle timeout event is recorded.`,
      ...(!timeoutEvidenceExists ? {
        predictedStep: 'REACH — patient reaches referred facility',
        riskLevel: 'MODERATE' as const,
        predictionReason: `The referral has a pending arrival acknowledgement and a recorded ETA of ${referral.etaMinutes} minutes.`,
      } : {}),
      suggestedAction: timeoutEvidenceExists
        ? 'Human review: review the timed-out referral and resulting operational care gap.'
        : 'Human review: check the referral arrival status when the expected transit window passes.',
      evidence: [
        { sourceType: 'REFERRAL', sourceId: referral.id, label: `Referral ${referral.id}`, detail: `${referral.currentTransitStatus}; lifecycle state ${lifecycle.state}.` },
        ...lifecycle.history.map((event) => ({ sourceType: 'REFERRAL_LIFECYCLE' as const, sourceId: event.id, label: event.state, detail: event.detail })),
      ],
    });
  }

  return results;
};

export const getCareGapsForBeneficiary = (input: CareGapEngineInput, beneficiaryId: string | undefined): CareGapEngineResult[] => {
  if (!beneficiaryId || !input.beneficiaries.some((beneficiary) => beneficiary.id === beneficiaryId)) return [];
  return evaluateCareGaps(input).filter((result) => result.beneficiary.id === beneficiaryId);
};
