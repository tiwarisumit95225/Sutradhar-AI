export type LocalActionType =
  | 'SCREENING_SAVED'
  | 'REFERRAL_LIFECYCLE'
  | 'HANDSHAKE_VERIFIED'
  | 'FOLLOW_UP_STARTED'
  | 'FOLLOW_UP_COMPLETED'
  | 'RE_REFERRAL_CREATED';

export type LocalSyncStatus = 'PENDING SYNC' | 'SYNCED';

/** Local prototype event only. Payload fields are synthetic identifiers/state, never credentials. */
export interface LocalQueuedAction {
  id: string;
  type: LocalActionType;
  payload: Record<string, string>;
  createdAt: string;
  syncStatus: LocalSyncStatus;
}
