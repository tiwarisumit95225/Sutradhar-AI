import type { CareJourneyEvidence, JourneyMilestone, ReferralLifecycleEvent, ReferralLifecycleSnapshot, ReferralLifecycleState, ReferralRecord } from '../types';

const VALID_TRANSITIONS: Record<ReferralLifecycleState, readonly ReferralLifecycleState[]> = {
  REFERRED: ['REACH_PENDING'],
  REACH_PENDING: ['REACHED', 'TIMEOUT'],
  REACHED: ['CARE_RECEIVED'],
  CARE_RECEIVED: ['CLOSED'],
  CLOSED: [],
  TIMEOUT: [],
};

export interface LifecycleEvidenceContext {
  referralId: string;
  patientId: string;
  expectedStep: string;
}

export const getCareReceivedEvidence = (snapshot: ReferralLifecycleSnapshot, referralId?: string): CareJourneyEvidence | undefined =>
  [...snapshot.history].reverse().find((event) => event.state === 'CARE_RECEIVED'
    && event.evidence?.event === 'CARE_RECEIVED'
    && event.evidence.status === 'RECORDED'
    && event.evidence.synthetic
    && event.evidence.evidenceSource === 'FACILITY_SIMULATION'
    && (!referralId || event.evidence.referralId === referralId))?.evidence;

export const getClosureEvidence = (snapshot: ReferralLifecycleSnapshot, referralId?: string): CareJourneyEvidence | undefined =>
  [...snapshot.history].reverse().find((event) => event.state === 'CLOSED'
    && event.evidence?.event === 'CLOSURE_CONFIRMED'
    && event.evidence.status === 'CONFIRMED'
    && event.evidence.synthetic
    && event.evidence.evidenceSource === 'FACILITY_SIMULATION'
    && (!referralId || event.evidence.referralId === referralId))?.evidence;

export type ReferralTransitionResult =
  | { ok: true; snapshot: ReferralLifecycleSnapshot }
  | { ok: false; snapshot: ReferralLifecycleSnapshot; reason: string };

export type HandshakeVerificationResult =
  | { ok: true; snapshot: ReferralLifecycleSnapshot; alreadyReached: boolean; alreadyVerified: boolean }
  | { ok: false; snapshot: ReferralLifecycleSnapshot; reason: 'CREDENTIALS_MISMATCH' | 'REACH_PENDING_REQUIRED' | 'REFERRAL_TIMED_OUT' | 'REFERRAL_ALREADY_ADVANCED' };

export const getInitialReferralState = (referral: ReferralRecord): ReferralLifecycleState => {
  if (referral.lifecycleState) return referral.lifecycleState;
  if (referral.handshake.arrivalAcknowledged) return 'REACHED';
  const pendingMilestone = referral.milestones.find((item) => item.milestone === 'REACH_PENDING');
  return pendingMilestone?.active ? 'REACH_PENDING' : 'REFERRED';
};

/** Build display history only from timestamps/events present in the synthetic referral record. */
export const createInitialReferralSnapshot = (referral: ReferralRecord): ReferralLifecycleSnapshot => {
  const state = getInitialReferralState(referral);
  const referredMilestone = referral.milestones.find((item) => item.milestone === 'REFERRED');
  const history: ReferralLifecycleEvent[] = [];

  if (referredMilestone?.completed) {
    history.push({
      id: `${referral.id}-referred`,
      state: 'REFERRED',
      detail: 'Referral state is represented as referred in the synthetic record.',
      source: 'SYNTHETIC_RECORD',
      ...(referredMilestone.timestamp ? { timestamp: referredMilestone.timestamp } : {}),
    });
  }

  if (state === 'REACH_PENDING') {
    history.push({
      id: `${referral.id}-reach-pending`,
      state: 'REACH_PENDING',
      detail: 'The synthetic referral record currently has reach pending.',
      source: 'SYNTHETIC_RECORD',
    });
  } else if (state === 'REACHED') {
    history.push({
      id: `${referral.id}-reached`,
      state: 'REACHED',
      detail: referral.lifecycleState === 'REACHED'
        ? 'The synthetic record state is reached; this is not live facility verification.'
        : 'The synthetic referral record includes an arrival acknowledgement.',
      source: 'SYNTHETIC_RECORD',
    });
  }

  return { state, history };
};

export const transitionReferralLifecycle = (
  snapshot: ReferralLifecycleSnapshot,
  nextState: ReferralLifecycleState,
  source: 'SIMULATION' | 'HANDSHAKE_SIMULATION' | 'FACILITY_SIMULATION' = 'SIMULATION',
  evidenceContext?: LifecycleEvidenceContext
): ReferralTransitionResult => {
  if (!VALID_TRANSITIONS[snapshot.state].includes(nextState)) {
    return {
      ok: false,
      snapshot,
      reason: `Transition ${snapshot.state} → ${nextState} is not allowed.`,
    };
  }

  if ((nextState === 'CARE_RECEIVED' || nextState === 'CLOSED')
    && (!evidenceContext?.referralId.trim() || !evidenceContext.patientId.trim() || !evidenceContext.expectedStep.trim())) {
    return { ok: false, snapshot, reason: 'Evidence context is required for this transition.' };
  }
  if (nextState === 'CLOSED') {
    const priorEvidence = getCareReceivedEvidence(snapshot, evidenceContext?.referralId);
    if (!priorEvidence || priorEvidence.patientId !== evidenceContext?.patientId || priorEvidence.expectedStep !== evidenceContext?.expectedStep) {
      return { ok: false, snapshot, reason: 'Closure requires recorded evidence for the same patient and expected care step.' };
    }
  }

  const details: Record<ReferralLifecycleState, string> = {
    REFERRED: 'Referral marked referred through a prototype state action.',
    REACH_PENDING: 'Reach pending marked through a prototype simulation action.',
    REACHED: source === 'HANDSHAKE_SIMULATION'
      ? 'Synthetic handshake credentials matched; REACH is simulated for this prototype only.'
      : 'Arrival simulated for this prototype session; this is not facility verification.',
    CARE_RECEIVED: 'Expected care step recorded as received in a synthetic facility simulation; no clinical report is created.',
    CLOSED: 'Closure confirmed from synthetic evidence that the expected care step was recorded; no health outcome is asserted.',
    TIMEOUT: 'Missed arrival simulated for this prototype session; no live timeout was received.',
  };
  const facilityEvent = nextState === 'CARE_RECEIVED' || nextState === 'CLOSED';
  const evidence: CareJourneyEvidence | undefined = facilityEvent && evidenceContext ? {
    ...evidenceContext,
    event: nextState === 'CARE_RECEIVED' ? 'CARE_RECEIVED' : 'CLOSURE_CONFIRMED',
    evidenceType: 'SYNTHETIC_FACILITY_RECORD',
    evidenceSource: 'FACILITY_SIMULATION',
    status: nextState === 'CARE_RECEIVED' ? 'RECORDED' : 'CONFIRMED',
    synthetic: true,
  } : undefined;
  const event: ReferralLifecycleEvent = {
    id: `${nextState.toLocaleLowerCase()}-${snapshot.history.length + 1}`,
    state: nextState,
    detail: details[nextState],
    source: facilityEvent ? 'FACILITY_SIMULATION' : source,
    ...(evidence ? { evidence } : {}),
  };

  return { ok: true, snapshot: { state: nextState, history: [...snapshot.history, event] } };
};

export const hasHandshakeVerification = (referral: ReferralRecord, snapshot: ReferralLifecycleSnapshot): boolean =>
  referral.handshake.arrivalAcknowledged || snapshot.history.some((event) => event.source === 'HANDSHAKE_SIMULATION');

/** Verify stable demo values, then record the outcome through the shared lifecycle snapshot. */
export const verifyHandshakeCredentials = (
  referral: ReferralRecord,
  snapshot: ReferralLifecycleSnapshot,
  presentedReferralId: string,
  presentedPasscode: string
): HandshakeVerificationResult => {
  if (presentedReferralId.trim() !== referral.id || presentedPasscode.trim() !== referral.handshake.tokenCode) {
    return { ok: false, snapshot, reason: 'CREDENTIALS_MISMATCH' };
  }

  if (hasHandshakeVerification(referral, snapshot)) {
    return { ok: true, snapshot, alreadyReached: true, alreadyVerified: true };
  }
  if (snapshot.state === 'TIMEOUT') {
    return { ok: false, snapshot, reason: 'REFERRAL_TIMED_OUT' };
  }
  if (snapshot.state === 'REFERRED') {
    return { ok: false, snapshot, reason: 'REACH_PENDING_REQUIRED' };
  }
  if (snapshot.state === 'CARE_RECEIVED' || snapshot.state === 'CLOSED') {
    return { ok: false, snapshot, reason: 'REFERRAL_ALREADY_ADVANCED' };
  }

  if (snapshot.state === 'REACH_PENDING') {
    const transition = transitionReferralLifecycle(snapshot, 'REACHED', 'HANDSHAKE_SIMULATION');
    if (!transition.ok) return { ok: false, snapshot, reason: 'REACH_PENDING_REQUIRED' };
    return { ok: true, snapshot: transition.snapshot, alreadyReached: false, alreadyVerified: false };
  }

  // REACHED via Loop 9 is terminal; record the valid token check without transitioning backward/forward.
  const event: ReferralLifecycleEvent = {
    id: `reached-${snapshot.history.length + 1}`,
    state: 'REACHED',
    detail: 'Synthetic handshake credentials matched after REACH was already recorded; no lifecycle transition was performed.',
    source: 'HANDSHAKE_SIMULATION',
  };
  return {
    ok: true,
    snapshot: { state: snapshot.state, history: [...snapshot.history, event] },
    alreadyReached: true,
    alreadyVerified: false,
  };
};

export const getNextReferralStep = (state: ReferralLifecycleState): string => {
  const nextSteps: Record<ReferralLifecycleState, string> = {
    REFERRED: 'REACH PENDING — mark that the referral is awaiting arrival.',
    REACH_PENDING: 'REACH — arrival is awaiting simulation.',
  REACHED: 'RECEIVE — record the expected care step as received.',
    CARE_RECEIVED: 'CLOSURE — confirm using the recorded synthetic evidence.',
    CLOSED: 'CLOSURE CONFIRMED — evidence recorded for the expected care step.',
    TIMEOUT: 'CARE GAP / FOLLOW-UP — future workflow; no follow-up is started here.',
  };
  return nextSteps[state];
};

export const getReferralLifecycleLabel = (state: ReferralLifecycleState): string =>
  state.replace('_', ' ');

export const isJourneyMilestoneComplete = (state: ReferralLifecycleState, milestone: JourneyMilestone): boolean => {
  if (milestone === 'SCREENED' || milestone === 'REFERRED') return true;
  if (milestone === 'REACH_PENDING') return state === 'REACHED' || state === 'CARE_RECEIVED' || state === 'CLOSED';
  if (milestone === 'RECEIVED' || milestone === 'CARE_RECEIVED') return state === 'CARE_RECEIVED' || state === 'CLOSED';
  if (milestone === 'CLOSED') return state === 'CLOSED';
  return false;
};
