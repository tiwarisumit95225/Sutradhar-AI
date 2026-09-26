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
    specialistsOnDuty: ['Meena Bai (ASHA)', 'Kavita Sharma (ANM)'],
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
    warningAlert: 'CBC No Reagents • Magnesium Sulfate Out of Stock',
    specialistsOnDuty: ['Medical Officer (General OPD)'],
    diagnosticStock: [
      { itemName: 'Magnesium Sulfate', isAvailable: false, notes: 'Stock Depleted since 22 Sep' },
      { itemName: 'CBC Analyzer Reagents', isAvailable: false, notes: 'Stock Out' },
      { itemName: 'Obstetric Ultrasound', isAvailable: false, notes: 'Sonologist on leave' },
    ],
    coordinates: { x: 160, y: 90 },
  },
  {
    id: 'chc-bikrampur',
    name: 'CHC B Bikrampur',
    facilityType: 'CHC',
    distanceKm: 12.4,
    estimatedTransitMinutes: 35,
    roadCondition: 'Dry Metalled Highway Corridor',
    isRecommended: true,
    recommendationReason: 'Active Emergency Obstetric Care • MgSO4 In Stock • Sonologist on Duty',
    specialistsOnDuty: [
      'Dr. Arvind Swaminathan (MO In-Charge)',
      'Dr. M. Verma (Obstetrician)',
      'Sister Saroj (Staff Nurse L&D)',
    ],
    diagnosticStock: [
      { itemName: 'Magnesium Sulfate', isAvailable: true, notes: 'Ample supply (48 vials)' },
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
    recommendationReason: 'Tertiary Care Backup (High Travel Burden)',
    specialistsOnDuty: ['Full Multi-Specialty Department'],
    diagnosticStock: [
      { itemName: 'Tertiary NICU / Maternal ICU', isAvailable: true },
      { itemName: 'Blood Bank', isAvailable: true },
    ],
    coordinates: { x: 320, y: 50 },
  },
];
