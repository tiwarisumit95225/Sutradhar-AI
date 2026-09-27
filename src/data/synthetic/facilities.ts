import { HealthcareFacility } from '../../types';

/**
 * SYNTHETIC DEMO DATA ONLY - PROTOTYPE
 */
export const SYNTHETIC_FACILITIES: HealthcareFacility[] = [
  {
    id: 'sc-rampur',
    name: 'Sub-Center Rampur',
    facilityType: 'SUB_CENTER',
    distanceKm: 0.8,
    estimatedTransitMinutes: 5,
    roadCondition: 'Village Pacca Lane',
    isRecommended: false,
    availability: 'AVAILABLE',
    stockConfidence: 'MEDIUM',
    availableServices: ['Blood pressure screening', 'Rapid diagnostic testing'],
    latitude: 22.991,
    longitude: 78.012,
    specialistsOnDuty: ['Meena Bai (ASHA)', 'Kavita Sharma (ANM)'],
    medicationStock: [],
    diagnosticStock: [
      { itemName: 'Rapid Diagnostic Strips', isAvailable: true },
      { itemName: 'BP Apparatus', isAvailable: true },
    ],
    coordinates: { x: 70, y: 190 },
  },
  {
    id: 'phc-kalyanpur',
    name: 'PHC Kalyanpur',
    facilityType: 'PHC',
    distanceKm: 6.0,
    estimatedTransitMinutes: 18,
    roadCondition: 'Rural Arterial Road (Fair)',
    isRecommended: false,
    availability: 'LIMITED',
    stockConfidence: 'LOW',
    availableServices: ['General OPD', 'Blood pressure screening'],
    latitude: 23.035,
    longitude: 78.042,
    warningAlert: 'CBC No Reagents • Magnesium Sulfate Out of Stock',
    specialistsOnDuty: ['Medical Officer (General OPD)'],
    medicationStock: [
      { itemName: 'Magnesium Sulfate', isAvailable: false, notes: 'Stock Depleted since 22 Sep' },
    ],
    diagnosticStock: [
      { itemName: 'CBC Analyzer Reagents', isAvailable: false, notes: 'Stock Out' },
      { itemName: 'Obstetric Ultrasound', isAvailable: false, notes: 'Sonologist on leave' },
    ],
    coordinates: { x: 160, y: 90 },
  },
  {
    id: 'chc-bikrampur',
    name: 'CHC Bikrampur',
    facilityType: 'CHC',
    distanceKm: 12.4,
    estimatedTransitMinutes: 35,
    roadCondition: 'Dry Metalled Highway Corridor',
    isRecommended: true,
    availability: 'AVAILABLE',
    stockConfidence: 'HIGH',
    availableServices: ['Emergency obstetric care', 'Ultrasound'],
    latitude: 23.072,
    longitude: 78.118,
    recommendationReason: 'Emergency obstetric care listed • medication stock listed • Sonologist on Duty',
    specialistsOnDuty: [
      'Dr. Arvind Swaminathan (MO In-Charge)',
      'Dr. M. Verma (Obstetrician)',
      'Sister Saroj (Staff Nurse L&D)',
    ],
    medicationStock: [
      { itemName: 'Magnesium Sulfate', isAvailable: true, notes: 'Ample supply (48 vials)' },
    ],
    diagnosticStock: [
      { itemName: 'Obstetric Ultrasound (USG)', isAvailable: true, notes: 'Active operator' },
      { itemName: 'Maternal ICU Bed', isAvailable: true, notes: '2 beds unassigned' },
    ],
    coordinates: { x: 230, y: 110 },
  },
  {
    id: 'dh-sadar',
    name: 'District Hospital Sadar',
    facilityType: 'DISTRICT_HOSPITAL',
    distanceKm: 35.2,
    estimatedTransitMinutes: 75,
    roadCondition: 'State Highway',
    isRecommended: false,
    availability: 'AVAILABLE',
    stockConfidence: 'MEDIUM',
    availableServices: ['Tertiary care', 'Blood bank'],
    latitude: 23.215,
    longitude: 78.305,
    recommendationReason: 'Tertiary Care Backup (High Travel Burden)',
    specialistsOnDuty: ['Full Multi-Specialty Department'],
    medicationStock: [],
    diagnosticStock: [
      { itemName: 'Tertiary NICU / Maternal ICU', isAvailable: true },
      { itemName: 'Blood Bank', isAvailable: true },
    ],
    coordinates: { x: 320, y: 50 },
  },
];

/** Deterministic local accessors for synthetic facility records. */
export const getFacilities = (): HealthcareFacility[] => SYNTHETIC_FACILITIES;

export const getFacilityById = (id: string): HealthcareFacility | undefined =>
  SYNTHETIC_FACILITIES.find((facility) => facility.id === id);

export const getFacilitiesByService = (service: string): HealthcareFacility[] => {
  const normalizedService = service.trim().toLocaleLowerCase();
  if (!normalizedService) return [];
  return SYNTHETIC_FACILITIES.filter((facility) =>
    facility.availableServices.some((availableService) =>
      availableService.toLocaleLowerCase().includes(normalizedService)
    ) || facility.diagnosticStock.some((item) =>
      item.itemName.toLocaleLowerCase().includes(normalizedService) && item.isAvailable
    ) || facility.medicationStock.some((item) =>
      item.itemName.toLocaleLowerCase().includes(normalizedService) && item.isAvailable
    )
  );
};
