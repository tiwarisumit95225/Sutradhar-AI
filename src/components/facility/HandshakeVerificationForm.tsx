import React, { useEffect, useState } from 'react';
import { PrimaryButton } from '../common';
import { useShell } from '../../context/ShellContext';
import type { ReferralLifecycleState, ReferralRecord } from '../../types';

interface HandshakeVerificationFormProps {
  referral: ReferralRecord;
  lifecycleState: ReferralLifecycleState;
  compact?: boolean;
}

/** Shared credential-entry UI; ShellContext remains the sole verification authority. */
const HandshakeVerificationForm: React.FC<HandshakeVerificationFormProps> = ({ referral, lifecycleState, compact = false }) => {
  const shell = useShell();
  const [token, setToken] = useState(referral.id);
  const [passcode, setPasscode] = useState(referral.handshake.tokenCode);
  const [error, setError] = useState('');

  useEffect(() => {
    setToken(referral.id);
    setPasscode(referral.handshake.tokenCode);
    setError('');
  }, [referral.id, referral.handshake.tokenCode]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = shell.verifyReferralHandshake(referral.id, token, passcode);
    if (!result || !result.ok) {
      const message = !result
        ? 'Referral not found. No verification was performed.'
        : result.reason === 'CREDENTIALS_MISMATCH'
          ? 'The demo referral ID or passcode did not match. Referral state was not changed.'
          : result.reason === 'REACH_PENDING_REQUIRED'
            ? 'Verification is available after the referral enters REACH PENDING.'
            : result.reason === 'REFERRAL_TIMED_OUT'
              ? 'This referral timed out. The lifecycle cannot return to REACHED.'
              : 'This referral has advanced beyond REACH. Handshake verification is closed.';
      setError(message);
      shell.showToast('Verification failed', message, 'alert');
      return;
    }
    setError('');
    shell.showToast(
      result.alreadyVerified ? 'Handshake already verified' : 'Synthetic handshake verified',
      result.alreadyReached
        ? 'REACH was already recorded; the token check is recorded in shared demo lifecycle history.'
        : 'The demo credentials matched. REACH is simulated; this is not live facility verification.',
      'success'
    );
  };

  if (lifecycleState === 'TIMEOUT' || lifecycleState === 'CARE_RECEIVED' || lifecycleState === 'CLOSED'
    || (lifecycleState === 'REACHED' && referral.handshake.arrivalAcknowledged)) return null;

  return (
    <form className={compact ? 'flex flex-col gap-space-xs' : 'border-t border-outline-variant/30 pt-space-sm'} onSubmit={handleSubmit}>
      <h3 className="font-label-lg text-label-lg text-on-surface">Receiving facility verification preview</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant">Enter the synthetic referral ID and passcode. This does not authenticate a real facility or verify real attendance.</p>
      <div className="grid min-w-0 grid-cols-1 gap-space-xs sm:grid-cols-2">
        <label className="min-w-0 font-label-sm text-label-sm text-on-surface">
          Referral token
          <input autoComplete="off" className="mt-1 min-h-[48px] w-full min-w-0 rounded-lg border border-outline bg-white px-space-sm font-code-sm text-code-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" value={token} onChange={(event) => { setToken(event.target.value); setError(''); }} />
        </label>
        <label className="min-w-0 font-label-sm text-label-sm text-on-surface">
          Handshake passcode
          <input autoComplete="off" className="mt-1 min-h-[48px] w-full min-w-0 rounded-lg border border-outline bg-white px-space-sm font-code-sm text-code-sm text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" value={passcode} onChange={(event) => { setPasscode(event.target.value); setError(''); }} />
        </label>
      </div>
      {error && <p role="alert" className="rounded-lg bg-error-container p-space-sm font-body-sm text-body-sm font-semibold text-on-error-container">{error}</p>}
      <PrimaryButton className={compact ? '' : 'mt-space-xs'} icon="verified_user" type="submit">Verify Handshake · Simulated</PrimaryButton>
    </form>
  );
};

export default HandshakeVerificationForm;
