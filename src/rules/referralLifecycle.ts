import type { ReferralLifecycleEvent, ReferralLifecycleSnapshot, ReferralLifecycleState, ReferralRecord } from '../types';

const VALID_TRANSITIONS: Record<ReferralLifecycleState, readonly ReferralLifecycleState[]> = {
  REFERRED: ['REACH_PENDING'],
  REACH_PENDING: ['REACHED', 'TIMEOUT'],
  REACHED: [],
  TIMEOUT: [],
};

export type ReferralTransitionResult =
  | { ok: true; snapshot: ReferralLifecycleSnapshot }
  | { ok: false; snapshot: ReferralLifecycleSnapshot; reason: string };

export type HandshakeVerificationResult =
  | { ok: true; snapshot: ReferralLifecycleSnapshot; alreadyReached: boolean; alreadyVerified: boolean }
  | { ok: false; snapshot: ReferralLifecycleSnapshot; reason: 'CREDENTIALS_MISMATCH' | 'REACH_PENDING_REQUIRED' | 'REFERRAL_TIMED_OUT' };

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
  source: 'SIMULATION' | 'HANDSHAKE_SIMULATION' = 'SIMULATION'
): ReferralTransitionResult => {
  if (!VALID_TRANSITIONS[snapshot.state].includes(nextState)) {
    return {
      ok: false,
      snapshot,
      reason: `Transition ${snapshot.state} → ${nextState} is not allowed.`,
    };
  }

  const details: Record<ReferralLifecycleState, string> = {
    REFERRED: 'Referral marked referred through a prototype state action.',
    REACH_PENDING: 'Reach pending marked through a prototype simulation action.',
    REACHED: source === 'HANDSHAKE_SIMULATION'
      ? 'Synthetic handshake credentials matched; REACH is simulated for this prototype only.'
      : 'Arrival simulated for this prototype session; this is not facility verification.',
    TIMEOUT: 'Missed arrival simulated for this prototype session; no live timeout was received.',
  };
  const event: ReferralLifecycleEvent = {
    id: `${nextState.toLocaleLowerCase()}-${snapshot.history.length + 1}`,
    state: nextState,
    detail: details[nextState],
    source,
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
    REACHED: 'RECEIVE — future workflow; not implemented in this loop.',
    TIMEOUT: 'CARE GAP / FOLLOW-UP — future workflow; no follow-up is started here.',
  };
  return nextSteps[state];
};

export const getReferralLifecycleLabel = (state: ReferralLifecycleState): string =>
  state.replace('_', ' ');
