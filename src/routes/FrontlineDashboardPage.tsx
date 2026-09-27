import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CareGapBadge,
  OfflineStatus,
  PatientIdentity,
  PrimaryButton,
  SectionHeader,
  SecondaryButton,
  StatusBadge,
} from '../components/common';
import { useShell } from '../context/ShellContext';
import {
  SYNTHETIC_BENEFICIARIES,
  SYNTHETIC_CARE_GAPS,
  getFacilityById,
  SYNTHETIC_METRICS,
  SYNTHETIC_REFERRALS,
} from '../data/synthetic';
import { DEMO_PATIENT_ID, ROUTE_PATHS } from './paths';
import { createInitialReferralSnapshot, getClosureEvidence, getReferralLifecycleLabel, isJourneyMilestoneComplete } from '../rules/referralLifecycle';
import { evaluateCareGaps } from '../rules/careGapEngine';

const JOURNEY_STAGES = [
  { label: 'SCREEN', milestone: 'SCREENED' },
  { label: 'REFER', milestone: 'REFERRED' },
  { label: 'REACH', milestone: 'REACH_PENDING' },
  { label: 'RECEIVE', milestone: 'RECEIVED' },
  { label: 'CLOSURE', milestone: 'CLOSED' },
] as const;

const FrontlineDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const shell = useShell();
  const sunita = SYNTHETIC_BENEFICIARIES.find(
    (beneficiary) => beneficiary.id === DEMO_PATIENT_ID
  );

  if (!sunita) return null;

  const careGapResults = evaluateCareGaps({ beneficiaries: SYNTHETIC_BENEFICIARIES, careGaps: SYNTHETIC_CARE_GAPS, referrals: SYNTHETIC_REFERRALS, referralLifecycle: shell.referralLifecycle });
  const sunitaCareGaps = careGapResults.filter((result) => result.beneficiary.id === sunita.id);
  const sunitaReferral = SYNTHETIC_REFERRALS.find(
    (referral) => referral.beneficiaryId === sunita.id
  );
  const destinationFacility = sunitaReferral
    ? getFacilityById(sunitaReferral.destinationFacilityId)
    : undefined;
  const referralLifecycle = sunitaReferral
    ? shell.referralLifecycle[sunitaReferral.id] ?? createInitialReferralSnapshot(sunitaReferral)
    : undefined;
  const followUpMetric = SYNTHETIC_METRICS.find(
    (metric) => metric.id === 'field-followups'
  );
  const criticalGapCount = sunitaCareGaps.filter((result) => result.status === 'CONFIRMED').length;
  const awaitingArrivalCount = SYNTHETIC_REFERRALS.filter(
    (referral) => {
      const state = shell.referralLifecycle[referral.id]?.state ?? createInitialReferralSnapshot(referral).state;
      return state === 'REFERRED' || state === 'REACH_PENDING';
    }
  ).length;
  const closurePendingCount = SYNTHETIC_REFERRALS.filter(
    (referral) => shell.referralLifecycle[referral.id]?.state === 'CARE_RECEIVED'
  ).length;
  const closureEvidence = sunitaReferral && referralLifecycle ? getClosureEvidence(referralLifecycle, sunitaReferral.id) : undefined;

  const metrics = [
    {
      label: 'Critical gaps',
      count: criticalGapCount,
      icon: 'crisis_alert',
      variant: 'alert' as const,
      status: 'ACTION REQUIRED',
      statusVariant: 'critical' as const,
      to: ROUTE_PATHS.frontlineCareGaps,
    },
    {
      label: 'Follow-up due',
      count: followUpMetric?.count ?? 0,
      icon: 'pending_actions',
      variant: 'default' as const,
      status: 'DUE',
      statusVariant: 'warning' as const,
      to: ROUTE_PATHS.frontlinePatient(sunita.id),
    },
    {
      label: 'Referrals awaiting arrival',
      count: awaitingArrivalCount,
      icon: 'local_hospital',
      variant: 'default' as const,
      status: 'AWAITING REACH',
      statusVariant: 'primary' as const,
      to: ROUTE_PATHS.frontlineReferral(sunitaReferral?.id ?? ''),
    },
    {
      label: 'Closure pending',
      count: closurePendingCount,
      icon: 'task_alt',
      variant: 'default' as const,
      status: 'PENDING',
      statusVariant: 'neutral' as const,
      to: ROUTE_PATHS.frontlineReferral(sunitaReferral?.id ?? ''),
    },
    {
      label: 'Active referrals',
      count: SYNTHETIC_REFERRALS.filter((referral) => {
        const state = shell.referralLifecycle[referral.id]?.state ?? createInitialReferralSnapshot(referral).state;
        return state !== 'CLOSED' && state !== 'TIMEOUT';
      }).length,
      icon: 'forward_media',
      variant: 'default' as const,
      status: 'TRACKING',
      statusVariant: 'in-transit' as const,
      to: ROUTE_PATHS.frontlineReferral(sunitaReferral?.id ?? ''),
    },
  ];

  const secondaryCases = SYNTHETIC_BENEFICIARIES.filter(
    (beneficiary) => beneficiary.id !== sunita.id
  );

  return (
    <div className="flex w-full flex-col gap-space-md px-margin py-space-sm">
      <OfflineStatus />

      <Card variant="primary" padding="md">
        <div className="flex flex-col gap-space-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className="font-code-xs text-code-xs font-bold uppercase text-primary">
              Frontline Worker
            </span>
            <h1 className="mt-space-xs font-headline-lg text-headline-lg font-bold text-on-surface">
              {sunita.assignedAshaName}
            </h1>
            <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
              {sunita.section} · {sunita.village} rural service area
            </p>
          </div>
          <div className="flex flex-wrap gap-space-xs">
            <StatusBadge label={shell.isOnline ? 'ONLINE' : 'OFFLINE MODE'} variant={shell.isOnline ? 'success' : 'warning'} pulse={shell.isOnline} />
            <StatusBadge label={shell.isOnline ? 'SYNCED' : 'PENDING SYNC'} variant={shell.isOnline ? 'success' : 'warning'} />
          </div>
        </div>
      </Card>

      <section aria-label="Care-gap summary">
        <SectionHeader
          title="Care-Gap Summary"
          subtitle="Synthetic operational counts"
          tag="PROTOTYPE"
        />
        <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-3 lg:grid-cols-5">
          {metrics.map((metric) => (
            <Card key={metric.label} variant={metric.variant} padding="none">
              <Link
                to={metric.to}
                className="flex h-full min-h-[112px] flex-col justify-between gap-space-xs p-space-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                aria-label={`${metric.label}: ${metric.count}. Open destination`}
              >
                <div className="flex items-start justify-between gap-space-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {metric.label}
                  </span>
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    {metric.icon}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-space-xs">
                  <span className="font-code-sm text-code-sm font-bold text-on-surface">
                    {metric.count}
                  </span>
                  <StatusBadge label={metric.status} variant={metric.statusVariant} />
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section aria-label="Priority cases">
        <SectionHeader
          title="Priority Cases"
          subtitle="Review required actions across the rural service area"
          tag={`${secondaryCases.length + 1} SYNTHETIC`}
        />

        <Card variant="alert" padding="md" className="gap-space-sm">
          <div className="flex flex-col gap-space-sm sm:flex-row sm:items-start sm:justify-between">
            <PatientIdentity
              fullName={sunita.fullName}
              initials="SD"
              age={sunita.age}
              gender={sunita.gender}
              syntheticId={sunita.id}
              village={sunita.village}
              assignedAshaName={sunita.assignedAshaName}
            />
            <CareGapBadge label={sunitaCareGaps.length ? 'PRIORITY FOLLOW-UP' : 'EXPECTED STEP RECORDED'} isExpired={sunitaCareGaps.some((gap) => gap.status === 'CONFIRMED')} />
          </div>

          <div className="flex flex-wrap items-center gap-space-xs border-y border-outline-variant/30 py-space-sm">
            <StatusBadge label={sunitaCareGaps.length ? 'CARE GAP ACTIVE' : referralLifecycle?.state === 'CLOSED' ? 'CLOSURE CONFIRMED' : 'EXPECTED STEP RECORDED'} variant={sunitaCareGaps.length ? 'critical' : 'success'} icon={sunitaCareGaps.length ? 'warning' : 'task_alt'} />
            {sunitaReferral && (
              <StatusBadge
                label={`${getReferralLifecycleLabel(referralLifecycle?.state ?? 'REFERRED')} · SIMULATED`}
                variant={referralLifecycle?.state === 'TIMEOUT' ? 'critical' : referralLifecycle?.state === 'REACHED' || referralLifecycle?.state === 'CARE_RECEIVED' || referralLifecycle?.state === 'CLOSED' ? 'success' : 'warning'}
              />
            )}
            <StatusBadge label={sunita.urgencyTier} variant="critical" />
          </div>

          <div className="grid gap-space-xs sm:grid-cols-2">
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Active care gap</span>
              <p className="font-body-sm text-body-sm font-semibold text-on-surface">
                {sunitaCareGaps[0]?.careGap?.title ?? 'No active engine-supported care gap'}
              </p>
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Referral destination</span>
              <p className="font-body-sm text-body-sm font-semibold text-on-surface">
                {destinationFacility?.name ?? 'Not assigned'}
                {sunitaReferral && ` · ${sunitaReferral.id}`}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-surface-container-low p-space-sm">
            <span className="font-label-sm text-label-sm font-semibold text-primary">
              AI-assisted summary
            </span>
            <p className="mt-0.5 font-body-sm text-body-sm text-on-surface">
              The referral is in transit and arrival confirmation is pending.
            </p>
            <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">
              Suggested follow-up: review arrival status and the open care-gap record.
            </p>
          </div>

          <div className="flex flex-col gap-space-xs sm:flex-row">
            <PrimaryButton
              icon="person_search"
              onClick={() => navigate(ROUTE_PATHS.frontlinePatient(sunita.id))}
            >
              Continue Sunita&apos;s Case
            </PrimaryButton>
            <SecondaryButton
              icon="crisis_alert"
              onClick={() => navigate(ROUTE_PATHS.frontlineCareGaps)}
            >
              View Care Gap
            </SecondaryButton>
          </div>
        </Card>

        {secondaryCases.length > 0 && (
          <div className="mt-space-sm grid gap-space-sm md:grid-cols-2">
            {secondaryCases.map((beneficiary) => (
              <Card key={beneficiary.id} variant="default" padding="md">
                <PatientIdentity
                  fullName={beneficiary.fullName}
                  age={beneficiary.age}
                  gender={beneficiary.gender}
                  syntheticId={beneficiary.id}
                  village={beneficiary.village}
                />
                <div className="mt-space-sm flex flex-wrap items-center justify-between gap-space-xs border-t border-outline-variant/30 pt-space-sm">
                  <StatusBadge
                    label={beneficiary.id.endsWith('074') ? 'VERIFICATION PENDING' : 'FOLLOW-UP DUE'}
                    variant="warning"
                  />
                  <button
                    type="button"
                    className="min-h-[48px] px-space-sm font-label-md text-label-md font-bold text-primary"
                    onClick={() => navigate(ROUTE_PATHS.frontlinePatient(beneficiary.id))}
                  >
                    View patient
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section aria-label="Care journey">
        <SectionHeader
          title="Care Journey"
          subtitle={`Referral progress · ${getReferralLifecycleLabel(referralLifecycle?.state ?? 'REFERRED')} simulated state`}
          tag="SCREEN → CLOSURE"
        />
        <Card variant="default" padding="md">
          <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-5">
            {JOURNEY_STAGES.map((stage, index) => {
              const milestone = sunitaReferral?.milestones.find(
                (item) => item.milestone === stage.milestone
              );
              const isReach = stage.milestone === 'REACH_PENDING';
              const isReceive = stage.milestone === 'RECEIVED';
              const isPendingArrival = isReach && referralLifecycle?.state === 'REACH_PENDING';
              const isTimedOut = isReach && referralLifecycle?.state === 'TIMEOUT';
              const isComplete = isReach
                ? Boolean(referralLifecycle && isJourneyMilestoneComplete(referralLifecycle.state, 'REACH_PENDING'))
                : isReceive
                  ? Boolean(referralLifecycle && isJourneyMilestoneComplete(referralLifecycle.state, 'RECEIVED'))
                  : stage.milestone === 'CLOSED'
                    ? Boolean(referralLifecycle && isJourneyMilestoneComplete(referralLifecycle.state, 'CLOSED'))
                    : milestone?.completed ?? false;
              const isCurrent = isPendingArrival || isTimedOut || (isReceive && referralLifecycle?.state === 'REACHED') || (stage.milestone === 'CLOSED' && referralLifecycle?.state === 'CARE_RECEIVED');
              return (
                <div
                  key={stage.label}
                  className="flex min-w-0 items-center gap-space-xs"
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-code-xs text-code-xs font-bold ${
                    isComplete
                      ? 'bg-tertiary text-on-tertiary'
                      : isPendingArrival || isTimedOut
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {isComplete ? '✓' : index + 1}
                  </span>
                  <span className={`min-w-0 font-code-xs text-code-xs font-bold ${isCurrent ? 'text-error' : 'text-on-surface-variant'}`}>
                    {stage.label}
                    {isPendingArrival && <span className="block font-medium">PENDING</span>}
                    {isTimedOut && <span className="block font-medium">TIMED OUT · SIMULATED</span>}
                    {isReceive && referralLifecycle?.state === 'REACHED' && <span className="block font-medium">NEXT</span>}
                    {isReceive && referralLifecycle?.state === 'CARE_RECEIVED' && <span className="block font-medium">SIMULATED</span>}
                    {stage.milestone === 'CLOSED' && referralLifecycle?.state === 'CARE_RECEIVED' && <span className="block font-medium">NEXT</span>}
                    {stage.milestone === 'CLOSED' && referralLifecycle?.state === 'CLOSED' && <span className="block font-medium">CONFIRMED</span>}
                  </span>
                </div>
              );
            })}
          </div>
          {sunitaReferral && (
            <div className="mt-space-md flex flex-col gap-space-xs border-t border-outline-variant/30 pt-space-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="font-code-xs text-code-xs text-on-surface-variant">
                {sunitaReferral.id} · {destinationFacility?.name}
              </span>
              <StatusBadge
                label={`${getReferralLifecycleLabel(referralLifecycle?.state ?? 'REFERRED')} · SIMULATED`}
                variant={referralLifecycle?.state === 'TIMEOUT' ? 'critical' : referralLifecycle?.state === 'REACHED' || referralLifecycle?.state === 'CARE_RECEIVED' || referralLifecycle?.state === 'CLOSED' ? 'success' : 'warning'}
              />
            </div>
          )}
          {referralLifecycle?.state === 'CLOSED' && closureEvidence && <p role="status" className="mt-space-sm rounded-lg bg-tertiary-fixed p-space-sm font-body-sm text-body-sm text-on-tertiary-fixed-variant">CLOSURE CONFIRMED · SIMULATED. Evidence recorded for expected care step: {closureEvidence.expectedStep}. This does not represent a clinical outcome.</p>}
          {referralLifecycle?.state === 'CARE_RECEIVED' && <p role="status" className="mt-space-sm rounded-lg bg-surface-container-low p-space-sm font-body-sm text-body-sm text-on-surface">CARE RECEIVED · SIMULATED. Closure is the next facility step.</p>}
        </Card>
      </section>

      <section aria-label="Frontline actions">
        <SectionHeader title="Frontline Actions" tag="QUICK ACCESS" />
        <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-4">
          <PrimaryButton icon="clinical_notes" onClick={() => navigate(ROUTE_PATHS.frontlineScreening(sunita.id))}>
            New Screening
          </PrimaryButton>
          <SecondaryButton icon="crisis_alert" onClick={() => navigate(ROUTE_PATHS.frontlineCareGaps)}>
            View Care Gaps
          </SecondaryButton>
          <SecondaryButton icon="local_hospital" onClick={() => navigate(ROUTE_PATHS.frontlineReferral(sunitaReferral?.id ?? ''))}>
            Referrals
          </SecondaryButton>
          <SecondaryButton icon="event_upcoming" onClick={() => navigate(ROUTE_PATHS.frontlinePatient(sunita.id))}>
            Follow-up
          </SecondaryButton>
        </div>
      </section>
    </div>
  );
};

export default FrontlineDashboardPage;
