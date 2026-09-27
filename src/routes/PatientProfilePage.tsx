import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  AiAssistCard,
  CareGapBadge,
  OfflineStatus,
  PatientIdentity,
  PrimaryButton,
  SectionHeader,
  SecondaryButton,
  StatusBadge,
} from '../components/common';
import {
  SYNTHETIC_BENEFICIARIES,
  SYNTHETIC_CARE_GAPS,
  getFacilityById,
} from '../data/synthetic';
import { getCareGapsForBeneficiary } from '../rules/careGapEngine';
import { createInitialReferralSnapshot, getClosureEvidence, getNextReferralStep, getReferralLifecycleLabel, isJourneyMilestoneComplete } from '../rules/referralLifecycle';
import { useShell } from '../context/ShellContext';
import { ROUTE_PATHS } from './paths';
import FollowUpRecoveryPanel from '../components/referral/FollowUpRecoveryPanel';
import { runAiAssist } from '../ai/aiAssist';

const JOURNEY_STAGES = [
  { label: 'SCREEN', milestone: 'SCREENED' },
  { label: 'REFER', milestone: 'REFERRED' },
  { label: 'REACH', milestone: 'REACH_PENDING' },
  { label: 'RECEIVE', milestone: 'RECEIVED' },
  { label: 'CLOSURE', milestone: 'CLOSED' },
] as const;

const PatientNotFound: React.FC<{ patientId: string | undefined }> = ({ patientId }) => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col gap-space-md px-margin py-space-sm">
      <OfflineStatus />
      <Card variant="default" padding="md">
        <SectionHeader title="Patient Profile" tag="NOT FOUND" />
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
          Patient not found
        </h1>
        <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">
          No synthetic beneficiary record matches this patient ID.
        </p>
        {patientId && (
          <div className="mt-space-sm rounded-lg bg-surface-container-low p-space-sm">
            <span className="block font-label-sm text-label-sm text-on-surface-variant">
              Requested patient ID
            </span>
            <span className="font-code-sm text-code-sm text-on-surface">{patientId}</span>
          </div>
        )}
        <SecondaryButton
          icon="arrow_back"
          className="mt-space-md"
          onClick={() => navigate(ROUTE_PATHS.frontlineDashboard)}
        >
          Back to Frontline Dashboard
        </SecondaryButton>
      </Card>
    </div>
  );
};

const PatientProfilePage: React.FC = () => {
  const { patientId } = useParams<'patientId'>();
  const navigate = useNavigate();
  const shell = useShell();
  const patient = SYNTHETIC_BENEFICIARIES.find((item) => item.id === patientId);

  if (!patient) return <PatientNotFound patientId={patientId} />;

  const patientReferrals = shell.referrals.filter((record) => record.beneficiaryId === patient.id);
  const referral = patientReferrals[patientReferrals.length - 1];
  const lifecycle = referral
    ? shell.referralLifecycle[referral.id] ?? createInitialReferralSnapshot(referral)
    : undefined;
  const [activeCareGapResult] = getCareGapsForBeneficiary({
    beneficiaries: SYNTHETIC_BENEFICIARIES,
    careGaps: SYNTHETIC_CARE_GAPS,
    referrals: shell.referrals,
    referralLifecycle: shell.referralLifecycle,
    followUps: shell.followUps,
  }, patient.id);
  const activeCareGap = activeCareGapResult?.careGap;
  const facility = referral ? getFacilityById(referral.destinationFacilityId) : undefined;
  const currentMilestoneLabel = lifecycle ? getNextReferralStep(lifecycle.state) : undefined;
  const closureEvidence = referral && lifecycle ? getClosureEvidence(lifecycle, referral.id) : undefined;
  const referredAt = referral?.milestones.find(
    (milestone) => milestone.milestone === 'REFERRED'
  )?.timestamp;
  const referralRoute = referral
    ? ROUTE_PATHS.frontlineReferral(referral.id)
    : ROUTE_PATHS.frontlineCareGaps;
  const timelineEvents = activeCareGap?.explanation.evidenceTrail ?? [];
  const patientSummary = runAiAssist({
    kind: 'PATIENT_SUMMARY',
    patientId: patient.id,
    ...(lifecycle ? { lifecycleState: lifecycle.state } : {}),
    ...(activeCareGapResult ? { expectedStep: activeCareGapResult.expectedStep } : {}),
    currentState: activeCareGapResult?.actualState ?? (lifecycle ? getNextReferralStep(lifecycle.state) : 'No referral lifecycle is recorded.'),
    ...(referral ? { referralId: referral.id } : {}),
    ...(referral && shell.followUps[referral.id] ? { followUpState: shell.followUps[referral.id].status } : {}),
    sourceIds: [patient.id, ...(activeCareGap ? [activeCareGap.id] : []), ...(referral ? [referral.id] : [])],
  }, { isOnline: shell.isOnline });

  return (
    <div className="flex w-full flex-col gap-space-md px-margin py-space-sm">
      <OfflineStatus />

      <Card variant="primary" padding="md" className="gap-space-sm">
        <h1 className="sr-only">Patient Profile for {patient.fullName}</h1>
        <SectionHeader title="Patient Profile" tag="SYNTHETIC RECORD" />
        <PatientIdentity
          fullName={patient.fullName}
          age={patient.age}
          gender={patient.gender}
          syntheticId={patient.id}
          village={patient.village}
          assignedAshaName={patient.assignedAshaName}
        />
        <div className="flex flex-wrap gap-space-xs border-t border-outline-variant/30 pt-space-sm">
          <StatusBadge label={`${patient.urgencyTier} PRIORITY`} variant="critical" />
          <StatusBadge label="SCREENING RECORDED" variant="success" />
          {referral && (
            <StatusBadge
              label={`${getReferralLifecycleLabel(lifecycle?.state ?? 'REFERRED')} · SIMULATED STATE`}
              variant={lifecycle?.state === 'TIMEOUT' ? 'critical' : lifecycle?.state === 'REACHED' || lifecycle?.state === 'CARE_RECEIVED' || lifecycle?.state === 'CLOSED' ? 'success' : lifecycle?.state === 'REACH_PENDING' ? 'warning' : 'primary'}
            />
          )}
        </div>
        <div className="grid gap-space-xs sm:grid-cols-2">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">Assigned worker:</span>{' '}
            {patient.assignedAshaName}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">Service area:</span>{' '}
            {patient.section} · {patient.village}
          </p>
        </div>
      </Card>

      <section aria-label="Current care state">
        {patientReferrals.map((historicalReferral) => {
          const historicalLifecycle = shell.referralLifecycle[historicalReferral.id] ?? createInitialReferralSnapshot(historicalReferral);
          const recovery = shell.followUps[historicalReferral.id];
          return historicalLifecycle.state === 'TIMEOUT' && <div key={historicalReferral.id} className="mb-space-sm"><FollowUpRecoveryPanel referral={historicalReferral} careGapId={recovery?.careGapId ?? activeCareGap?.id} /></div>;
        })}
        <SectionHeader
          title="Current Care State"
          subtitle={currentMilestoneLabel ?? 'Screening recorded'}
          tag="SCREEN → CLOSURE"
        />
        <Card variant="default" padding="md">
          <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-5">
            {JOURNEY_STAGES.map((stage, index) => {
              const milestone = referral?.milestones.find(
                (item) => item.milestone === stage.milestone
              );
              const isReach = stage.milestone === 'REACH_PENDING';
              const isReceive = stage.milestone === 'RECEIVED';
              const isCurrent = isReach
                ? lifecycle?.state === 'REACH_PENDING' || lifecycle?.state === 'TIMEOUT'
                : isReceive
                  ? lifecycle?.state === 'REACHED'
                  : stage.milestone === 'CLOSED'
                    ? lifecycle?.state === 'CARE_RECEIVED'
                  : milestone?.active ?? (!referral && index === 0);
              const isComplete = isReach
                ? Boolean(lifecycle && isJourneyMilestoneComplete(lifecycle.state, 'REACH_PENDING'))
                : isReceive
                  ? Boolean(lifecycle && isJourneyMilestoneComplete(lifecycle.state, 'RECEIVED'))
                  : stage.milestone === 'CLOSED'
                    ? Boolean(lifecycle && isJourneyMilestoneComplete(lifecycle.state, 'CLOSED'))
                    : milestone?.completed ?? (!referral && index === 0);
              return (
                <div
                  key={stage.label}
                  className="flex min-w-0 items-center gap-space-xs"
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-code-xs text-code-xs font-bold ${
                    isComplete
                      ? 'bg-tertiary text-on-tertiary'
                      : isCurrent
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {isComplete ? '✓' : index + 1}
                  </span>
                  <span className={`min-w-0 font-code-xs text-code-xs font-bold ${isCurrent ? 'text-error' : 'text-on-surface-variant'}`}>
                    {stage.label}
                    {isCurrent && <span className="block font-medium">CURRENT</span>}
                    {isReach && lifecycle?.state === 'TIMEOUT' && <span className="block font-medium">TIMED OUT · SIMULATED</span>}
                    {isReceive && lifecycle?.state === 'REACHED' && <span className="block font-medium">NEXT STEP</span>}
                    {isReceive && lifecycle?.state === 'CARE_RECEIVED' && <span className="block font-medium">SIMULATED</span>}
                    {stage.milestone === 'CLOSED' && lifecycle?.state === 'CARE_RECEIVED' && <span className="block font-medium">NEXT</span>}
                    {stage.milestone === 'CLOSED' && lifecycle?.state === 'CLOSED' && <span className="block font-medium">CONFIRMED</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
        {closureEvidence && <Card variant="success" padding="md" className="mt-space-sm"><h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">CLOSURE CONFIRMED · SIMULATED</h2><p className="mt-space-xs font-body-sm text-body-sm text-on-surface">Evidence recorded for expected care step: {closureEvidence.expectedStep}</p><p className="font-code-xs text-code-xs text-on-surface-variant">{closureEvidence.evidenceType} · {closureEvidence.evidenceSource} · no timestamp recorded. This does not indicate cure or a clinical outcome.</p></Card>}
      </section>

      <section aria-label="AI-assisted patient summary">
        <AiAssistCard title="AI-ASSISTED PATIENT SUMMARY" result={patientSummary} />
      </section>

      {activeCareGap && (
        <section aria-label="Active care gap">
          <SectionHeader title="Active Care Gap" tag="ACTION REQUIRED" />
          <Card variant="alert" padding="md" className="gap-space-sm">
            <div className="flex flex-wrap items-center justify-between gap-space-xs">
              <CareGapBadge
                label={activeCareGapResult?.status ?? activeCareGap.status.replace('_', ' ')}
                isExpired={activeCareGapResult?.status === 'CONFIRMED'}
              />
              <StatusBadge label={`${patient.urgencyTier} PRIORITY`} variant="critical" />
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Expected care step
              </span>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {activeCareGap.title}
              </h2>
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Operational explanation
              </span>
              {activeCareGapResult && <p className="mt-space-xs font-body-sm text-body-sm font-semibold text-primary">{activeCareGapResult.reasonCode} · {activeCareGapResult.confidence}</p>}
              {activeCareGapResult && <p className="mt-space-xs font-body-sm text-body-sm text-on-surface">{activeCareGapResult.explanation}</p>}
              <ul className="mt-space-xs list-disc space-y-1 pl-5 font-body-sm text-body-sm text-on-surface">
                {activeCareGap.explanation.rootCauseFactors.map((factor) => (
                  <li key={factor}>{factor}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-surface-container-low p-space-sm">
              <span className="font-label-sm text-label-sm font-semibold text-primary">
                Next recommended operational action
              </span>
              <p className="mt-0.5 font-body-sm text-body-sm text-on-surface">
                {activeCareGap.recommendedAction}
              </p>
            </div>
            <SecondaryButton
              icon="crisis_alert"
              onClick={() => navigate(ROUTE_PATHS.frontlineCareGaps)}
            >
              Review Care Gap
            </SecondaryButton>
          </Card>
        </section>
      )}

      {referral && (
        <section aria-label="Current referral">
          <SectionHeader title="Current Referral" tag={referral.id} />
          <Card variant="default" padding="md" className="gap-space-sm">
            <div className="flex flex-wrap items-center gap-space-xs">
              <StatusBadge
                label={`${getReferralLifecycleLabel(lifecycle?.state ?? 'REFERRED')} · SIMULATED`}
                variant={lifecycle?.state === 'TIMEOUT' ? 'critical' : lifecycle?.state === 'REACHED' ? 'success' : lifecycle?.state === 'REACH_PENDING' ? 'warning' : 'primary'}
              />
              <StatusBadge
                label={lifecycle?.state === 'REACHED' ? 'ARRIVAL SIMULATED' : lifecycle?.state === 'TIMEOUT' ? 'MISSED ARRIVAL SIMULATED' : 'REACH PENDING'}
                variant={lifecycle?.state === 'REACHED' ? 'success' : lifecycle?.state === 'TIMEOUT' ? 'critical' : 'warning'}
              />
            </div>
            <dl className="grid gap-space-sm sm:grid-cols-2">
              <div>
                <dt className="font-label-sm text-label-sm text-on-surface-variant">Destination facility</dt>
                <dd className="font-body-md text-body-md font-semibold text-on-surface">
                  {facility?.name ?? 'Facility not assigned'}
                </dd>
              </div>
              <div>
                <dt className="font-label-sm text-label-sm text-on-surface-variant">Referred</dt>
                <dd className="font-body-md text-body-md text-on-surface">
                  {referredAt ?? 'Date not recorded'}
                </dd>
              </div>
              <div>
                <dt className="font-label-sm text-label-sm text-on-surface-variant">Referral purpose / service</dt>
                <dd className="font-body-sm text-body-sm text-on-surface">
                  {referral.clinicalIndication}
                </dd>
              </div>
              <div>
                <dt className="font-label-sm text-label-sm text-on-surface-variant">Current transit state</dt>
                <dd className="font-body-sm text-body-sm text-on-surface">
                  {getReferralLifecycleLabel(lifecycle?.state ?? 'REFERRED')} · prototype state
                </dd>
              </div>
            </dl>
            <PrimaryButton
              icon="open_in_new"
              onClick={() => navigate(referralRoute)}
            >
              View Referral Details
            </PrimaryButton>
          </Card>
        </section>
      )}

      <section aria-label="Personal baseline preview">
        <SectionHeader title="Personal Baseline Preview" tag="SCREENING DATA" />
        <Card variant="default" padding="md" className="gap-space-sm">
          <StatusBadge label="PREVIEW ONLY" variant="neutral" />
          {patient.latestVitals && (
            <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-3">
              <div>
                <span className="block font-label-sm text-label-sm text-on-surface-variant">Blood pressure</span>
                <span className="font-code-sm text-code-sm font-bold text-on-surface">
                  {patient.latestVitals.bloodPressureSystolic}/{patient.latestVitals.bloodPressureDiastolic} mmHg
                </span>
              </div>
              <div>
                <span className="block font-label-sm text-label-sm text-on-surface-variant">Hemoglobin</span>
                <span className="font-code-sm text-code-sm font-bold text-on-surface">
                  {patient.latestVitals.hemoglobinGdl} g/dL
                </span>
              </div>
              <div>
                <span className="block font-label-sm text-label-sm text-on-surface-variant">Recorded</span>
                <span className="font-code-xs text-code-xs text-on-surface">
                  {patient.latestVitals.recordedAt.slice(0, 10)}
                </span>
              </div>
            </div>
          )}
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Baseline details will be captured during screening. Values shown are existing synthetic record data only.
          </p>
          <SecondaryButton
            icon="clinical_notes"
            onClick={() => navigate(ROUTE_PATHS.frontlineScreening(patient.id))}
          >
            Open Screening Placeholder
          </SecondaryButton>
        </Card>
      </section>

      <section aria-label="Timeline and care events">
        <SectionHeader title="Timeline & Care Events" tag="SYNTHETIC RECORD" />
        <Card variant="default" padding="md">
          <ol className="space-y-space-sm">
            {timelineEvents.map((event) => (
              <li key={event.id} className="flex gap-space-sm border-l-2 border-outline-variant pl-space-sm">
                <div className="min-w-0">
                  <span className="font-code-xs text-code-xs text-on-surface-variant">
                    {event.date}
                  </span>
                  <p className="font-body-sm text-body-sm font-semibold text-on-surface">
                    {event.title}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {event.facilityOrLocation}
                  </p>
                </div>
              </li>
            ))}
            {lifecycle?.history.map((event) => (
              <li key={`lifecycle-${event.id}`} className="flex gap-space-sm border-l-2 border-primary pl-space-sm">
                <div className="min-w-0">
                  <span className="font-code-xs text-code-xs text-on-surface-variant">
                            {event.timestamp ?? (event.source === 'HANDSHAKE_SIMULATION' ? 'Synthetic handshake · no timestamp recorded' : event.source === 'FACILITY_SIMULATION' ? 'Facility simulation · no timestamp recorded' : event.source === 'SIMULATION' ? 'Simulated in this session · no timestamp recorded' : 'Synthetic record · no timestamp recorded')}
                  </span>
                  <p className="font-body-sm text-body-sm font-semibold text-on-surface">{getReferralLifecycleLabel(event.state)}{event.source === 'HANDSHAKE_SIMULATION' ? ' · HANDSHAKE EVENT' : ''}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{event.detail}</p>
                </div>
              </li>
            ))}
            {patientReferrals.flatMap((item) => {
              const oldLifecycle = shell.referralLifecycle[item.id] ?? createInitialReferralSnapshot(item);
              const recovery = shell.followUps[item.id];
              return [
                ...(oldLifecycle.state === 'TIMEOUT' ? [{ id: `${item.id}-timeout-history`, referralId: item.id, event: 'TIMEOUT', detail: 'Historical referral timed out before arrival was confirmed.' }] : []),
                ...(recovery?.events ?? []).map((event) => ({ ...event, referralId: item.id })),
              ].map((event) => <li key={event.id} className="flex gap-space-sm border-l-2 border-secondary pl-space-sm"><div className="min-w-0"><span className="font-code-xs text-code-xs text-on-surface-variant">{event.referralId} · simulated event · no timestamp recorded</span><p className="font-body-sm text-body-sm font-semibold text-on-surface">{event.event.replace(/_/g, ' ')}</p><p className="font-body-sm text-body-sm text-on-surface-variant">{event.detail}</p></div></li>);
            })}
            {lifecycle && (
              <li className="flex gap-space-sm border-l-2 border-error pl-space-sm">
                <div className="min-w-0">
                  <span className="font-code-xs text-code-xs text-on-surface-variant">Simulated referral state</span>
                  <p className="font-body-sm text-body-sm font-semibold text-error">
                    {getReferralLifecycleLabel(lifecycle.state)}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {getNextReferralStep(lifecycle.state)}
                  </p>
                </div>
              </li>
            )}
            {!timelineEvents.length && !lifecycle && (
              <li className="font-body-sm text-body-sm text-on-surface-variant">
                No care events are recorded for this synthetic beneficiary.
              </li>
            )}
          </ol>
        </Card>
      </section>

      <section aria-label="Next action and navigation">
        <SectionHeader title="Next Action" tag="FRONTLINE" />
        <Card variant="primary" padding="md" className="gap-space-sm">
          <div>
            <span className="font-label-sm text-label-sm font-semibold text-primary">
              Suggested follow-up
            </span>
            <p className="font-body-md text-body-md text-on-surface">
              {referral ? `Review referral state: ${getReferralLifecycleLabel(lifecycle?.state ?? 'REFERRED')}. ${getNextReferralStep(lifecycle?.state ?? 'REFERRED')}` : 'Review the active care gap.'}
            </p>
          </div>
          <PrimaryButton
            icon="local_hospital"
            onClick={() => navigate(referralRoute)}
          >
            {referral ? 'Continue Referral' : 'Review Care Gap'}
          </PrimaryButton>
          <div className="grid grid-cols-1 gap-space-xs sm:grid-cols-3">
            <SecondaryButton
              icon="arrow_back"
              onClick={() => navigate(ROUTE_PATHS.frontlineDashboard)}
            >
              Back to Frontline Dashboard
            </SecondaryButton>
            <SecondaryButton
              icon="crisis_alert"
              onClick={() => navigate(ROUTE_PATHS.frontlineCareGaps)}
            >
              Care Gaps
            </SecondaryButton>
            <SecondaryButton
              icon="clinical_notes"
              onClick={() => navigate(ROUTE_PATHS.frontlineScreening(patient.id))}
            >
              Screening
            </SecondaryButton>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default PatientProfilePage;
