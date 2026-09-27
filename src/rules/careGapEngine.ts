import type { Beneficiary, CareGap, ReferralRecord, TimelineEvent } from '../types';
import { hasExplicitExpiryEvidence, isUnresolvedCareGap } from './careGapRules';
import type { CareGapReasonCode } from './careGapRules';

export interface CareGapEngineInput {
  beneficiaries: Beneficiary[];
  careGaps: CareGap[];
  referrals: ReferralRecord[];
}

export interface CareGapEvidence {
  sourceType: 'CARE_GAP' | 'REFERRAL' | 'SCREENING_EVENT';
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
export const evaluateCareGaps = ({ beneficiaries, careGaps, referrals }: CareGapEngineInput): CareGapEngineResult[] => {
  const results: CareGapEngineResult[] = [];
  const knownIds = new Set(beneficiaries.map((beneficiary) => beneficiary.id));

  for (const gap of careGaps) {
    const beneficiary = beneficiaries.find((item) => item.id === gap.beneficiaryId);
    if (!beneficiary || !isUnresolvedCareGap(gap)) continue;

    const referral = referrals.find((item) => item.beneficiaryId === beneficiary.id);
    const gapEvidence = toEvidence(gap);
    const screenings = screeningEvidence(gap);
    for (const event of screenings) {
      if (!gapEvidence.some((item) => item.sourceId === event.id)) {
        gapEvidence.push({ sourceType: 'SCREENING_EVENT', sourceId: event.id, label: `${event.title} · ${event.date}`, detail: event.description });
      }
    }

    const referralExpired = Boolean(referral && !referral.handshake.arrivalAcknowledged && hasExplicitExpiryEvidence(gap));
    if (referral) {
      gapEvidence.push({ sourceType: 'REFERRAL', sourceId: referral.id, label: `Referral ${referral.id}`, detail: `${referral.currentTransitStatus}; arrival ${referral.handshake.arrivalAcknowledged ? 'acknowledged' : 'not acknowledged'}.` });
    }
    const confirmed = hasExplicitExpiryEvidence(gap);
    const reachExpected = referral && !referral.handshake.arrivalAcknowledged && (referralExpired || /reach|arrival|handshake/i.test(`${gap.title} ${gap.subType}`));

    results.push({
      id: gap.id,
      beneficiary,
      careGap: gap,
      referral,
      expectedStep: reachExpected ? 'REACH — patient reaches referred facility' : gap.title,
      actualState: reachExpected
        ? 'Arrival acknowledgement is missing.'
        : `Existing gap remains ${gap.status.toLowerCase()}.`,
      timeStateCondition: confirmed
        ? `Explicit expiry/breach evidence is recorded (${gap.breachWindowHours} breach-window hours).`
        : 'An unresolved gap is recorded, but no explicit expiry is present.',
      result: 'CARE_GAP',
      status: confirmed ? 'CONFIRMED' : 'PROBABLE / UNCONFIRMED',
      priority: beneficiary.urgencyTier,
      confidence: confirmed ? 'EVIDENCE CONFIRMED' : 'UNCONFIRMED SIGNAL',
      reasonCode: reachExpected ? 'REFERRAL_ARRIVAL_NOT_CONFIRMED' : 'EXPECTED_STEP_MISSING',
      explanation: reachExpected
        ? confirmed
          ? 'The linked referral has no arrival acknowledgement and its evidence trail records an expired arrival window.'
          : 'The linked referral has no arrival acknowledgement; the records do not establish that its expected window has expired.'
        : `${gap.explanation.detectedSignal} ${confirmed ? 'The source record marks the expected care step as breached.' : 'The recorded source gap is unresolved, but breach is not explicitly confirmed.'}`,
      ...(referral && !referral.handshake.arrivalAcknowledged ? {
        predictedStep: 'REACH — patient reaches referred facility',
        riskLevel: confirmed ? 'HIGH' as const : 'MODERATE' as const,
        predictionReason: confirmed
          ? 'Arrival remains unacknowledged after the source gap recorded an expired window.'
          : `Arrival is still pending while the referral reports ${referral.currentTransitStatus.toLowerCase()} (ETA ${referral.etaMinutes} minutes).`,
      } : {}),
      suggestedAction: gap.recommendedAction,
      evidence: gapEvidence,
    });
  }

  // A pending referral with an explicit ETA supports a probable risk signal, not a confirmed failure.
  for (const referral of referrals) {
    if (!knownIds.has(referral.beneficiaryId) || referral.handshake.arrivalAcknowledged) continue;
    const beneficiary = beneficiaries.find((item) => item.id === referral.beneficiaryId);
    if (!beneficiary) continue;
    const existing = results.find((item) => item.beneficiary.id === beneficiary.id && item.referral?.id === referral.id);
    if (existing) continue;
    results.push({
      id: `PRED-${referral.id}`,
      beneficiary,
      referral,
      expectedStep: 'REACH — patient reaches referred facility',
      actualState: 'Arrival acknowledgement is missing.',
      timeStateCondition: `Referral is still in the represented transit state; ETA ${referral.etaMinutes} minutes. No expired window is recorded.`,
      result: 'AT_RISK',
      status: 'PROBABLE / UNCONFIRMED',
      priority: beneficiary.urgencyTier,
      confidence: 'UNCONFIRMED SIGNAL',
      reasonCode: 'REFERRAL_TIMEOUT_RISK',
      explanation: `The referral remains unacknowledged while its recorded transit state is “${referral.currentTransitStatus}”; no expiry evidence confirms a missed arrival.`,
      predictedStep: 'REACH — patient reaches referred facility',
      riskLevel: 'MODERATE',
      predictionReason: `The referral has a pending arrival acknowledgement and a recorded ETA of ${referral.etaMinutes} minutes.`,
      suggestedAction: 'Human review: check the referral arrival status when the expected transit window passes.',
      evidence: [{ sourceType: 'REFERRAL', sourceId: referral.id, label: `Referral ${referral.id}`, detail: `${referral.currentTransitStatus}; ETA ${referral.etaMinutes} minutes; arrival not acknowledged.` }],
    });
  }

  return results;
};

export const getCareGapsForBeneficiary = (input: CareGapEngineInput, beneficiaryId: string | undefined): CareGapEngineResult[] => {
  if (!beneficiaryId || !input.beneficiaries.some((beneficiary) => beneficiary.id === beneficiaryId)) return [];
  return evaluateCareGaps(input).filter((result) => result.beneficiary.id === beneficiaryId);
};
