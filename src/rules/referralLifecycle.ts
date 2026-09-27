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
  nextState: ReferralLifecycleState
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
    REACHED: 'Arrival simulated for this prototype session; this is not facility verification.',
    TIMEOUT: 'Missed arrival simulated for this prototype session; no live timeout was received.',
  };
  const event: ReferralLifecycleEvent = {
    id: `${nextState.toLocaleLowerCase()}-${snapshot.history.length + 1}`,
    state: nextState,
    detail: details[nextState],
    source: 'SIMULATION',
  };

  return { ok: true, snapshot: { state: nextState, history: [...snapshot.history, event] } };
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
