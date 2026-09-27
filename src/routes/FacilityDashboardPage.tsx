import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, OfflineStatus, PatientIdentity, ReferralStatusBadge, SectionHeader, SecondaryButton, StatusBadge } from '../components/common';
import HandshakeVerificationForm from '../components/facility/HandshakeVerificationForm';
import { useShell } from '../context/ShellContext';
import { SYNTHETIC_BENEFICIARIES, SYNTHETIC_CARE_GAPS } from '../data/synthetic';
import { createInitialReferralSnapshot, getReferralLifecycleLabel, hasHandshakeVerification } from '../rules/referralLifecycle';
import { evaluateCareGaps } from '../rules/careGapEngine';
import { matchesFacilityReferralFilter, resolveFacilityContext, type FacilityReferralFilter } from './facilityDashboardData';
import { ROUTE_PATHS } from './paths';

const FILTERS: { id: FacilityReferralFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'PENDING', label: 'Reach pending' },
  { id: 'REACHED', label: 'Reach verified' },
  { id: 'ACTION', label: 'Action needed' },
];

const FacilityDashboardPage: React.FC = () => {
  const shell = useShell();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FacilityReferralFilter>('ALL');
  const facility = resolveFacilityContext();
  const incoming = facility ? shell.referrals.filter((referral) => referral.destinationFacilityId === facility.id) : [];
  const records = incoming.map((referral) => {
    const patient = SYNTHETIC_BENEFICIARIES.find((item) => item.id === referral.beneficiaryId);
    const lifecycle = shell.referralLifecycle[referral.id] ?? createInitialReferralSnapshot(referral);
    return { referral, patient, lifecycle, handshakeVerified: hasHandshakeVerification(referral, lifecycle) };
  }).filter((item) => item.patient);
  const careGaps = useMemo(() => evaluateCareGaps({
    beneficiaries: SYNTHETIC_BENEFICIARIES,
    careGaps: SYNTHETIC_CARE_GAPS,
    referrals: shell.referrals,
    referralLifecycle: shell.referralLifecycle,
    followUps: shell.followUps,
  }), [shell.referralLifecycle, shell.referrals, shell.followUps]);
  const actionIds = new Set(careGaps.map((item) => item.referral?.id).filter(Boolean));
  const visible = records.filter((item) => filter === 'ACTION'
    ? item.lifecycle.state === 'TIMEOUT' || item.lifecycle.state === 'CARE_RECEIVED' || actionIds.has(item.referral.id)
    : matchesFacilityReferralFilter(item.lifecycle.state, filter));
  const pendingCount = records.filter(({ lifecycle }) => lifecycle.state === 'REFERRED' || lifecycle.state === 'REACH_PENDING').length;
  const reachedCount = records.filter(({ lifecycle }) => lifecycle.state === 'REACHED' || lifecycle.state === 'CARE_RECEIVED' || lifecycle.state === 'CLOSED').length;
  const actionCount = records.filter(({ referral, lifecycle }) => lifecycle.state === 'TIMEOUT' || lifecycle.state === 'CARE_RECEIVED' || (actionIds.has(referral.id) && lifecycle.state !== 'CLOSED')).length;

  if (!facility) return (
    <div className="flex w-full flex-col gap-space-sm px-margin py-space-sm">
      <OfflineStatus />
      <Card padding="md"><SectionHeader title="Facility / Clinician" tag="SYNTHETIC DATA" /><h1 className="font-headline-md text-headline-md font-bold text-on-surface">Facility not found</h1><p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">The referral data does not resolve to a facility in the shared synthetic facility dataset.</p></Card>
    </div>
  );

  const metrics: { label: string; value: number; filter: FacilityReferralFilter; detail: string }[] = [
    { label: 'Incoming Referrals', value: records.length, filter: 'ALL', detail: 'All records addressed to this facility' },
    { label: 'Reach Pending', value: pendingCount, filter: 'PENDING', detail: 'Awaiting arrival confirmation' },
    { label: 'Reach Verified', value: reachedCount, filter: 'REACHED', detail: 'Simulated arrival state' },
    { label: 'Action Needed', value: actionCount, filter: 'ACTION', detail: 'Timeout or engine-supported unresolved referral' },
  ];

  return (
    <div className="flex w-full flex-col gap-space-md px-margin py-space-sm">
      <OfflineStatus />
      <header className="flex flex-col gap-space-xs">
        <SectionHeader title="Facility / Clinician" subtitle="Receiving facility workspace" tag="PROTOTYPE" />
        <h1 className="break-words font-headline-lg text-headline-lg font-bold text-on-surface">{facility.name}</h1>
        <div className="flex flex-wrap items-center gap-space-xs">
          <StatusBadge label={facility.facilityType.replace('_', ' ')} variant="primary" />
          <StatusBadge label="SYNTHETIC FACILITY" variant="neutral" />
          <StatusBadge label={shell.isOnline ? 'ONLINE · LOCAL DEMO' : 'OFFLINE · LOCAL DEMO'} variant={shell.isOnline ? 'success' : 'warning'} />
          <StatusBadge label="CAPACITY NOT LIVE" variant="neutral" />
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Facility and referral values are synthetic. Availability and integration signals are simulated.</p>
      </header>

      <section aria-labelledby="facility-metrics-heading">
        <SectionHeader title="Referral Overview" tag={`${records.length} INBOUND`} />
        <h2 id="facility-metrics-heading" className="sr-only">Referral overview metrics</h2>
        <div className="grid grid-cols-2 gap-space-xs sm:grid-cols-4">
          {metrics.map((metric) => (
            <button key={metric.label} type="button" aria-pressed={filter === metric.filter} onClick={() => setFilter(metric.filter)} className={`min-h-[88px] min-w-0 rounded-xl border p-space-sm text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${filter === metric.filter ? 'border-primary bg-primary-fixed' : 'border-outline-variant/40 bg-surface-container-lowest'}`}>
              <span className="block font-label-sm text-label-sm font-semibold text-on-surface-variant">{metric.label}</span>
              <span className="block font-headline-md text-headline-md font-bold text-on-surface">{metric.value}</span>
              <span className="block font-code-xs text-code-xs text-on-surface-variant">{metric.detail}</span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="incoming-referrals-heading">
        <SectionHeader title="Incoming Referrals" subtitle="Referral records assigned to this synthetic facility" tag={`${visible.length} SHOWN`} />
        <h2 id="incoming-referrals-heading" className="sr-only">Incoming referrals</h2>
        <div className="mb-space-sm flex flex-wrap gap-space-xs" aria-label="Filter referrals">
          {FILTERS.map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} className={`min-h-[48px] rounded-lg px-space-sm font-label-sm text-label-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${filter === item.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'}`}>{item.label}</button>)}
        </div>
        {visible.length === 0 ? <Card padding="md"><h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">No referrals in this view</h3><p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">No synthetic referrals match the selected lifecycle filter.</p></Card> : (
          <div className="flex flex-col gap-space-sm">
            {visible.map(({ referral, patient, lifecycle, handshakeVerified }) => patient && (
              <Card key={referral.id} variant={lifecycle.state === 'TIMEOUT' ? 'alert' : lifecycle.state === 'REACHED' || lifecycle.state === 'CARE_RECEIVED' || lifecycle.state === 'CLOSED' ? 'success' : 'default'} padding="md" className="gap-space-sm">
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-space-xs">
                  <span className="break-all font-code-sm text-code-sm font-bold text-primary">{referral.id}</span>
                  <ReferralStatusBadge status={lifecycle.state === 'REACHED' || lifecycle.state === 'CARE_RECEIVED' || lifecycle.state === 'CLOSED' ? 'ARRIVED' : lifecycle.state === 'TIMEOUT' ? 'AWAITING_ARRIVAL' : lifecycle.state === 'REFERRED' ? 'DISPATCHED' : 'IN_TRANSIT'} label={lifecycle.state === 'REACHED' ? 'REACH VERIFIED · SIMULATED' : `${getReferralLifecycleLabel(lifecycle.state)} · SIMULATED`} />
                  {shell.followUps[referral.id] && <StatusBadge label={`FOLLOW-UP ${shell.followUps[referral.id].status.replace('_', ' ')} · SIMULATED`} variant={shell.followUps[referral.id].status === 'COMPLETED' ? 'success' : 'warning'} />}
                </div>
                <PatientIdentity fullName={patient.fullName} age={patient.age} gender={patient.gender} syntheticId={patient.id} village={patient.village} assignedAshaName={patient.assignedAshaName} />
                <dl className="grid min-w-0 grid-cols-1 gap-space-xs rounded-lg bg-surface-container-low p-space-sm sm:grid-cols-2">
                  <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Referral purpose</dt><dd className="break-words font-body-sm text-body-sm text-on-surface">{referral.clinicalIndication}</dd></div>
                  <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Destination</dt><dd className="font-body-sm text-body-sm font-semibold text-on-surface">{facility.name}</dd></div>
                  <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Priority</dt><dd className="font-body-sm text-body-sm text-on-surface">{patient.urgencyTier}</dd></div>
                  <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Handshake</dt><dd className="font-body-sm text-body-sm text-on-surface">{handshakeVerified ? 'Credentials checked in this synthetic session' : lifecycle.state === 'REACHED' || lifecycle.state === 'CARE_RECEIVED' || lifecycle.state === 'CLOSED' ? 'Reach simulated; handshake credentials not checked' : lifecycle.state === 'TIMEOUT' ? 'Not verified · referral timed out' : 'Issued · not verified'}</dd></div>
                  {referral.milestones.find((milestone) => milestone.milestone === 'REFERRED')?.timestamp && <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Referred</dt><dd className="font-body-sm text-body-sm text-on-surface">{referral.milestones.find((milestone) => milestone.milestone === 'REFERRED')?.timestamp}</dd></div>}
                </dl>
                <div className="flex flex-col gap-space-sm">
                  <SecondaryButton icon="open_in_new" onClick={() => navigate(ROUTE_PATHS.facilityReferral(referral.id))}>View Referral Details</SecondaryButton>
                  {lifecycle.state !== 'TIMEOUT' && !handshakeVerified && <HandshakeVerificationForm compact referral={referral} lifecycleState={lifecycle.state} />}
                  {handshakeVerified && <StatusBadge label="HANDSHAKE VERIFIED · SIMULATED" variant="success" />}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <p className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-space-sm font-code-xs text-code-xs font-semibold text-secondary">SYNTHETIC DATA · SIMULATED INTEGRATION · PROTOTYPE · NO LIVE CAPACITY OR ATTENDANCE SIGNALS</p>
    </div>
  );
};

export default FacilityDashboardPage;
