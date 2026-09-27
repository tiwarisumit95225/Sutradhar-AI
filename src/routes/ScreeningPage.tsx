import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  OfflineStatus,
  PatientIdentity,
  PrimaryButton,
  SectionHeader,
  SecondaryButton,
  StatusBadge,
} from '../components/common';
import { useShell } from '../context/ShellContext';
import { SYNTHETIC_BENEFICIARIES, SYNTHETIC_CARE_GAPS } from '../data/synthetic';
import { ROUTE_PATHS } from './paths';

interface ScreeningSignal {
  id: string;
  label: string;
  currentValue: string;
  previousValue?: string;
  previousDate?: string;
  change?: string;
}

const formatDelta = (value: number, digits = 0): string => {
  const formatted = value.toFixed(digits);
  return value > 0 ? `+${formatted}` : formatted;
};

const ScreeningPage: React.FC = () => {
  const { patientId } = useParams<'patientId'>();
  const navigate = useNavigate();
  const shell = useShell();
  const patient = SYNTHETIC_BENEFICIARIES.find((item) => item.id === patientId);

  if (!patient) {
    return (
      <div className="flex w-full flex-col gap-space-md px-margin py-space-sm">
        <OfflineStatus />
        <Card variant="default" padding="md">
          <SectionHeader title="Screening" tag="NOT FOUND" />
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
            Patient not found
          </h1>
          <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">
            No synthetic beneficiary record matches this patient ID.
          </p>
          {patientId && (
            <p className="mt-space-sm font-code-sm text-code-sm text-on-surface">
              Patient ID: {patientId}
            </p>
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
  }

  const careGap = SYNTHETIC_CARE_GAPS.find((item) => item.beneficiaryId === patient.id);
  const priorScreening = careGap?.explanation.evidenceTrail.find(
    (event) => event.statusType === 'SCREENING' && event.screeningObservation
  );
  const priorObservation = priorScreening?.screeningObservation;
  const current = patient.latestVitals;
  const hasPreviousSignal = Boolean(priorObservation);
  const baselineStatus = current ? 'BASELINE DEVELOPING' : 'BASELINE NOT YET ESTABLISHED';
  const reviewSuggested = patient.urgencyTier === 'CRITICAL';

  const signals: ScreeningSignal[] = [
    {
      id: 'blood-pressure',
      label: 'Blood pressure',
      currentValue: `${current.bloodPressureSystolic}/${current.bloodPressureDiastolic} mmHg`,
      previousValue: priorObservation
        ? `${priorObservation.bloodPressureSystolic}/${priorObservation.bloodPressureDiastolic} mmHg`
        : undefined,
      previousDate: priorScreening?.date,
      change: priorObservation
        ? `${formatDelta(current.bloodPressureSystolic - priorObservation.bloodPressureSystolic)}/${formatDelta(current.bloodPressureDiastolic - priorObservation.bloodPressureDiastolic)} mmHg`
        : undefined,
    },
    {
      id: 'hemoglobin',
      label: 'Hemoglobin',
      currentValue: `${current.hemoglobinGdl} g/dL`,
      previousValue: priorObservation ? `${priorObservation.hemoglobinGdl} g/dL` : undefined,
      previousDate: priorScreening?.date,
      change: priorObservation
        ? `${formatDelta(current.hemoglobinGdl - priorObservation.hemoglobinGdl, 1)} g/dL`
        : undefined,
    },
    ...(current.fundalHeightCm === undefined
      ? []
      : [{
          id: 'fundal-height',
          label: 'Fundal height',
          currentValue: `${current.fundalHeightCm} cm`,
        }]),
    ...(current.fetalHeartRateBpm === undefined
      ? []
      : [{
          id: 'fetal-heart-rate',
          label: 'Fetal heart rate',
          currentValue: `${current.fetalHeartRateBpm} bpm`,
        }]),
  ];

  const saveScreeningPreview = () => {
    shell.saveScreening(patient.id);
    shell.showToast(
      shell.isOnline ? 'Screening preview saved locally' : 'Screening saved locally · PENDING SYNC',
      shell.isOnline ? 'Local prototype storage only. Simulated sync does not contact a server.' : 'Saved locally — will sync when connection returns. No server was contacted.',
      'success'
    );
  };

  const savedForSession = shell.isScreeningSaved(patient.id);

  return (
    <div className="flex w-full flex-col gap-space-md px-margin py-space-sm">
      <OfflineStatus />

      <Card variant="primary" padding="md" className="gap-space-sm">
        <h1 className="sr-only">Screening for {patient.fullName}</h1>
        <SectionHeader title="Screening" tag="PROTOTYPE" />
        <PatientIdentity
          fullName={patient.fullName}
          age={patient.age}
          gender={patient.gender}
          syntheticId={patient.id}
          village={patient.village}
          assignedAshaName={patient.assignedAshaName}
        />
        <div className="grid gap-space-xs border-t border-outline-variant/30 pt-space-sm sm:grid-cols-2">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">Assigned worker:</span>{' '}
            {patient.assignedAshaName}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">Service area:</span>{' '}
            {patient.section} · {patient.village}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-space-xs sm:grid-cols-2">
          <SecondaryButton
            icon="person_search"
            onClick={() => navigate(ROUTE_PATHS.frontlinePatient(patient.id))}
          >
            Back to Patient Profile
          </SecondaryButton>
          <SecondaryButton
            icon="space_dashboard"
            onClick={() => navigate(ROUTE_PATHS.frontlineDashboard)}
          >
            Back to Frontline Dashboard
          </SecondaryButton>
        </div>
      </Card>

      <section aria-label="Screening workflow">
        <SectionHeader title="Screening Workflow" tag="PRESENTATION ONLY" />
        <Card variant="default" padding="md">
          <div className="flex flex-col items-stretch gap-space-xs sm:flex-row sm:items-center">
            {[
              'CURRENT SIGNALS',
              'COMPARE WITH BASELINE',
              'IDENTIFY CHANGE',
              'FLAG FOR REVIEW',
            ].map((step, index) => (
              <React.Fragment key={step}>
                <div className={`flex min-h-[64px] flex-1 items-center gap-space-sm rounded-lg border border-outline-variant/30 p-space-sm ${index === 0 ? 'bg-surface-container-low text-primary' : 'bg-surface-container-lowest text-on-surface'}`}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-code-xs text-code-xs font-bold text-on-primary-fixed">
                    {index + 1}
                  </span>
                  <span className="font-code-xs text-code-xs font-bold">{step}</span>
                </div>
                {index < 3 && (
                  <span className="material-symbols-outlined self-center text-[20px] text-secondary sm:hidden" aria-hidden="true">
                    south
                  </span>
                )}
                {index < 3 && (
                  <span className="material-symbols-outlined hidden text-[20px] text-secondary sm:inline" aria-hidden="true">
                    arrow_forward
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>
      </section>

      <section aria-label="Personal baseline">
        <SectionHeader title="Personal Baseline" subtitle="A personal range develops from repeated observations" tag={baselineStatus} />
        <Card variant="primary" padding="md" className="gap-space-sm">
          <div className="flex flex-wrap items-center justify-between gap-space-xs">
            <div>
              <span className="font-label-sm text-label-sm font-semibold text-primary">Baseline status</span>
              <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{baselineStatus}</p>
            </div>
            <StatusBadge label="PERSONAL RANGE NOT ESTABLISHED" variant="warning" />
          </div>
          <div className="flex flex-col gap-space-xs sm:flex-row sm:items-stretch">
            {[
              { title: 'Population reference', detail: 'No numeric range is supplied in this synthetic model.' },
              { title: 'Initial baseline', detail: 'An individual reference range is not stored.' },
              { title: 'Repeated observations', detail: hasPreviousSignal ? 'Two screening dates are represented for blood pressure and hemoglobin.' : 'No prior structured observation is available.' },
              { title: 'Personal baseline', detail: 'Developing; no personal range has been established.' },
            ].map((step, index) => (
              <React.Fragment key={step.title}>
                <div className="flex min-w-0 flex-1 flex-col gap-space-xs rounded-lg bg-surface-container-low p-space-sm">
                  <span className="font-code-xs text-code-xs font-bold text-primary">{index + 1}. {step.title}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{step.detail}</span>
                </div>
                {index < 3 && (
                  <span className="material-symbols-outlined self-center text-[20px] text-secondary sm:hidden" aria-hidden="true">
                    south
                  </span>
                )}
                {index < 3 && (
                  <span className="material-symbols-outlined hidden self-center text-[20px] text-secondary sm:inline" aria-hidden="true">
                    arrow_forward
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            The prior screening note is historical context, not an established personal baseline.
          </p>
        </Card>
      </section>

      <section aria-label="Current screening signals">
        <SectionHeader
          title="Current Signals"
          subtitle={`Latest synthetic observation · ${current.recordedAt}`}
          tag={`${signals.length} CAPTURED`}
        />
        <div className="grid gap-space-sm sm:grid-cols-2">
          {signals.map((signal) => (
            <Card key={signal.id} variant="default" padding="md" className="gap-space-sm">
              <SectionHeader title={signal.label} tag="CURRENT" />
              <div className="grid grid-cols-1 gap-space-sm min-[360px]:grid-cols-3">
                <div className="min-w-0">
                  <span className="block font-code-xs text-code-xs text-on-surface-variant">CURRENT</span>
                  <span className="font-code-sm text-code-sm font-bold text-on-surface">{signal.currentValue}</span>
                </div>
                <div className="min-w-0">
                  <span className="block font-code-xs text-code-xs text-on-surface-variant">PREVIOUS OBSERVATION</span>
                  <span className="font-code-sm text-code-sm text-on-surface">
                    {signal.previousValue ?? 'Not recorded'}
                  </span>
                  {signal.previousDate && (
                    <span className="block font-body-sm text-body-sm text-on-surface-variant">{signal.previousDate}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="block font-code-xs text-code-xs text-on-surface-variant">CHANGE</span>
                  <span className="font-code-sm text-code-sm text-on-surface">
                    {signal.change ?? 'Not calculated'}
                  </span>
                </div>
              </div>
              <StatusBadge
                label={signal.previousValue ? 'TWO RECORDED OBSERVATIONS' : 'CURRENT VALUE ONLY'}
                variant={signal.previousValue ? 'primary' : 'neutral'}
              />
            </Card>
          ))}
        </div>
        {priorScreening && (
          <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">
            Prior observation context: {priorScreening.facilityOrLocation} · {priorScreening.date}.
          </p>
        )}
      </section>

      <section aria-label="Assistive triage preview">
        <SectionHeader title="Assistive Triage" tag="PROTOTYPE PREVIEW" />
        <Card variant="inset" padding="md" className="gap-space-xs">
          <div className="flex flex-wrap items-center justify-between gap-space-xs">
            <span className="font-label-md text-label-md font-bold text-on-surface">
              Suggested for review
            </span>
            <StatusBadge
              label={`EXISTING PRIORITY: ${patient.urgencyTier}`}
              variant={reviewSuggested ? 'critical' : 'neutral'}
            />
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            This preview presents recorded signals and the existing synthetic priority tag for worker review. It does not make a diagnosis or an autonomous decision.
          </p>
        </Card>
      </section>

      <section aria-label="Screening summary">
        <SectionHeader title="Screening Summary" tag="SYNTHETIC DATA" />
        <Card variant="default" padding="md">
          <dl className="grid grid-cols-2 gap-space-sm sm:grid-cols-4">
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Screening status</dt>
              <dd className="font-body-sm text-body-sm font-semibold text-on-surface">
                {savedForSession ? 'Preview saved for this session' : 'Existing signals available'}
              </dd>
            </div>
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Baseline status</dt>
              <dd className="font-body-sm text-body-sm font-semibold text-on-surface">{baselineStatus}</dd>
            </div>
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Signals captured</dt>
              <dd className="font-code-sm text-code-sm font-bold text-on-surface">{signals.length}</dd>
            </div>
            <div>
              <dt className="font-label-sm text-label-sm text-on-surface-variant">Review suggested</dt>
              <dd className="font-body-sm text-body-sm font-semibold text-on-surface">{reviewSuggested ? 'Yes' : 'No priority flag in source'}</dd>
            </div>
          </dl>
          <p className="mt-space-sm font-code-xs text-code-xs text-on-surface-variant">
            Latest observation: {current.recordedAt}
          </p>
        </Card>
      </section>

      <section aria-label="Save and continue screening">
        <div className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
          <SecondaryButton icon={savedForSession ? 'task_alt' : 'save'} onClick={saveScreeningPreview}>
            {savedForSession ? 'Saved for This Session' : 'Save Screening'}
          </SecondaryButton>
          <PrimaryButton
            icon="arrow_forward"
            onClick={() => navigate(ROUTE_PATHS.frontlinePatient(patient.id))}
          >
            Continue to Patient Profile
          </PrimaryButton>
        </div>
        <p className="mt-space-xs text-center font-body-sm text-body-sm text-on-surface-variant">
          LOCAL PROTOTYPE STORAGE · SIMULATED SYNC ONLY · NO SERVER
        </p>
      </section>
    </div>
  );
};

export default ScreeningPage;
