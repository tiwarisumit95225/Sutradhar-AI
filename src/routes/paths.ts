export const DEMO_PATIENT_ID = 'DEMO-00125';
export const DEMO_REFERRAL_ID = 'REF-2026-00125';

export const ROUTE_PATHS = {
  login: '/login',
  designSystem: '/design-system',
  frontlineDashboard: '/frontline/dashboard',
  frontlinePatient: (patientId: string) =>
    `/frontline/patient/${encodeURIComponent(patientId)}`,
  frontlineScreening: (patientId: string) =>
    `/frontline/screening/${encodeURIComponent(patientId)}`,
  frontlineCareGaps: '/frontline/care-gaps',
  frontlineReferral: (referralId: string) =>
    `/frontline/referral/${encodeURIComponent(referralId)}`,
  frontlineClosure: (patientId: string) =>
    `/frontline/closure/${encodeURIComponent(patientId)}`,
  facilityDashboard: '/facility/dashboard',
  facilityReferral: (referralId: string) =>
    `/facility/referral/${encodeURIComponent(referralId)}`,
  facilityClosure: (patientId: string) =>
    `/facility/closure/${encodeURIComponent(patientId)}`,
  districtIntelligence: '/district/intelligence',
} as const;
