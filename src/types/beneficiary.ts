/**
 * Synthetic Beneficiary Data Types
 * PROTOTYPE / SYNTHETIC DATA ONLY - NOT REAL PATIENT DATA
 */

export type UrgencyTier = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'ROUTINE';

export interface VitalsRecord {
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  hemoglobinGdl: number;
  fundalHeightCm?: number;
  fetalHeartRateBpm?: number;
  recordedAt: string;
}

export interface Beneficiary {
  id: string; // e.g. "DEMO-00125"
  syntheticRchId: string; // e.g. "RCH-2026-MP-0912"
  fullName: string;
  age: number;
  gender: 'FEMALE' | 'MALE' | 'OTHER';
  village: string;
  /** Synthetic map point for prototype visualization; never a real beneficiary location. */
  syntheticCoordinates?: {
    latitude: number;
    longitude: number;
  };
  section: string;
  assignedAshaName: string;
  assignedAshaContact: string;
  gravida: number;
  para: number;
  gestationalWeeks: number;
  urgencyTier: UrgencyTier;
  riskSummary: string;
  latestVitals: VitalsRecord;
}
