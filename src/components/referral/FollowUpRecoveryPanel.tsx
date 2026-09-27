import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, PrimaryButton, SecondaryButton, StatusBadge } from '../common';
import { useShell } from '../../context/ShellContext';
import type { ReferralRecord } from '../../types';
import { ROUTE_PATHS } from '../../routes/paths';

const PLAYBOOK = ['Review referral status', 'Contact / re-engage patient', 'Confirm next care option', 'Re-refer if required'];

const FollowUpRecoveryPanel: React.FC<{ referral: ReferralRecord; careGapId?: string }> = ({ referral, careGapId }) => {
  const shell = useShell();
  const navigate = useNavigate();
  const lifecycle = shell.referralLifecycle[referral.id];
  if (lifecycle?.state !== 'TIMEOUT') return null;
  const record = shell.followUps[referral.id];
  const status = record?.status ?? 'REQUIRED';
  const start = () => {
    if (shell.startFollowUp(referral.id, careGapId)) shell.showToast('Follow-up action recorded — simulated', 'No patient contact is asserted.', 'success');
    else shell.showToast('Action unavailable', 'Follow-up can start only for a timed-out referral.', 'alert');
  };
  const complete = () => {
    if (shell.completeFollowUp(referral.id)) shell.showToast('Follow-up completed — simulated', 'Choose a facility if a new referral is required.', 'success');
    else shell.showToast('Action unavailable', 'Follow-up must be in progress before it can be completed.', 'alert');
  };

  return <Card variant="alert" padding="md" className="gap-space-sm" aria-labelledby={`follow-up-${referral.id}`}>
    <div className="flex flex-wrap items-center justify-between gap-space-xs"><h3 id={`follow-up-${referral.id}`} className="font-headline-sm text-headline-sm font-bold text-on-surface">Follow-up</h3><StatusBadge label={`FOLLOW-UP ${status.replace('_', ' ')} · SIMULATED`} variant={status === 'COMPLETED' ? 'success' : 'warning'} /></div>
    <p className="font-body-sm text-on-surface"><strong>Reason:</strong> Referral timed out before arrival was confirmed.</p>
    <p className="font-body-sm text-on-surface"><strong>Assigned worker:</strong> {record?.assignedWorker ?? 'Meena Bai'}</p>
    <p className="font-body-sm text-on-surface-variant"><strong>Next action:</strong> Contact / re-engage patient and confirm next care option. This prototype records no real contact.</p>
    <div className="rounded-lg bg-surface-container-low p-space-sm"><h4 className="font-label-md text-label-md font-bold text-on-surface">Follow-up playbook · operational</h4><ol className="mt-space-xs list-decimal space-y-1 pl-5 font-body-sm text-on-surface">{PLAYBOOK.map((step) => <li key={step}>{step}</li>)}</ol></div>
    {status === 'REQUIRED' && <PrimaryButton icon="pending_actions" onClick={start}>Start Follow-up</PrimaryButton>}
    {status === 'IN_PROGRESS' && <PrimaryButton icon="task_alt" onClick={complete}>Complete Follow-up</PrimaryButton>}
    {status === 'COMPLETED' && (record?.reReferralId
      ? <SecondaryButton icon="open_in_new" onClick={() => navigate(ROUTE_PATHS.frontlineReferral(record.reReferralId!))}>Open Re-referral · {record.reReferralId}</SecondaryButton>
      : <PrimaryButton icon="local_hospital" onClick={() => navigate(`${ROUTE_PATHS.frontlineReferral(referral.id)}?reReferFrom=${encodeURIComponent(referral.id)}`)}>Re-refer Patient</PrimaryButton>)}
    <p className="font-code-xs text-code-xs text-on-surface-variant">SYNTHETIC DATA · SIMULATED ACTION · PROTOTYPE</p>
  </Card>;
};

export default FollowUpRecoveryPanel;
