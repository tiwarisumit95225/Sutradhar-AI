import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CareGapBadge, OfflineStatus, PatientIdentity, SectionHeader, SecondaryButton, StatusBadge } from '../components/common';
import { SYNTHETIC_BENEFICIARIES, SYNTHETIC_CARE_GAPS, SYNTHETIC_REFERRALS } from '../data/synthetic';
import { evaluateCareGaps } from '../rules/careGapEngine';
import { ROUTE_PATHS } from './paths';

const CareGapCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const results = evaluateCareGaps({
    beneficiaries: SYNTHETIC_BENEFICIARIES,
    careGaps: SYNTHETIC_CARE_GAPS,
    referrals: SYNTHETIC_REFERRALS,
  });

  return (
    <div className="flex w-full flex-col gap-space-md px-margin py-space-sm">
      <OfflineStatus />
      <section>
        <SectionHeader title="Care Gap Center" subtitle="DETECT → PREDICT → EXPLAIN · Operational review, synthetic data only" tag={`${results.length} FLAGS`} />
        {results.length === 0 ? (
          <Card variant="success" padding="md">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">No supported care gaps</h2>
            <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">No unresolved expected care-step failures or evidence-backed risks are represented in the current synthetic records.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-space-md">
            {results.map((item) => (
              <Card key={item.id} variant={item.status === 'CONFIRMED' ? 'alert' : 'default'} padding="md" className="gap-space-sm">
                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                  <CareGapBadge label={item.result === 'CARE_GAP' ? 'CARE GAP' : 'AT RISK'} isExpired={item.status === 'CONFIRMED'} />
                  <div className="flex flex-wrap gap-space-xs">
                    <StatusBadge label={`${item.priority} PRIORITY`} variant={item.priority === 'CRITICAL' || item.priority === 'HIGH' ? 'critical' : 'warning'} />
                    <StatusBadge label={item.status} variant={item.status === 'CONFIRMED' ? 'critical' : 'warning'} />
                  </div>
                </div>
                <PatientIdentity fullName={item.beneficiary.fullName} age={item.beneficiary.age} gender={item.beneficiary.gender} syntheticId={item.beneficiary.id} village={item.beneficiary.village} assignedAshaName={item.beneficiary.assignedAshaName} />
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">{item.careGap?.title ?? 'Referral arrival acknowledgement pending'}</h2>
                <dl className="grid gap-space-sm rounded-lg bg-surface-container-low p-space-sm sm:grid-cols-2">
                  <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Expected step</dt><dd className="font-body-sm text-body-sm font-semibold text-on-surface">{item.expectedStep}</dd></div>
                  <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Current state</dt><dd className="font-body-sm text-body-sm text-on-surface">{item.actualState}</dd></div>
                  <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Time / state condition</dt><dd className="font-body-sm text-body-sm text-on-surface">{item.timeStateCondition}</dd></div>
                  <div><dt className="font-label-sm text-label-sm text-on-surface-variant">Confidence · reason</dt><dd className="font-body-sm text-body-sm text-on-surface">{item.confidence} · <span className="font-code-xs text-code-xs">{item.reasonCode}</span></dd></div>
                </dl>
                <div>
                  <span className="font-label-sm text-label-sm font-semibold text-primary">Operational explanation</span>
                  <p className="mt-0.5 font-body-sm text-body-sm text-on-surface">{item.explanation}</p>
                </div>
                {item.predictedStep && (
                  <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-space-sm">
                    <div className="flex flex-wrap items-center justify-between gap-space-xs"><span className="font-label-sm text-label-sm font-bold text-primary">NEXT STEP AT RISK</span><StatusBadge label={`${item.riskLevel} OPERATIONAL RISK`} variant={item.riskLevel === 'HIGH' ? 'critical' : 'warning'} /></div>
                    <p className="mt-space-xs font-body-sm text-body-sm font-semibold text-on-surface">{item.predictedStep}</p>
                    <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{item.predictionReason}</p>
                  </div>
                )}
                <div>
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">Evidence / source</span>
                  <ul className="mt-space-xs space-y-1 font-body-sm text-body-sm text-on-surface">
                    {item.evidence.map((source) => <li key={`${source.sourceType}-${source.sourceId}`} className="break-words"><span className="font-code-xs text-code-xs">{source.sourceId}</span> · {source.label}: {source.detail}</li>)}
                  </ul>
                </div>
                <div className="rounded-lg bg-surface-container-low p-space-sm"><span className="font-label-sm text-label-sm font-semibold text-primary">Suggested action · human review</span><p className="mt-0.5 font-body-sm text-body-sm text-on-surface">{item.suggestedAction}</p></div>
                <SecondaryButton icon="person_search" onClick={() => navigate(ROUTE_PATHS.frontlinePatient(item.beneficiary.id))}>Open Patient Profile</SecondaryButton>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CareGapCenterPage;
