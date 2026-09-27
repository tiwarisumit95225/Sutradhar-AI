import React from 'react';
import { Card, OfflineStatus, SectionHeader, StatusBadge } from '../components/common';
import FacilityCard from '../components/facility/FacilityCard';
import { getFacilities } from '../data/synthetic/facilities';

const FacilityDirectoryPage: React.FC = () => {
  const facilities = getFacilities();

  return (
    <div className="flex w-full flex-col gap-space-sm px-margin py-space-sm">
      <OfflineStatus />
      <section aria-labelledby="facility-directory-title">
        <SectionHeader
          title="Facility Directory"
          subtitle="Compare facilities using synthetic prototype data."
          tag="DEMO DATA"
        />
        <h1 id="facility-directory-title" className="mb-space-xs font-headline-md text-headline-md font-bold text-on-surface">
          Facilities in this demo
        </h1>
        <Card variant="inset" padding="sm" className="mb-space-sm">
          <div className="flex flex-wrap items-center gap-space-xs">
            <StatusBadge label="Simulated availability" variant="warning" />
            <p className="min-w-0 flex-1 font-body-sm text-body-sm text-on-surface-variant">
              Distances, travel times, services, and stock confidence are demonstration values, not live facility information.
            </p>
          </div>
        </Card>
        <div className="grid min-w-0 grid-cols-1 gap-space-sm lg:grid-cols-2">
          {facilities.map((facility) => <FacilityCard key={facility.id} facility={facility} />)}
        </div>
      </section>
    </div>
  );
};

export default FacilityDirectoryPage;
