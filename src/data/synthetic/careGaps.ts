import { CareGap } from '../../types';

/**
 * SYNTHETIC DEMO DATA ONLY - PROTOTYPE
 */
export const SYNTHETIC_CARE_GAPS: CareGap[] = [
  {
    id: 'GAP-2026-081',
    beneficiaryId: 'DEMO-00125',
    expectedReferralId: 'REF-2026-00125',
    title: 'Missed ANC Check 3 & Essential Ultrasonography',
    subType: 'Maternal High-Risk Surveillance Interval Breach',
    status: 'EXPIRED',
    breachWindowHours: 48,
    explanation: {
      detectedSignal: 'ANC-3 window breach: >14 days past recommended 24-28w interval with BP 142/92 mmHg elevation.',
      predictedConsequence: 'High probability of unmanaged pre-eclampsia progression without parenteral Magnesium Sulfate availability.',
      rootCauseFactors: [
        '12 km transit barrier to CHC during intermittent morning monsoon showers',
        'Seasonal agricultural harvesting commitments in Kalyanpur village',
        'No direct rural bus connectivity scheduled on Tuesdays',
      ],
      evidenceTrail: [
        {
          id: 'ev-1',
          date: '14 Sep 2026',
          title: 'Screening Logged',
          description: 'BP 142/92 mmHg, Hb 9.8 g/dL recorded during village field screening.',
          facilityOrLocation: 'Rampur Sub-Center',
          statusType: 'SCREENING',
          screeningObservation: {
            bloodPressureSystolic: 142,
            bloodPressureDiastolic: 92,
            hemoglobinGdl: 9.8,
          },
        },
        {
          id: 'ev-2',
          date: '16 Sep 2026',
          title: 'Smart Referral Dispatched',
          description: 'Referral dispatched with recommended routing to CHC Bikrampur.',
          facilityOrLocation: 'ASHA Meena Bai Handheld',
          statusType: 'DISPATCH',
        },
        {
          id: 'ev-3',
          date: '24 Sep 2026',
          title: 'Arrival Window Expired',
          description: 'No facility handshake acknowledgement (REACH = TRUE) logged within 7 days.',
          facilityOrLocation: 'CHC Bikrampur OPD Desk',
          statusType: 'EXPIRY',
          isHighlighted: true,
        },
        {
          id: 'ev-4',
          date: '26 Sep 2026',
          title: 'Automated Care-Gap Flag Raised',
          description: 'Priority Tier 1 Alert escalated to Frontline Worker and Facility Rosters.',
          facilityOrLocation: 'Sutradhar Rules Engine',
          statusType: 'ALERT',
          isHighlighted: true,
        },
      ],
    },
    recommendedAction: 'Execute urgent home visit protocol, provide transit pass voucher, re-route to CHC Bikrampur with active MgSO4 stock.',
  },
];
