import type { HealthcareFacility } from '../types';
import type { CareGapEngineResult } from './careGapEngine';

export interface ReferralRequirements {
  services: string[];
  diagnostics: string[];
  medicationStock: string[];
}

export interface FacilityOptionEvaluation {
  facility: HealthcareFacility;
  missingServices: string[];
  missingDiagnostics: string[];
  missingMedicationStock: string[];
  operationallyAvailable: boolean;
  isSuitable: boolean;
}

/** Translate explicit care-gap wording into facility attributes represented by this prototype. */
export const getReferralRequirements = (careGap?: CareGapEngineResult): ReferralRequirements => {
  if (!careGap?.careGap) return { services: [], diagnostics: [], medicationStock: [] };
  const evidenceText = [
    careGap.careGap.title,
    careGap.careGap.subType,
    careGap.careGap.recommendedAction,
    careGap.careGap.explanation.detectedSignal,
  ].join(' ').toLocaleLowerCase();

  return {
    services: /maternal|obstetric|pregnan/.test(evidenceText)
      ? ['Emergency obstetric care']
      : [],
    diagnostics: [
      ...( /ultrasound|ultrasonography/.test(evidenceText) ? ['Obstetric Ultrasound'] : []),
    ],
    medicationStock: /magnesium sulfate|mgso4/.test(evidenceText) ? ['Magnesium Sulfate'] : [],
  };
};

const serviceAvailable = (facility: HealthcareFacility, required: string): boolean =>
  facility.availableServices.some((service) =>
    service.toLocaleLowerCase().includes(required.toLocaleLowerCase())
  );

const diagnosticAvailable = (facility: HealthcareFacility, required: string): boolean =>
  facility.diagnosticStock.some((item) =>
    item.isAvailable && item.itemName.toLocaleLowerCase().includes(required.toLocaleLowerCase())
  );

const CONFIDENCE_ORDER: Record<NonNullable<HealthcareFacility['stockConfidence']>, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

/** Transparent lexicographic ordering; no weighted/arbitrary scores are used. */
export const rankFacilityOptions = (
  facilities: HealthcareFacility[],
  requirements: ReferralRequirements
): FacilityOptionEvaluation[] => facilities.map((facility) => {
  const missingServices = requirements.services.filter((service) => !serviceAvailable(facility, service));
  const missingDiagnostics = requirements.diagnostics.filter((diagnostic) => !diagnosticAvailable(facility, diagnostic));
  const missingMedicationStock = requirements.medicationStock.filter((medication) =>
    !facility.medicationStock.some((item) =>
      item.isAvailable && item.itemName.toLocaleLowerCase().includes(medication.toLocaleLowerCase())
    )
  );
  const operationallyAvailable = facility.availability !== 'UNAVAILABLE';
  return {
    facility,
    missingServices,
    missingDiagnostics,
    missingMedicationStock,
    operationallyAvailable,
    isSuitable: operationallyAvailable && missingServices.length === 0 && missingDiagnostics.length === 0 && missingMedicationStock.length === 0,
  };
}).sort((left, right) => {
  // Priority is explicit: requirement coverage, availability, confidence, then synthetic trip length.
  if (left.isSuitable !== right.isSuitable) return left.isSuitable ? -1 : 1;
  if (left.operationallyAvailable !== right.operationallyAvailable) return left.operationallyAvailable ? -1 : 1;
  const leftConfidence = left.facility.stockConfidence ? CONFIDENCE_ORDER[left.facility.stockConfidence] : 3;
  const rightConfidence = right.facility.stockConfidence ? CONFIDENCE_ORDER[right.facility.stockConfidence] : 3;
  if (leftConfidence !== rightConfidence) return leftConfidence - rightConfidence;
  if (left.facility.distanceKm !== right.facility.distanceKm) return left.facility.distanceKm - right.facility.distanceKm;
  return left.facility.estimatedTransitMinutes - right.facility.estimatedTransitMinutes;
});
