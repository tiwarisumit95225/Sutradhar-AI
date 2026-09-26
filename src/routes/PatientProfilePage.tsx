import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CareGapBadge,
  OfflineStatus,
  PatientIdentity,
  PrimaryButton,
  ReferralStatusBadge,
  SectionHeader,
  SecondaryButton,
  StatusBadge,
} from '../components/common';
import {
  SYNTHETIC_BENEFICIARIES,
  SYNTHETIC_CARE_GAPS,
  SYNTHETIC_FACILITIES,
  SYNTHETIC_REFERRALS,
} from '../data/synthetic';
import { ROUTE_PATHS } from './paths';

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
  const patient = SYNTHETIC_BENEFICIARIES.find((item) => item.id === patientId);

  if (!patient) return <PatientNotFound patientId={patientId} />;

  const activeCareGap = SYNTHETIC_CARE_GAPS.find(
    (careGap) => careGap.beneficiaryId === patient.id && careGap.status !== 'CLOSED'
  );
  const referral = SYNTHETIC_REFERRALS.find(
    (record) => record.beneficiaryId === patient.id
  );
  const facility = SYNTHETIC_FACILITIES.find(
    (item) => item.id === referral?.destinationFacilityId
  );
  const currentMilestone = referral?.milestones.find((milestone) => milestone.active);
  const referredAt = referral?.milestones.find(
    (milestone) => milestone.milestone === 'REFERRED'
  )?.timestamp;
  const referralRoute = referral
    ? ROUTE_PATHS.frontlineReferral(referral.id)
    : ROUTE_PATHS.frontlineCareGaps;
  const timelineEvents = activeCareGap?.explanation.evidenceTrail ?? [];

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
            <ReferralStatusBadge
              status={referral.handshake.arrivalAcknowledged ? 'ARRIVED' : 'AWAITING_ARRIVAL'}
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
        <SectionHeader
          title="Current Care State"
          subtitle={currentMilestone?.label ?? 'Screening recorded'}
          tag="SCREEN → CLOSURE"
        />
        <Card variant="default" padding="md">
          <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-5">
            {JOURNEY_STAGES.map((stage, index) => {
              const milestone = referral?.milestones.find(
                (item) => item.milestone === stage.milestone
              );
              const isCurrent = milestone?.active ?? (!referral && index === 0);
              const isComplete = milestone?.completed ?? (!referral && index === 0);
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
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {activeCareGap && (
        <section aria-label="Active care gap">
          <SectionHeader title="Active Care Gap" tag="ACTION REQUIRED" />
          <Card variant="alert" padding="md" className="gap-space-sm">
            <div className="flex flex-wrap items-center justify-between gap-space-xs">
              <CareGapBadge
                label={activeCareGap.status.replace('_', ' ')}
                isExpired={activeCareGap.status === 'EXPIRED'}
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
              <ReferralStatusBadge
                status={referral.handshake.arrivalAcknowledged ? 'ARRIVED' : 'AWAITING_ARRIVAL'}
              />
              <StatusBadge
                label={referral.handshake.arrivalAcknowledged ? 'REACH CONFIRMED' : 'REACH PENDING'}
                variant={referral.handshake.arrivalAcknowledged ? 'success' : 'warning'}
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
                  {referral.currentTransitStatus}
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
            {currentMilestone && (
              <li className="flex gap-space-sm border-l-2 border-error pl-space-sm">
                <div className="min-w-0">
                  <span className="font-code-xs text-code-xs text-on-surface-variant">Current state</span>
                  <p className="font-body-sm text-body-sm font-semibold text-error">
                    {currentMilestone.label}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {referral?.currentTransitStatus}
                  </p>
                </div>
              </li>
            )}
            {!timelineEvents.length && !currentMilestone && (
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
              {referral ? 'Continue the referral and review the pending REACH state.' : 'Review the active care gap.'}
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
