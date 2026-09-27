import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, OfflineStatus, PatientIdentity, PrimaryButton, SectionHeader, SecondaryButton, StatusBadge } from '../components/common';
import FacilityCard from '../components/facility/FacilityCard';
import FacilityMap from '../components/facility/FacilityMap';
import SyntheticHandshakeQr from '../components/facility/SyntheticHandshakeQr';
import HandshakeVerificationForm from '../components/facility/HandshakeVerificationForm';
import { useShell } from '../context/ShellContext';
import { getFacilities, getFacilityById, SYNTHETIC_BENEFICIARIES, SYNTHETIC_CARE_GAPS, SYNTHETIC_REFERRALS } from '../data/synthetic';
import { getCareGapsForBeneficiary } from '../rules/careGapEngine';
import { getReferralRequirements, rankFacilityOptions } from '../rules/facilitySuitability';
import { createInitialReferralSnapshot, getNextReferralStep, getReferralLifecycleLabel, hasHandshakeVerification } from '../rules/referralLifecycle';
import { copyHandshakeToken } from '../rules/handshakeClipboard';
import type { ReferralLifecycleState } from '../types';
import { ROUTE_PATHS } from './paths';

const SmartReferralPage: React.FC = () => {
  const { referralId } = useParams<'referralId'>();
  const navigate = useNavigate();
  const shell = useShell();
  const referral = SYNTHETIC_REFERRALS.find((item) => item.id === referralId);
  const patient = referral
    ? SYNTHETIC_BENEFICIARIES.find((item) => item.id === referral.beneficiaryId)
    : undefined;
  const destinationFacility = referral ? getFacilityById(referral.destinationFacilityId) : undefined;
  const lifecycle = referral
    ? shell.referralLifecycle[referral.id] ?? createInitialReferralSnapshot(referral)
    : undefined;

  const engineResults = useMemo(() => getCareGapsForBeneficiary({
    beneficiaries: SYNTHETIC_BENEFICIARIES,
    careGaps: SYNTHETIC_CARE_GAPS,
    referrals: SYNTHETIC_REFERRALS,
    referralLifecycle: shell.referralLifecycle,
  }, patient?.id), [patient?.id, shell.referralLifecycle]);
  const careGapContext = engineResults[0];
  const requirements = useMemo(() => getReferralRequirements(careGapContext), [careGapContext]);
  const options = useMemo(() => rankFacilityOptions(getFacilities(), requirements), [requirements]);
  const recommendedOption = options.find((option) => option.isSuitable) ?? options[0];
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>();

  useEffect(() => {
    setSelectedFacilityId(recommendedOption?.facility.id ?? destinationFacility?.id);
  }, [referralId, recommendedOption?.facility.id, destinationFacility?.id]);

  const onSelectFacility = useCallback((facilityId: string) => {
    setSelectedFacilityId(facilityId);
  }, []);

  const selectedOption = options.find((option) => option.facility.id === selectedFacilityId);
  const selectedFacility = selectedOption?.facility;
  const selectedIsRecommended = selectedFacility?.id === recommendedOption?.facility.id;
  const handshakeVerified = Boolean(referral && lifecycle && hasHandshakeVerification(referral, lifecycle));

  const handleLifecycleTransition = (nextState: ReferralLifecycleState) => {
    if (!referral) return;
    const result = shell.transitionReferralState(referral.id, nextState);
    if (!result) {
      shell.showToast('Referral not found', 'No synthetic referral record is available for this transition.', 'alert');
    } else if (!result.ok) {
      shell.showToast('Transition unavailable', result.reason, 'alert');
    } else if (nextState === 'REACHED') {
      shell.showToast('Simulated arrival recorded', 'REACHED is a prototype state only; this is not facility verification.', 'success');
    } else if (nextState === 'TIMEOUT') {
      shell.showToast('Simulated timeout recorded', 'The Care-Gap Engine will review this demo timeout event.', 'info');
    } else {
      shell.showToast('Referral state updated', `The prototype state is now ${getReferralLifecycleLabel(nextState)}.`, 'info');
    }
  };

  if (!referral || !patient || !destinationFacility) {
    return (
      <div className="flex w-full flex-col gap-space-sm px-margin py-space-sm">
        <OfflineStatus />
        <Card variant="default" padding="md">
          <SectionHeader title="Smart Referral" tag="SYNTHETIC DATA" />
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Referral not found</h1>
          <p className="mt-space-xs break-words font-body-md text-body-md text-on-surface-variant">
            No synthetic referral record matches {referralId || 'this address'}.
          </p>
          <SecondaryButton icon="arrow_back" className="mt-space-sm" onClick={() => navigate(ROUTE_PATHS.frontlineDashboard)}>
            Return to dashboard
          </SecondaryButton>
        </Card>
      </div>
    );
  }

  if (!patient.syntheticCoordinates) {
    return (
      <div className="flex w-full flex-col gap-space-sm px-margin py-space-sm">
        <Card variant="alert" padding="md">
          <SectionHeader title="Map unavailable" tag="DEMO LOCATION MISSING" />
          <p className="font-body-md text-body-md text-on-surface">This synthetic patient record has no demonstration map point.</p>
        </Card>
      </div>
    );
  }

  const handleContinue = () => {
    if (!selectedFacility) return;
    shell.showToast(
      'Facility option selected',
      `${selectedFacility.name} is selected locally for human review. No referral was created.`,
      'success'
    );
  };

  const handleCopyHandshake = async () => {
    if (!referral) return;
    const copied = await copyHandshakeToken(referral.id, referral.handshake.tokenCode);
    shell.showToast(
      copied ? 'Handshake token copied' : 'Copy unavailable',
      copied
        ? 'Referral ID and passcode copied for this synthetic demo.'
        : 'Clipboard access is unavailable. The referral ID and passcode remain visible for manual copying.',
      copied ? 'success' : 'info'
    );
  };

  return (
    <div className="flex w-full flex-col gap-space-sm px-margin py-space-sm">
      <OfflineStatus />

      <section aria-labelledby="smart-referral-title">
        <SectionHeader title="Smart Referral" subtitle="Operational options for frontline review" tag="SYNTHETIC DATA" />
        <div className="flex flex-wrap items-center justify-between gap-space-xs">
          <h1 id="smart-referral-title" className="font-headline-md text-headline-md font-bold text-on-surface">Referral options</h1>
          <span className="font-code-sm text-code-sm font-bold text-primary">{referral.id}</span>
        </div>
      </section>

      <div className="grid min-w-0 grid-cols-1 gap-space-sm lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-space-sm lg:col-span-5">
          <section aria-labelledby="patient-context-heading">
            <SectionHeader title="Patient context" />
            <Card variant="default" padding="md">
              <h2 id="patient-context-heading" className="sr-only">Patient context</h2>
              <PatientIdentity
                fullName={patient.fullName}
                age={patient.age}
                gender={patient.gender}
                syntheticId={patient.id}
                village={patient.village}
                assignedAshaName={patient.assignedAshaName}
              />
              <div className="mt-space-sm flex flex-wrap items-center gap-space-xs border-t border-outline-variant/30 pt-space-sm">
                {lifecycle && <StatusBadge label={`${getReferralLifecycleLabel(lifecycle.state)} · SIMULATED STATE`} variant={lifecycle.state === 'TIMEOUT' ? 'critical' : lifecycle.state === 'REACHED' ? 'success' : lifecycle.state === 'REACH_PENDING' ? 'warning' : 'primary'} />}
                <span className="font-body-sm text-body-sm text-on-surface-variant">Existing destination: {destinationFacility.name}</span>
              </div>
            </Card>
          </section>

          {referral && lifecycle && (
            <section aria-labelledby="referral-lifecycle-heading">
              <SectionHeader title="Referral lifecycle" tag="PROTOTYPE STATE" />
              <Card variant={lifecycle.state === 'TIMEOUT' ? 'alert' : 'default'} padding="md">
                <h2 id="referral-lifecycle-heading" className="font-headline-sm text-headline-sm font-bold text-on-surface">{referral.id}</h2>
                <div aria-live="polite" aria-atomic="true" className="mt-space-sm flex flex-wrap items-center gap-space-xs">
                  <StatusBadge
                    label={`${getReferralLifecycleLabel(lifecycle.state)} · SIMULATED`}
                    variant={lifecycle.state === 'TIMEOUT' ? 'critical' : lifecycle.state === 'REACHED' ? 'success' : lifecycle.state === 'REACH_PENDING' ? 'warning' : 'primary'}
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Destination: {destinationFacility.name}</span>
                </div>
                <div className="mt-space-sm rounded-lg bg-surface-container-low p-space-sm">
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">Next expected step</span>
                  <p className="mt-0.5 font-body-sm text-body-sm font-semibold text-on-surface">{getNextReferralStep(lifecycle.state)}</p>
                </div>
                <div className="mt-space-sm">
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">State timeline · only recorded events</span>
                  <ol className="mt-space-xs space-y-space-xs">
                    {lifecycle.history.map((event, index) => (
                      <li key={event.id} className="flex min-w-0 gap-space-xs border-l-2 border-outline-variant pl-space-sm">
                        <span aria-hidden="true" className="font-code-xs text-code-xs text-primary">{index + 1}.</span>
                        <div className="min-w-0">
                          <p className="font-label-md text-label-md text-on-surface">{getReferralLifecycleLabel(event.state)}</p>
                          <p className="break-words font-body-sm text-body-sm text-on-surface-variant">{event.detail}</p>
                          <p className="font-code-xs text-code-xs text-secondary">
                            {event.timestamp ?? (event.source === 'SIMULATION' ? 'Simulated in this session · no timestamp recorded' : 'Synthetic record · no timestamp recorded')}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="mt-space-sm flex flex-col gap-space-xs sm:flex-row sm:flex-wrap">
                  {lifecycle.state === 'REFERRED' && (
                    <PrimaryButton icon="play_arrow" onClick={() => handleLifecycleTransition('REACH_PENDING')}>
                      Start Referral · Simulate
                    </PrimaryButton>
                  )}
                  {lifecycle.state === 'REACH_PENDING' && <>
                    <PrimaryButton icon="location_on" onClick={() => handleLifecycleTransition('REACHED')}>
                      Simulate Arrival
                    </PrimaryButton>
                    <SecondaryButton icon="schedule" onClick={() => handleLifecycleTransition('TIMEOUT')}>
                      Simulate Missed Arrival
                    </SecondaryButton>
                  </>}
                  {(lifecycle.state === 'REACHED' || lifecycle.state === 'TIMEOUT') && (
                    <p className="font-body-sm text-on-surface-variant">No further lifecycle action is available in this loop. Later care steps are placeholders.</p>
                  )}
                </div>
                <p aria-live="polite" className="mt-space-sm border-t border-outline-variant/30 pt-space-sm font-body-sm text-on-surface-variant">
                  Simulation only. REACHED does not mean facility verification, treatment, or care completion.
                </p>
              </Card>
            </section>
          )}

          {referral && lifecycle && (
            <section aria-labelledby="handshake-heading">
              <SectionHeader title="Handshake token" tag="SYNTHETIC · PROTOTYPE ONLY" />
              <Card variant={handshakeVerified ? 'success' : 'primary'} padding="md">
                <div className="flex flex-wrap items-start justify-between gap-space-xs">
                  <div>
                    <h2 id="handshake-heading" className="font-headline-sm text-headline-sm font-bold text-on-surface">Referral arrival token</h2>
                    <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">Present the referral ID and passcode at the receiving facility to simulate arrival confirmation.</p>
                  </div>
                  <StatusBadge
                    label={handshakeVerified || lifecycle.state === 'REACHED' ? 'REACH VERIFIED · SIMULATED' : lifecycle.state === 'TIMEOUT' ? 'REFERRAL TIMED OUT' : 'HANDSHAKE ISSUED'}
                    variant={handshakeVerified || lifecycle.state === 'REACHED' ? 'success' : lifecycle.state === 'TIMEOUT' ? 'critical' : 'primary'}
                  />
                </div>

                <div className="mt-space-sm grid min-w-0 grid-cols-1 gap-space-sm sm:grid-cols-2 sm:items-center">
                  <SyntheticHandshakeQr referralId={referral.id} passcode={referral.handshake.tokenCode} />
                  <dl className="min-w-0 space-y-space-sm rounded-lg bg-surface-container-low p-space-sm">
                    <div>
                      <dt className="font-label-sm text-label-sm text-on-surface-variant">Referral ID</dt>
                      <dd className="break-all font-code-sm text-code-sm font-bold text-on-surface">{referral.id}</dd>
                    </div>
                    <div>
                      <dt className="font-label-sm text-label-sm text-on-surface-variant">Handshake passcode</dt>
                      <dd className="font-code-sm text-code-sm font-bold text-on-surface">{referral.handshake.tokenCode}</dd>
                    </div>
                    <div>
                      <dt className="font-label-sm text-label-sm text-on-surface-variant">Receiving facility</dt>
                      <dd className="break-words font-body-sm text-body-sm font-semibold text-on-surface">{destinationFacility.name}</dd>
                    </div>
                    <SecondaryButton icon="content_copy" onClick={() => { void handleCopyHandshake(); }}>
                      Copy Token
                    </SecondaryButton>
                  </dl>
                </div>

                <div className="mt-space-sm border-t border-outline-variant/30 pt-space-sm">
                  <h3 className="font-label-lg text-label-lg text-on-surface">Handshake journey</h3>
                  <ol className="mt-space-xs grid grid-cols-2 gap-space-xs">
                    {[
                      { title: 'TOKEN ISSUED', done: true },
                      { title: 'TOKEN PRESENTED', done: handshakeVerified },
                      { title: 'VERIFICATION', done: handshakeVerified },
                      { title: 'REACH CONFIRMED', done: lifecycle.state === 'REACHED' },
                    ].map((step, index) => (
                      <li key={step.title} className="flex min-w-0 items-start gap-space-xs rounded-lg bg-surface-container-low p-space-xs">
                        <span aria-hidden="true" className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-code-xs text-code-xs font-bold ${step.done ? 'bg-tertiary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>{step.done ? '✓' : index + 1}</span>
                        <span className="break-words font-code-xs text-code-xs font-bold text-on-surface">{step.title}{step.done && <span className="block font-medium">SIMULATED</span>}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {lifecycle.state === 'REACHED' && !handshakeVerified && <p role="status" className="mt-space-sm rounded-lg bg-tertiary-fixed p-space-sm font-body-sm text-on-tertiary-fixed-variant">REACH was already recorded through an earlier prototype simulation. The referral has passed the arrival step; handshake credentials have not yet been independently checked.</p>}
                {!handshakeVerified && lifecycle.state !== 'TIMEOUT' && (
                  <HandshakeVerificationForm referral={referral} lifecycleState={lifecycle.state} />
                )}
                {handshakeVerified && <p role="status" className="mt-space-sm rounded-lg bg-tertiary-fixed p-space-sm font-body-sm text-on-tertiary-fixed-variant">REACH VERIFIED · The synthetic handshake was verified. Arrival only; care received is not confirmed.</p>}
                {lifecycle.state === 'TIMEOUT' && !handshakeVerified && <p role="status" className="mt-space-sm rounded-lg bg-error-container p-space-sm font-body-sm text-on-error-container">This referral timed out. Handshake verification cannot move the lifecycle backward or reopen it in this loop.</p>}
                <p className="mt-space-sm border-t border-outline-variant/30 pt-space-sm font-code-xs text-code-xs font-semibold text-secondary">SYNTHETIC HANDSHAKE · SIMULATED VERIFICATION · NOT CONNECTED TO A LIVE FACILITY</p>
              </Card>
            </section>
          )}

          <section aria-labelledby="care-gap-context-heading">
            <SectionHeader title="Care-gap context" tag="CARE-GAP ENGINE" />
            <Card variant="alert" padding="md">
              <h2 id="care-gap-context-heading" className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {careGapContext?.careGap?.title ?? 'No active care gap found'}
              </h2>
              {careGapContext ? (
                <dl className="mt-space-sm space-y-space-xs font-body-sm text-body-sm">
                  <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Expected step</dt><dd className="text-on-surface">{careGapContext.expectedStep}</dd></div>
                  <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Current state</dt><dd className="text-on-surface">{careGapContext.actualState}</dd></div>
                  <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Suggested referral need from recorded gap details</dt><dd className="text-on-surface">{[...requirements.services, ...requirements.diagnostics].join(' · ') || 'No facility requirement extracted from this record.'}</dd></div>
                </dl>
              ) : <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">No engine result is linked to this beneficiary.</p>}
            </Card>
          </section>

          <section aria-labelledby="why-option-heading">
            <SectionHeader title="Why this option?" tag="OPERATIONAL SIGNALS" />
            <Card variant={selectedIsRecommended ? 'success' : 'default'} padding="md">
              <h2 id="why-option-heading" className="font-headline-sm text-headline-sm font-bold text-on-surface">{selectedFacility?.name ?? 'Select a facility'}</h2>
              {selectedFacility && selectedOption && (
                <ul className="mt-space-sm space-y-space-xs font-body-sm text-body-sm text-on-surface">
                  {requirements.services.map((service) => (
                    <li key={service} className="flex gap-space-xs">
                      <span aria-hidden="true" className={selectedOption.missingServices.includes(service) ? 'text-error' : 'text-tertiary'}>{selectedOption.missingServices.includes(service) ? '×' : '✓'}</span>
                      <span>{selectedOption.missingServices.includes(service) ? `${service} is not listed` : `${service} listed available`}</span>
                    </li>
                  ))}
                  {requirements.diagnostics.map((diagnostic) => {
                    const available = selectedFacility.diagnosticStock.some((item) => item.isAvailable && item.itemName.toLocaleLowerCase().includes(diagnostic.toLocaleLowerCase()));
                    return <li key={diagnostic} className="flex gap-space-xs"><span aria-hidden="true" className={available ? 'text-tertiary' : 'text-error'}>{available ? '✓' : '×'}</span><span>{diagnostic} {available ? 'listed available' : 'not listed available'}</span></li>;
                  })}
                  <li className="flex gap-space-xs"><span aria-hidden="true" className={selectedOption.operationallyAvailable ? 'text-tertiary' : 'text-error'}>{selectedOption.operationallyAvailable ? '✓' : '×'}</span><span>Operational status: {selectedFacility.availability.toLocaleLowerCase()} (simulated)</span></li>
                  <li className="flex gap-space-xs"><span aria-hidden="true" className="text-primary">•</span><span>{selectedFacility.distanceKm.toFixed(1)} km / about {selectedFacility.estimatedTransitMinutes} min synthetic estimate</span></li>
                  {selectedFacility.stockConfidence && <li className="flex gap-space-xs"><span aria-hidden="true" className="text-primary">•</span><span>Stock confidence: {selectedFacility.stockConfidence} (simulated freshness/confirmation)</span></li>}
                </ul>
              )}
              {selectedFacility && <p className="mt-space-sm border-t border-outline-variant/30 pt-space-sm font-body-sm text-on-surface-variant">Stock confidence describes recorded information freshness; it does not confirm real-time inventory. A frontline worker must review the option.</p>}
            </Card>
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-space-sm lg:col-span-7">
          <section aria-labelledby="map-heading">
            <SectionHeader title="Synthetic facility map" subtitle="Pan and zoom the demonstration points" tag="MAP IS NOT LIVE" />
            <Card variant="default" padding="sm">
              <h2 id="map-heading" className="sr-only">Synthetic facility map</h2>
              <FacilityMap
                patient={patient}
                facilities={getFacilities()}
                selectedFacilityId={selectedFacilityId}
                recommendedFacilityId={recommendedOption?.facility.id}
                onSelectFacility={onSelectFacility}
              />
              <ul aria-label="Map legend" className="mt-space-sm flex flex-wrap gap-space-xs font-label-sm text-label-sm">
                <li className="rounded-full bg-error-container px-space-sm py-1 text-on-error-container">P · Patient</li>
                <li className="rounded-full bg-surface-container-high px-space-sm py-1 text-on-surface">1–4 · Facility</li>
                <li className="rounded-full bg-primary-fixed px-space-sm py-1 text-on-primary-fixed">Outline · Recommended</li>
                <li className="rounded-full bg-surface-container-high px-space-sm py-1 text-on-surface">No outline · Alternative</li>
              </ul>
              <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">Coordinates and listed distances/travel times are synthetic demo values. Markers do not show road routes or live traffic. Map tiles require internet; © OpenStreetMap contributors.</p>
            </Card>
          </section>

          <section aria-labelledby="facility-options-heading">
            <SectionHeader title="Facility options" subtitle="Sorted by requirement coverage, simulated availability, stock confidence, then distance and time" tag="HUMAN REVIEW" />
            <h2 id="facility-options-heading" className="sr-only">Facility options</h2>
            <p className="mb-space-xs rounded-lg bg-surface-container-low p-space-sm font-body-sm text-on-surface-variant">The closest facility is not necessarily the selected option. These are synthetic comparison values; the frontline worker makes the final choice.</p>
            <div className="flex min-w-0 flex-col gap-space-sm">
              {options.map((option) => {
                const recommended = option.facility.id === recommendedOption?.facility.id;
                return (
                  <div key={option.facility.id} className="min-w-0">
                    {recommended && <div className="mb-1 flex flex-wrap items-center gap-space-xs"><StatusBadge label="RECOMMENDED REFERRAL OPTION" variant="success" icon="recommend" /><span className="font-body-sm text-body-sm text-on-surface-variant">Suitable based on available operational signals</span></div>}
                    {!recommended && <div className="mb-1"><StatusBadge label={option.isSuitable ? 'OPERATIONALLY SUITABLE' : 'REQUIREMENTS NOT ALL LISTED'} variant={option.isSuitable ? 'primary' : 'warning'} /></div>}
                    <FacilityCard
                      facility={option.facility}
                      selected={selectedFacilityId === option.facility.id}
                      onSelect={onSelectFacility}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-[72px] z-[500] -mx-margin border-t border-outline-variant/40 bg-surface/95 px-margin py-space-sm backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-space-xs sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" className="min-w-0 font-body-sm text-body-sm text-on-surface">
            Selected: <strong className="break-words">{selectedFacility?.name ?? 'No facility selected'}</strong>
          </p>
          <PrimaryButton icon="arrow_forward" isFullWidth={false} disabled={!selectedFacility} onClick={handleContinue}>
            Continue with selected option
          </PrimaryButton>
        </div>
      </div>
      <p className="text-center font-code-xs text-code-xs text-secondary">SYNTHETIC DATA · SIMULATED INTEGRATION · NO REFERRAL CREATED</p>
    </div>
  );
};

export default SmartReferralPage;
