import React from 'react';
import type { HealthcareFacility } from '../../types';
import { Card, SectionHeader, StatusBadge } from '../common';

const FACILITY_TYPE_LABELS: Record<HealthcareFacility['facilityType'], string> = {
  SUB_CENTER: 'Sub-center',
  PHC: 'Primary Health Centre',
  CHC: 'Community Health Centre',
  DISTRICT_HOSPITAL: 'District Hospital',
};

const AVAILABILITY_LABELS: Record<HealthcareFacility['availability'], string> = {
  AVAILABLE: 'Available · simulated',
  LIMITED: 'Limited · simulated',
  UNAVAILABLE: 'Unavailable · simulated',
};

const AVAILABILITY_VARIANTS: Record<HealthcareFacility['availability'], 'success' | 'warning' | 'critical'> = {
  AVAILABLE: 'success',
  LIMITED: 'warning',
  UNAVAILABLE: 'critical',
};

export interface FacilityCardProps {
  facility: HealthcareFacility;
  className?: string;
  selected?: boolean;
  onSelect?: (facilityId: string) => void;
}

/** Reusable comparison card for synthetic operational facility data. */
export const FacilityCard: React.FC<FacilityCardProps> = ({ facility, className = '', selected = false, onSelect }) => (
  <article aria-labelledby={`facility-${facility.id}`} className="min-w-0">
    <Card
      variant={facility.isRecommended ? 'primary' : 'default'}
      padding="md"
      className={className}
    >
      <header className="flex min-w-0 flex-col gap-space-xs sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id={`facility-${facility.id}`} className="break-words font-headline-sm text-headline-sm font-bold text-on-surface">
            {facility.name}
          </h2>
          <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
            {FACILITY_TYPE_LABELS[facility.facilityType]}
          </p>
        </div>
        <div className="flex flex-wrap gap-space-xs">
          <StatusBadge label={AVAILABILITY_LABELS[facility.availability]} variant={AVAILABILITY_VARIANTS[facility.availability]} />
          {facility.isRecommended && <StatusBadge label="Recommended in demo" variant="primary" icon="star" />}
        </div>
      </header>

      <dl className="mt-space-sm grid grid-cols-2 gap-space-xs rounded-lg bg-surface-container-low p-space-sm sm:grid-cols-3">
        <div>
          <dt className="font-label-sm text-label-sm text-on-surface-variant">Distance</dt>
          <dd className="font-code-sm text-code-sm font-bold text-on-surface">{facility.distanceKm.toFixed(1)} km</dd>
        </div>
        <div>
          <dt className="font-label-sm text-label-sm text-on-surface-variant">Estimated travel</dt>
          <dd className="font-code-sm text-code-sm font-bold text-on-surface">~{facility.estimatedTransitMinutes} min</dd>
        </div>
        {facility.stockConfidence && (
          <div>
            <dt className="font-label-sm text-label-sm text-on-surface-variant">Stock confidence</dt>
            <dd className="font-code-sm text-code-sm font-bold text-on-surface">{facility.stockConfidence}</dd>
          </div>
        )}
      </dl>

      {onSelect && (
        <button
          type="button"
          aria-pressed={selected}
          onClick={() => onSelect(facility.id)}
          className="mt-space-sm min-h-[48px] w-full rounded-lg border border-primary px-space-sm py-2 text-left font-label-md text-label-md font-bold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {selected ? 'Selected referral option' : 'Select this facility'}
        </button>
      )}

      <section className="mt-space-sm" aria-label={`Services at ${facility.name}`}>
        <SectionHeader title="Available services" />
        <ul className="flex flex-wrap gap-space-xs">
          {facility.availableServices.map((service) => (
            <li key={service} className="rounded-full bg-surface-container-high px-space-sm py-1 font-body-sm text-body-sm text-on-surface">{service}</li>
          ))}
        </ul>
      </section>

      {facility.diagnosticStock.length > 0 && (
        <section className="mt-space-sm" aria-label={`Diagnostic availability at ${facility.name}`}>
          <SectionHeader title="Diagnostics & supplies" />
          <ul className="space-y-1">
            {facility.diagnosticStock.slice(0, 3).map((item) => (
              <li key={item.itemName} className="flex min-w-0 items-start justify-between gap-space-xs border-t border-outline-variant/20 pt-1 font-body-sm text-body-sm">
                <span className="min-w-0 break-words text-on-surface">{item.itemName}</span>
                <span className={`shrink-0 font-label-sm text-label-sm font-bold ${item.isAvailable ? 'text-tertiary' : 'text-error'}`}>
                  {item.isAvailable ? 'Listed available' : 'Listed unavailable'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-space-sm border-t border-outline-variant/30 pt-space-sm">
        <p className="font-body-sm text-body-sm text-on-surface-variant">{facility.roadCondition}</p>
        {facility.warningAlert && <p className="mt-1 font-body-sm text-body-sm font-semibold text-error">{facility.warningAlert}</p>}
        <p className="mt-space-xs font-code-xs text-code-xs text-secondary">SYNTHETIC DEMO DATA · AVAILABILITY IS SIMULATED</p>
        {facility.stockConfidence && (
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Stock confidence describes simulated information freshness and confirmation; it is not real-time inventory.
          </p>
        )}
      </footer>
    </Card>
  </article>
);

export default FacilityCard;
