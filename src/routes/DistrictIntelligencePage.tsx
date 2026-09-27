import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiAssistCard, Card, OfflineStatus, PatientIdentity, SectionHeader, SecondaryButton, StatusBadge } from '../components/common';
import { useShell } from '../context/ShellContext';
import { SYNTHETIC_BENEFICIARIES, SYNTHETIC_CARE_GAPS, getFacilities } from '../data/synthetic';
import { evaluateCareGaps } from '../rules/careGapEngine';
import { aggregateDistrictIntelligence } from '../rules/districtIntelligence';
import { createInitialReferralSnapshot, getReferralLifecycleLabel } from '../rules/referralLifecycle';
import { ROUTE_PATHS } from './paths';
import { runAiAssist } from '../ai/aiAssist';

const FLOW_STEPS = ['EXPECTED CARE', 'GAP DETECTED', 'FOLLOW-UP / ACTION', 'RE-REFERRAL', 'CLOSURE'];

const DistrictIntelligencePage: React.FC = () => {
  const shell = useShell();
  const navigate = useNavigate();
  const engineResults = useMemo(() => evaluateCareGaps({
    beneficiaries: SYNTHETIC_BENEFICIARIES,
    careGaps: SYNTHETIC_CARE_GAPS,
    referrals: shell.referrals,
    referralLifecycle: shell.referralLifecycle,
    followUps: shell.followUps,
  }), [shell.referrals, shell.referralLifecycle, shell.followUps]);
  const district = useMemo(() => aggregateDistrictIntelligence({
    results: engineResults,
    referrals: shell.referrals,
    referralLifecycle: shell.referralLifecycle,
    followUps: shell.followUps,
    facilities: getFacilities(),
  }), [engineResults, shell.referrals, shell.referralLifecycle, shell.followUps]);
  const areaLabels = [...new Set(SYNTHETIC_BENEFICIARIES.flatMap((item) => [item.village, item.section]))].join(' · ');

  const metrics = [
    { label: 'Active Care Gaps', value: district.summary.activeCareGaps, basis: 'Current CARE_GAP rows from Care-Gap Engine.' },
    { label: 'Reach Gaps', value: district.summary.reachGaps, basis: 'Distinct cases with an engine-reported arrival gap.' },
    { label: 'Follow-up Required', value: district.summary.followUpRequired, basis: 'Latest referral timed out; follow-up not started.' },
    { label: 'Current Referrals', value: district.summary.currentReferrals, basis: 'Latest non-terminal referral per beneficiary.' },
    { label: 'Re-referrals', value: district.summary.reReferralEvents, basis: 'Historical creation events in this session.' },
    { label: 'Closure Pending', value: district.summary.closurePending, basis: 'Latest referral is CARE_RECEIVED and awaits closure.' },
  ];
  const districtAssist = runAiAssist({
    kind: 'DISTRICT_SUMMARY',
    activeCareGaps: district.summary.activeCareGaps,
    reachGaps: district.summary.reachGaps,
    followUpRequired: district.summary.followUpRequired,
    sourceIds: ['DISTRICT_AGGREGATE', ...district.reasons.map((item) => item.reasonCode)],
  }, { isOnline: shell.isOnline });

  return (
    <div className="flex w-full flex-col gap-space-md px-margin py-space-sm">
      <OfflineStatus />
      <header className="flex flex-col gap-space-xs">
        <SectionHeader title="District Care-Gap Intelligence" subtitle="Deterministic operational aggregation · no predictive analytics" tag="SYNTHETIC DATA" />
        <div className="flex flex-wrap items-center justify-between gap-space-xs">
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">District Care-Gap Intelligence</h1>
          <StatusBadge label="SIMULATED OPERATIONAL VIEW" variant="primary" />
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant"><strong>Represented synthetic area:</strong> {areaLabels || 'No area labels available'}. District boundaries are not represented in the demo dataset.</p>
      </header>

      <AiAssistCard title="AI-ASSISTED DISTRICT SUMMARY" result={districtAssist} />

      <section aria-labelledby="district-metrics-heading">
        <SectionHeader title="Operational Overview" subtitle="Counts are derived from current shared session data" tag="CURRENT + SESSION EVENTS" />
        <h2 id="district-metrics-heading" className="sr-only">District operational metrics</h2>
        <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => <Card key={metric.label} padding="md" className="min-w-0 gap-1">
            <h3 className="font-label-md text-label-md font-semibold text-on-surface-variant">{metric.label}</h3>
            <p className="font-headline-lg text-headline-lg font-bold text-on-surface" aria-label={`${metric.label}: ${metric.value}`}>{metric.value}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{metric.basis}</p>
            <p className="font-code-xs text-code-xs text-secondary">SOURCE: CARE-GAP ENGINE + SHARED SESSION</p>
          </Card>)}
        </div>
      </section>

      <section aria-labelledby="journey-stage-heading">
        <SectionHeader title="Care Journey Stage Breakdown" subtitle="Distinct cases represented by current engine results; zero means no matching synthetic engine case" tag="SCREEN → CLOSURE" />
        <h2 id="journey-stage-heading" className="sr-only">Care journey stage breakdown</h2>
        <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2 xl:grid-cols-5">
          {district.stages.map((item) => <Card key={item.stage} padding="md" className="min-w-0 gap-space-xs">
            <div className="flex items-center justify-between gap-space-xs"><h3 className="font-label-md text-label-md font-bold text-primary">{item.stage}</h3><StatusBadge label={`${item.count} CASE${item.count === 1 ? '' : 'S'}`} variant={item.count ? 'warning' : 'neutral'} /></div>
            <p className="break-words font-body-sm text-body-sm text-on-surface-variant">{item.description}</p>
            {item.count > 0 && <button type="button" className="min-h-[48px] self-start font-label-sm text-label-sm font-semibold text-primary underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" onClick={() => document.getElementById('district-cases')?.scrollIntoView({ behavior: 'smooth' })}>Inspect related cases</button>}
          </Card>)}
        </div>
      </section>

      <section aria-labelledby="reason-heading">
        <SectionHeader title="Engine Reasons" subtitle="Distinct current synthetic cases by reason code" tag={`${district.reasons.length} REASONS`} />
        <h2 id="reason-heading" className="sr-only">Care-Gap Engine reasons</h2>
        {district.reasons.length === 0 ? <Card padding="md"><p className="font-body-sm text-body-sm text-on-surface-variant">No reason codes are present in current engine results.</p></Card> : (
          <div className="grid grid-cols-1 gap-space-sm lg:grid-cols-2">
            {district.reasons.map((item) => <Card key={item.reasonCode} padding="md" className="min-w-0 gap-space-xs">
              <div className="flex flex-wrap items-center justify-between gap-space-xs"><h3 className="break-all font-code-sm text-code-sm font-bold text-primary">{item.reasonCode}</h3><StatusBadge label={`${item.count} CASE${item.count === 1 ? '' : 'S'}`} variant="warning" /></div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{item.interpretation}</p>
              <p className="font-code-xs text-code-xs text-secondary">SOURCE: CARE-GAP ENGINE · NO PERCENTAGES</p>
            </Card>)}
          </div>
        )}
      </section>

      <section aria-labelledby="flow-heading">
        <SectionHeader title="Operational Care-Gap Flow" subtitle="Conceptual path; individual cases may stop or branch at different steps" tag="ILLUSTRATIVE" />
        <h2 id="flow-heading" className="sr-only">Conceptual operational care-gap flow</h2>
        <Card padding="md">
          <ol className="grid grid-cols-1 gap-space-xs sm:grid-cols-5">
            {FLOW_STEPS.map((step, index) => <li key={step} className="flex min-w-0 items-center gap-space-xs rounded-lg bg-surface-container-low p-space-sm">
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container font-code-xs text-code-xs font-bold text-primary">{index + 1}</span>
              <span className="break-words font-code-xs text-code-xs font-bold text-on-surface">{step}</span>
            </li>)}
          </ol>
        </Card>
      </section>

      <section aria-labelledby="district-actions-heading">
        <SectionHeader title="Operational Action Categories" subtitle="Current follow-up / review states and historical session activity" tag="HUMAN REVIEW" />
        <h2 id="district-actions-heading" className="sr-only">Operational action categories</h2>
        <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2 xl:grid-cols-3">
          {district.actions.map((action) => <Card key={action.label} padding="md" className="min-w-0 gap-space-xs">
            <div className="flex flex-wrap items-center justify-between gap-space-xs"><h3 className="font-label-md text-label-md font-bold text-on-surface">{action.label}</h3><StatusBadge label={String(action.count)} variant={action.count ? 'warning' : 'neutral'} /></div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{action.detail}</p>
            {action.label === 'RE-REFERRAL ACTIVITY' && <p className="font-code-xs text-code-xs text-secondary">HISTORICAL EVENTS · CURRENT SESSION</p>}
          </Card>)}
        </div>
      </section>

      <section aria-labelledby="facility-area-heading">
        <SectionHeader title="Facility / Area Overview" subtitle="Facility counts use represented referrals and engine gaps; no live capacity or geographic inference" tag={`${district.facilities.length} FACILITIES`} />
        <h2 id="facility-area-heading" className="sr-only">Facility and area overview</h2>
        <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
          {district.facilities.map((item) => <Card key={item.facility.id} padding="md" className="min-w-0 gap-space-xs">
            <h3 className="break-words font-headline-sm text-headline-sm font-bold text-on-surface">{item.facility.name}</h3>
            <dl className="grid grid-cols-1 gap-space-xs rounded-lg bg-surface-container-low p-space-sm">
              <div className="flex justify-between gap-space-xs"><dt className="font-label-sm text-label-sm text-on-surface-variant">Active engine gaps</dt><dd className="font-code-sm text-code-sm font-bold text-on-surface">{item.activeGaps}</dd></div>
              <div className="flex justify-between gap-space-xs"><dt className="font-label-sm text-label-sm text-on-surface-variant">Current referrals</dt><dd className="font-code-sm text-code-sm font-bold text-on-surface">{item.currentReferrals}</dd></div>
              <div className="flex justify-between gap-space-xs"><dt className="font-label-sm text-label-sm text-on-surface-variant">Follow-up required / in progress</dt><dd className="font-code-sm text-code-sm font-bold text-on-surface">{item.followUps}</dd></div>
            </dl>
          </Card>)}
        </div>
      </section>

      <section id="district-cases" aria-labelledby="district-cases-heading" className="scroll-mt-4">
        <SectionHeader title="Cases for Operational Review" subtitle="One row per synthetic beneficiary; historical gaps and the latest referral are shown separately" tag={`${district.cases.length} CASES`} />
        <h2 id="district-cases-heading" className="sr-only">Cases for operational review</h2>
        {district.cases.length === 0 ? <Card variant="success" padding="md"><h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">No active care gaps in synthetic data</h3><p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">No engine results or recovery events are available for district review.</p></Card> : <div className="flex flex-col gap-space-sm">
          {district.cases.map((item) => {
            const lifecycle = item.currentReferral && (shell.referralLifecycle[item.currentReferral.id] ?? createInitialReferralSnapshot(item.currentReferral));
            return <Card key={item.beneficiaryId} padding="md" className="min-w-0 gap-space-sm">
              <PatientIdentity fullName={item.fullName} syntheticId={item.beneficiaryId} village={item.village} assignedAshaName={SYNTHETIC_BENEFICIARIES.find((person) => person.id === item.beneficiaryId)?.assignedAshaName} />
              <div className="flex flex-wrap gap-space-xs"><StatusBadge label={`${item.gapResults.length} ACTIVE ENGINE GAP${item.gapResults.length === 1 ? '' : 'S'}`} variant={item.gapResults.length ? 'critical' : 'neutral'} />{lifecycle && <StatusBadge label={`CURRENT REFERRAL · ${getReferralLifecycleLabel(lifecycle.state)}`} variant={lifecycle.state === 'TIMEOUT' ? 'critical' : lifecycle.state === 'CLOSED' ? 'success' : 'warning'} />}{item.followUp && <StatusBadge label={`FOLLOW-UP · ${item.followUp.status.replace('_', ' ')}`} variant={item.followUp.status === 'COMPLETED' ? 'success' : 'warning'} />}</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Area: {item.section} · {item.facilityName ?? 'Facility not represented'} · {item.currentReferral?.id ?? 'No current referral'}</p>
              {item.currentReferral?.sourceReferralId && <p className="font-body-sm text-body-sm text-on-surface-variant">Historical referral: {item.currentReferral.sourceReferralId} · prior attempt remains in history</p>}
              {item.gapResults.map((result) => <div key={result.id} className="rounded-lg bg-surface-container-low p-space-sm"><p className="font-label-sm text-label-sm font-semibold text-on-surface">{result.careGap?.title ?? result.expectedStep}</p><p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{result.reasonCode} · {result.actualState}</p><p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">Why: {result.explanation}</p></div>)}
              <div className="flex flex-col gap-space-xs sm:flex-row">
                <SecondaryButton icon="person_search" onClick={() => navigate(ROUTE_PATHS.frontlinePatient(item.beneficiaryId))}>Open Patient Profile</SecondaryButton>
                {item.currentReferral && <SecondaryButton icon="open_in_new" onClick={() => navigate(ROUTE_PATHS.frontlineReferral(item.currentReferral!.id))}>Open Current Referral</SecondaryButton>}
              </div>
            </Card>;
          })}
        </div>}
      </section>

      <p className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-space-sm font-code-xs text-code-xs font-semibold text-secondary">SYNTHETIC DATA · SIMULATED OPERATIONAL VIEW · DETERMINISTIC AGGREGATION · NOT GOVERNMENT STATISTICS</p>
    </div>
  );
};

export default DistrictIntelligencePage;
