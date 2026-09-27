import type { AiAssistContext } from './aiTypes';

/** Short deterministic wording derived only from the supplied, rule-owned context. */
export const createLocalAssistText = (context: AiAssistContext): string => {
  switch (context.kind) {
    case 'CARE_GAP':
      return /reach|arrival/i.test(context.expectedStep)
        ? `Arrival for referral ${context.referralId ?? 'in the source record'} has not yet been confirmed. ${context.currentState} Review the referral status and consider the next operational follow-up.`
        : `${context.expectedStep} remains unrecorded. ${context.currentState} Review the source record and consider the next operational follow-up.`;
    case 'PATIENT_SUMMARY':
      return `Synthetic patient ${context.patientId} is at ${context.lifecycleState ?? 'the recorded care stage'}. ${context.currentState}${context.followUpState ? ` Follow-up is ${context.followUpState.toLowerCase()}.` : ''}`;
    case 'FOLLOW_UP': {
      const steps = context.steps.filter(Boolean);
      if (!steps.length) return `Review the recorded referral ${context.referralId} with a human reviewer.`;
      const readable = steps.map((step) => step.charAt(0).toLocaleLowerCase() + step.slice(1));
      const joined = readable.length < 2
        ? readable[0]
        : `${readable.slice(0, -1).join(', ')}, and ${readable[readable.length - 1]}`;
      return `For referral ${context.referralId}, ${joined}.`;
    }
    case 'DISTRICT_SUMMARY':
      return `Current synthetic aggregate records ${context.activeCareGaps} active care gap${context.activeCareGaps === 1 ? '' : 's'}, including ${context.reachGaps} reach gap${context.reachGaps === 1 ? '' : 's'}, and ${context.followUpRequired} follow-up${context.followUpRequired === 1 ? '' : 's'} required.`;
    case 'FACILITY_CONTEXT': {
      const signals = context.matchedSignals.length
        ? `Represented matching signals: ${context.matchedSignals.join('; ')}.`
        : 'No matching requirement signal is listed in the represented facility data.';
      const missing = context.missingSignals.length
        ? ` Unmatched listed requirements: ${context.missingSignals.join('; ')}.`
        : '';
      const rankText = context.isSuitable
        ? 'The deterministic rules mark this option suitable for the represented requirements.'
        : 'This option appears in the deterministic ranking with the following represented limits.';
      return `${context.facilityName} is shown by the deterministic facility ranking. ${rankText} ${signals}${missing} A human reviewer makes the facility choice.`;
    }
  }
};
