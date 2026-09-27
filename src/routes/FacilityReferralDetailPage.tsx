import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, OfflineStatus, PatientIdentity, PrimaryButton, SectionHeader, SecondaryButton, StatusBadge } from '../components/common';
import HandshakeVerificationForm from '../components/facility/HandshakeVerificationForm';
import { useShell } from '../context/ShellContext';
import { SYNTHETIC_BENEFICIARIES, SYNTHETIC_CARE_GAPS, SYNTHETIC_REFERRALS } from '../data/synthetic';
import { getFacilityById } from '../data/synthetic/facilities';
import { evaluateCareGaps } from '../rules/careGapEngine';
import { createInitialReferralSnapshot, getCareReceivedEvidence, getClosureEvidence, getNextReferralStep, getReferralLifecycleLabel, hasHandshakeVerification, isJourneyMilestoneComplete } from '../rules/referralLifecycle';
import { ROUTE_PATHS } from './paths';

const FacilityReferralDetailPage: React.FC = () => {
  const { referralId } = useParams<'referralId'>();
  const navigate = useNavigate();
  const shell = useShell();
  const referral = SYNTHETIC_REFERRALS.find((item) => item.id === referralId);
  const patient = referral && SYNTHETIC_BENEFICIARIES.find((item) => item.id === referral.beneficiaryId);
  const facility = referral && getFacilityById(referral.destinationFacilityId);

  if (!referral || !patient || !facility) return (
    <div className="flex w-full flex-col gap-space-sm px-margin py-space-sm">
      <OfflineStatus />
      <Card padding="md"><SectionHeader title="Facility Referral" tag="SYNTHETIC DATA" /><h1 className="font-headline-md text-headline-md font-bold text-on-surface">Referral not found</h1><p className="mt-space-xs break-words font-body-sm text-body-sm text-on-surface-variant">No complete synthetic referral record matches {referralId || 'this address'}. Handshake verification is unavailable.</p><SecondaryButton icon="arrow_back" className="mt-space-sm" onClick={() => navigate(ROUTE_PATHS.facilityDashboard)}>Return to facility dashboard</SecondaryButton></Card>
    </div>
  );

  const lifecycle = shell.referralLifecycle[referral.id] ?? createInitialReferralSnapshot(referral);
  const handshakeVerified = hasHandshakeVerification(referral, lifecycle);
  const engineResult = evaluateCareGaps({ beneficiaries: SYNTHETIC_BENEFICIARIES, careGaps: SYNTHETIC_CARE_GAPS, referrals: SYNTHETIC_REFERRALS, referralLifecycle: shell.referralLifecycle }).find((result) => result.referral?.id === referral.id);
  const lifecycleVariant = lifecycle.state === 'REACHED' || lifecycle.state === 'CARE_RECEIVED' || lifecycle.state === 'CLOSED' ? 'success' : lifecycle.state === 'TIMEOUT' ? 'critical' : lifecycle.state === 'REACH_PENDING' ? 'warning' : 'primary';
  const careEvidence = getCareReceivedEvidence(lifecycle, referral.id);
  const closureEvidence = getClosureEvidence(lifecycle, referral.id);
  const transitionTo = (state: 'CARE_RECEIVED' | 'CLOSED') => {
    const result = shell.transitionReferralState(referral.id, state);
    if (!result || !result.ok) {
      shell.showToast('Action unavailable', result?.reason ?? 'Referral not found.', 'alert');
      return;
    }
    shell.showToast(
      state === 'CARE_RECEIVED' ? 'Care received · simulated' : 'Closure confirmed · simulated',
      'Synthetic evidence was recorded for the expected care step. No diagnosis or outcome is asserted.',
      'success'
    );
  };

  return (
    <div className="flex w-full flex-col gap-space-md px-margin py-space-sm">
      <OfflineStatus />
      <section aria-labelledby="facility-referral-title">
        <SectionHeader title="Facility Referral" subtitle="Receiving side · reach, care received, and evidence-based closure" tag="PROTOTYPE" />
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-space-xs"><h1 id="facility-referral-title" className="break-all font-headline-md text-headline-md font-bold text-on-surface">{referral.id}</h1><StatusBadge label={`${getReferralLifecycleLabel(lifecycle.state)} · SIMULATED`} variant={lifecycleVariant} /></div>
      </section>

      <section aria-labelledby="patient-heading">
        <SectionHeader title="Patient Context" tag="SYNTHETIC RECORD" />
        <Card padding="md" className="gap-space-sm">
          <h2 id="patient-heading" className="sr-only">Patient context</h2>
          <PatientIdentity fullName={patient.fullName} age={patient.age} gender={patient.gender} syntheticId={patient.id} village={patient.village} assignedAshaName={patient.assignedAshaName} />
          <dl className="grid grid-cols-1 gap-space-xs rounded-lg bg-surface-container-low p-space-sm sm:grid-cols-2">
            <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Referring worker</dt><dd className="font-body-sm text-body-sm text-on-surface">{patient.assignedAshaName ?? 'Not represented in this synthetic record'}</dd></div>
            <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Destination facility</dt><dd className="font-body-sm text-body-sm text-on-surface">{facility.name} · {facility.facilityType.replace('_', ' ')}</dd></div>
            <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Referral purpose</dt><dd className="break-words font-body-sm text-body-sm text-on-surface">{referral.clinicalIndication}</dd></div>
            <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Expected care step</dt><dd className="break-words font-body-sm text-body-sm text-on-surface">{referral.clinicalIndication}</dd></div>
            <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Next workflow step</dt><dd className="font-body-sm text-body-sm text-on-surface">{getNextReferralStep(lifecycle.state)}</dd></div>
          </dl>
        </Card>
      </section>

      <section aria-labelledby="receiving-flow-heading">
        <SectionHeader title="Receiving Facility Flow" tag="REACH ≠ CARE RECEIVED" />
        <Card padding="md">
          <h2 id="receiving-flow-heading" className="sr-only">Receiving facility flow</h2>
          <ol className="grid grid-cols-1 gap-space-xs sm:grid-cols-5">
            {[
              { milestone: 'REFERRED' as const, label: 'REFERRAL', done: true },
              { label: 'REACH', done: isJourneyMilestoneComplete(lifecycle.state, 'REACH_PENDING') },
              { label: 'CARE RECEIVED', done: isJourneyMilestoneComplete(lifecycle.state, 'RECEIVED') },
              { label: 'CLOSURE', done: isJourneyMilestoneComplete(lifecycle.state, 'CLOSED') },
            ].map((step, index) => <li key={step.label} className="flex min-w-0 items-center gap-space-xs rounded-lg bg-surface-container-low p-space-sm"><span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-code-xs text-code-xs font-bold ${step.done ? 'bg-tertiary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>{step.done ? '✓' : index + 1}</span><span className="break-words font-code-xs text-code-xs font-bold text-on-surface">{step.label}{step.done && <span className="block font-medium">SIMULATED</span>}</span></li>)}
          </ol>
          <div className="mt-space-sm flex flex-wrap gap-space-xs"><StatusBadge label={`${getReferralLifecycleLabel(lifecycle.state)} · SIMULATED`} variant={lifecycleVariant} />{handshakeVerified && <StatusBadge label="HANDSHAKE CHECKED · SIMULATED" variant="success" />}</div>
          {!handshakeVerified && (lifecycle.state === 'REFERRED' || lifecycle.state === 'REACH_PENDING' || lifecycle.state === 'REACHED') && <div className="mt-space-sm rounded-lg border border-outline-variant/30 p-space-sm"><HandshakeVerificationForm referral={referral} lifecycleState={lifecycle.state} /></div>}
          {lifecycle.state === 'REACHED' && <div className="mt-space-sm"><p className="mb-space-xs font-body-sm text-body-sm text-on-surface-variant">REACH confirms arrival only. It does not confirm care received.</p><PrimaryButton icon="task_alt" onClick={() => transitionTo('CARE_RECEIVED')}>Record Care Received · Simulated</PrimaryButton></div>}
          {lifecycle.state === 'CARE_RECEIVED' && <div className="mt-space-sm flex flex-col gap-space-xs"><StatusBadge label="CARE RECEIVED · SIMULATED" variant="success" /><p className="font-body-sm text-body-sm text-on-surface-variant">Expected care-step evidence is recorded. Confirm closure to complete this prototype journey.</p><PrimaryButton icon="verified" onClick={() => transitionTo('CLOSED')}>Confirm Closure · Simulated</PrimaryButton></div>}
          {lifecycle.state === 'CLOSED' && <div role="status" className="mt-space-sm rounded-lg bg-tertiary-fixed p-space-sm"><StatusBadge label="CLOSURE CONFIRMED · SIMULATED" variant="success" /><p className="mt-space-xs font-body-sm text-body-sm text-on-tertiary-fixed-variant">Evidence recorded for expected care step. This does not indicate cure or a clinical outcome.</p></div>}
          {handshakeVerified && lifecycle.state === 'REACHED' && <p role="status" className="mt-space-sm rounded-lg bg-tertiary-fixed p-space-sm font-body-sm text-body-sm text-on-tertiary-fixed-variant">The synthetic handshake is recorded in shared referral lifecycle state. Arrival only; care received is a separate step.</p>}
          {lifecycle.state === 'REACHED' && !handshakeVerified && <p role="status" className="mt-space-sm rounded-lg bg-tertiary-fixed p-space-sm font-body-sm text-body-sm text-on-tertiary-fixed-variant">Reach was simulated earlier. Handshake credentials have not been checked.</p>}
          {lifecycle.state === 'TIMEOUT' && <p role="status" className="mt-space-sm rounded-lg bg-error-container p-space-sm font-body-sm text-body-sm text-on-error-container">This referral timed out. Verification cannot reopen it.</p>}
        </Card>
      </section>

      <section aria-labelledby="care-context-heading">
        <SectionHeader title="Care Context" tag="CARE-GAP ENGINE" />
        <Card variant={engineResult ? 'alert' : 'default'} padding="md" className="gap-space-sm">
          <h2 id="care-context-heading" className="font-headline-sm text-headline-sm font-bold text-on-surface">{engineResult?.careGap?.title ?? 'No care-gap result for this referral'}</h2>
          {engineResult ? <><p className="font-body-sm text-body-sm text-on-surface">{engineResult.explanation}</p><dl className="grid grid-cols-1 gap-space-xs rounded-lg bg-surface-container-low p-space-sm sm:grid-cols-2"><div><dt className="font-label-sm text-label-sm text-on-surface-variant">Expected step</dt><dd className="font-body-sm text-body-sm text-on-surface">{engineResult.expectedStep}</dd></div><div><dt className="font-label-sm text-label-sm text-on-surface-variant">Current state</dt><dd className="font-body-sm text-body-sm text-on-surface">{engineResult.actualState}</dd></div><div><dt className="font-label-sm text-label-sm text-on-surface-variant">Reason</dt><dd className="font-body-sm text-body-sm text-on-surface">{engineResult.reasonCode}</dd></div><div><dt className="font-label-sm text-label-sm text-on-surface-variant">Suggested operational action</dt><dd className="font-body-sm text-body-sm text-on-surface">{engineResult.suggestedAction}</dd></div></dl></> : <p className="font-body-sm text-body-sm text-on-surface-variant">No engine result is available from the current synthetic beneficiary, referral, and care-gap records.</p>}
          {careEvidence && <div className="rounded-lg bg-surface-container-low p-space-sm"><h3 className="font-label-md text-label-md font-bold text-on-surface">Care received evidence · simulated</h3><p className="mt-0.5 font-body-sm text-body-sm text-on-surface">{careEvidence.status}: {careEvidence.expectedStep}</p><p className="font-code-xs text-code-xs text-on-surface-variant">{careEvidence.evidenceType} · {careEvidence.evidenceSource} · no timestamp recorded</p></div>}
          {closureEvidence && <div className="rounded-lg bg-tertiary-fixed p-space-sm"><h3 className="font-label-md text-label-md font-bold text-on-tertiary-fixed-variant">Closure evidence · simulated</h3><p className="mt-0.5 font-body-sm text-body-sm text-on-tertiary-fixed-variant">Evidence recorded for expected care step: {closureEvidence.expectedStep}</p><p className="font-code-xs text-code-xs text-on-tertiary-fixed-variant">{closureEvidence.evidenceType} · {closureEvidence.evidenceSource} · no timestamp recorded</p></div>}
          {!careEvidence && <p className="rounded-lg bg-surface-container-low p-space-sm font-body-sm text-on-surface">REACHED does not mean CARE RECEIVED. Care recording remains a separate facility action.</p>}
          {(lifecycle.state === 'REFERRED' || lifecycle.state === 'REACH_PENDING' || lifecycle.state === 'TIMEOUT') && <p className="rounded-lg bg-surface-container-low p-space-sm font-body-sm text-on-surface-variant">Care received cannot be recorded from {getReferralLifecycleLabel(lifecycle.state)}. The lifecycle only enables it after REACHED.</p>}
        </Card>
      </section>
      <SecondaryButton icon="arrow_back" onClick={() => navigate(ROUTE_PATHS.facilityDashboard)}>Back to Facility Dashboard</SecondaryButton>
      <p className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-space-sm font-code-xs text-code-xs font-semibold text-secondary">SYNTHETIC DATA · SIMULATED INTEGRATION · PROTOTYPE · NOT A REAL PATIENT OR FACILITY RECORD</p>
    </div>
  );
};

export default FacilityReferralDetailPage;
