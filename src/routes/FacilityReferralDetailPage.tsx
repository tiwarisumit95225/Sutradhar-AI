import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, OfflineStatus, PatientIdentity, SectionHeader, SecondaryButton, StatusBadge } from '../components/common';
import HandshakeVerificationForm from '../components/facility/HandshakeVerificationForm';
import { useShell } from '../context/ShellContext';
import { SYNTHETIC_BENEFICIARIES, SYNTHETIC_CARE_GAPS, SYNTHETIC_REFERRALS } from '../data/synthetic';
import { getFacilityById } from '../data/synthetic/facilities';
import { evaluateCareGaps } from '../rules/careGapEngine';
import { createInitialReferralSnapshot, getNextReferralStep, getReferralLifecycleLabel, hasHandshakeVerification } from '../rules/referralLifecycle';
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
  const lifecycleVariant = lifecycle.state === 'REACHED' ? 'success' : lifecycle.state === 'TIMEOUT' ? 'critical' : lifecycle.state === 'REACH_PENDING' ? 'warning' : 'primary';

  return (
    <div className="flex w-full flex-col gap-space-md px-margin py-space-sm">
      <OfflineStatus />
      <section aria-labelledby="facility-referral-title">
        <SectionHeader title="Facility Referral" subtitle="Receiving side · patient context and arrival verification" tag="PROTOTYPE" />
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
            <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Expected care step</dt><dd className="font-body-sm text-body-sm text-on-surface">REACH / RECEIVE · {getNextReferralStep(lifecycle.state)}</dd></div>
          </dl>
        </Card>
      </section>

      <section aria-labelledby="receiving-flow-heading">
        <SectionHeader title="Receiving Facility Flow" tag="REACH ≠ CARE RECEIVED" />
        <Card padding="md">
          <h2 id="receiving-flow-heading" className="sr-only">Receiving facility flow</h2>
          <ol className="grid grid-cols-1 gap-space-xs sm:grid-cols-4">
            {[
              { label: 'REFERRAL RECEIVED', done: true },
              { label: 'HANDSHAKE', done: handshakeVerified },
              { label: 'REACH VERIFIED', done: lifecycle.state === 'REACHED' },
              { label: 'CARE RECEIVED — NEXT STEP', done: false },
            ].map((step, index) => <li key={step.label} className="flex min-w-0 items-center gap-space-xs rounded-lg bg-surface-container-low p-space-sm"><span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-code-xs text-code-xs font-bold ${step.done ? 'bg-tertiary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>{step.done ? '✓' : index + 1}</span><span className="break-words font-code-xs text-code-xs font-bold text-on-surface">{step.label}{step.done && <span className="block font-medium">SIMULATED</span>}</span></li>)}
          </ol>
          <div className="mt-space-sm"><StatusBadge label={handshakeVerified ? 'REACH VERIFIED · HANDSHAKE CHECKED · SIMULATED' : lifecycle.state === 'REACHED' ? 'REACH SIMULATED · HANDSHAKE NOT CHECKED' : lifecycle.state === 'TIMEOUT' ? 'TIMED OUT · HANDSHAKE NOT VERIFIED' : 'HANDSHAKE ISSUED · NOT VERIFIED'} variant={handshakeVerified || lifecycle.state === 'REACHED' ? 'success' : lifecycle.state === 'TIMEOUT' ? 'critical' : 'warning'} /></div>
          {!handshakeVerified && lifecycle.state !== 'TIMEOUT' && <div className="mt-space-sm rounded-lg border border-outline-variant/30 p-space-sm"><HandshakeVerificationForm referral={referral} lifecycleState={lifecycle.state} /></div>}
          {handshakeVerified && <p role="status" className="mt-space-sm rounded-lg bg-tertiary-fixed p-space-sm font-body-sm text-body-sm text-on-tertiary-fixed-variant">The synthetic handshake is recorded in shared referral lifecycle state. Arrival only; no care delivery is recorded.</p>}
          {lifecycle.state === 'REACHED' && !handshakeVerified && <p role="status" className="mt-space-sm rounded-lg bg-tertiary-fixed p-space-sm font-body-sm text-body-sm text-on-tertiary-fixed-variant">Reach was simulated earlier. Handshake credentials have not been checked.</p>}
          {lifecycle.state === 'TIMEOUT' && <p role="status" className="mt-space-sm rounded-lg bg-error-container p-space-sm font-body-sm text-body-sm text-on-error-container">This referral timed out. Verification cannot reopen it.</p>}
        </Card>
      </section>

      <section aria-labelledby="care-context-heading">
        <SectionHeader title="Care Context" tag="CARE-GAP ENGINE" />
        <Card variant={engineResult ? 'alert' : 'default'} padding="md" className="gap-space-sm">
          <h2 id="care-context-heading" className="font-headline-sm text-headline-sm font-bold text-on-surface">{engineResult?.careGap?.title ?? 'No care-gap result for this referral'}</h2>
          {engineResult ? <><p className="font-body-sm text-body-sm text-on-surface">{engineResult.explanation}</p><dl className="grid grid-cols-1 gap-space-xs rounded-lg bg-surface-container-low p-space-sm sm:grid-cols-2"><div><dt className="font-label-sm text-label-sm text-on-surface-variant">Expected step</dt><dd className="font-body-sm text-body-sm text-on-surface">{engineResult.expectedStep}</dd></div><div><dt className="font-label-sm text-label-sm text-on-surface-variant">Current state</dt><dd className="font-body-sm text-body-sm text-on-surface">{engineResult.actualState}</dd></div><div><dt className="font-label-sm text-label-sm text-on-surface-variant">Reason</dt><dd className="font-body-sm text-body-sm text-on-surface">{engineResult.reasonCode}</dd></div><div><dt className="font-label-sm text-label-sm text-on-surface-variant">Suggested operational action</dt><dd className="font-body-sm text-body-sm text-on-surface">{engineResult.suggestedAction}</dd></div></dl></> : <p className="font-body-sm text-body-sm text-on-surface-variant">No engine result is available from the current synthetic beneficiary, referral, and care-gap records.</p>}
          <p className="rounded-lg bg-surface-container-low p-space-sm font-body-sm text-on-surface">REACHED does not mean CARE RECEIVED. Clinical care is a future workflow and is not recorded here.</p>
        </Card>
      </section>
      <SecondaryButton icon="arrow_back" onClick={() => navigate(ROUTE_PATHS.facilityDashboard)}>Back to Facility Dashboard</SecondaryButton>
      <p className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-space-sm font-code-xs text-code-xs font-semibold text-secondary">SYNTHETIC DATA · SIMULATED INTEGRATION · PROTOTYPE · NOT A REAL PATIENT OR FACILITY RECORD</p>
    </div>
  );
};

export default FacilityReferralDetailPage;
