export type AiAssistContext =
  | {
      kind: 'CARE_GAP';
      patientId: string;
      expectedStep: string;
      currentState: string;
      reasonCode: string;
      referralId?: string;
      followUpState?: string;
      sourceIds: string[];
    }
  | {
      kind: 'PATIENT_SUMMARY';
      patientId: string;
      lifecycleState?: string;
      expectedStep?: string;
      currentState: string;
      referralId?: string;
      followUpState?: string;
      sourceIds: string[];
    }
  | {
      kind: 'FOLLOW_UP';
      referralId: string;
      status: string;
      steps: string[];
      sourceIds: string[];
    }
  | {
      kind: 'DISTRICT_SUMMARY';
      activeCareGaps: number;
      reachGaps: number;
      followUpRequired: number;
      sourceIds: string[];
    }
  | {
      kind: 'FACILITY_CONTEXT';
      facilityName: string;
      isSuitable: boolean;
      matchedSignals: string[];
      missingSignals: string[];
      sourceIds: string[];
    };

export interface AiTextProvider {
  generate: (context: AiAssistContext) => string;
}

export interface AiAssistOptions {
  isOnline: boolean;
  provider?: AiTextProvider;
}

export interface AiAssistResult {
  text: string;
  sourceIds: string[];
  mode: 'LOCAL FALLBACK' | 'OPTIONAL PROVIDER';
  notice?: string;
}
