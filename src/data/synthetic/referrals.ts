import { ReferralRecord } from '../../types';

/**
 * SYNTHETIC DEMO DATA ONLY - PROTOTYPE
 */
export const SYNTHETIC_REFERRALS: ReferralRecord[] = [
  {
    id: 'REF-2026-00125',
    beneficiaryId: 'DEMO-00125',
    destinationFacilityId: 'chc-bikrampur',
    lifecycleState: 'REACH_PENDING',
    clinicalIndication: 'Pre-eclampsia triage & Obstetric USG evaluation (BP 142/92, Hb 9.8)',
    currentTransitStatus: 'In Transit via Rural Auto-Rickshaw',
    etaMinutes: 18,
    remainingKm: 4.2,
    handshake: {
      tokenCode: 'SH-28491',
      referralId: 'REF-2026-00125',
      patientAbhaId: '91-8273-1928-4412',
      issuingAshaId: 'ASHA-MEENA-01',
      destinationFacilityId: 'chc-bikrampur',
      targetDesk: 'OPD Desk 2 (Dr. M. Verma)',
      generatedAt: '2026-09-26T09:15:00Z',
      smsDispatchStatus: 'DELIVERED',
      arrivalAcknowledged: false, // Pending facility arrival
    },
    milestones: [
      { milestone: 'SCREENED', label: 'Screened', completed: true, active: false, timestamp: '14 Sep 2026, 10:30 AM' },
      { milestone: 'REFERRED', label: 'Referred', completed: true, active: false, timestamp: '16 Sep 2026, 11:00 AM' },
      { milestone: 'REACH_PENDING', label: 'Reach Pending', completed: false, active: true },
      { milestone: 'RECEIVED', label: 'Receive', completed: false, active: false },
      { milestone: 'CLOSED', label: 'Closed', completed: false, active: false },
    ],
  },
];
