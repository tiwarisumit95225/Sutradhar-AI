/**
 * Healthcare Facility & Inventory Types
 * PROTOTYPE / SYNTHETIC DATA ONLY
 */

export type FacilityType = 'SUB_CENTER' | 'PHC' | 'CHC' | 'DISTRICT_HOSPITAL';
export type FacilityAvailability = 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
export type StockConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface FacilityDiagnosticStock {
  itemName: string;
  isAvailable: boolean;
  notes?: string;
}

export interface HealthcareFacility {
  id: string; // e.g. "chc-bikrampur"
  name: string;
  facilityType: FacilityType;
  distanceKm: number;
  estimatedTransitMinutes: number;
  roadCondition: string;
  isRecommended: boolean;
  availability: FacilityAvailability;
  /** Operational confidence in the freshness/confirmation of demo availability information. */
  stockConfidence?: StockConfidence;
  availableServices: string[];
  recommendationReason?: string;
  warningAlert?: string;
  specialistsOnDuty: string[];
  diagnosticStock: FacilityDiagnosticStock[];
  coordinates: {
    x: number;
    y: number;
  };
}
