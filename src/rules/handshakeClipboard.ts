export interface ClipboardWriter {
  writeText: (text: string) => Promise<void>;
}

/** Copies the synthetic referral id and passcode together; false signals a safe manual-copy fallback. */
export const copyHandshakeToken = async (
  referralId: string,
  passcode: string,
  writer?: ClipboardWriter
): Promise<boolean> => {
  try {
    const clipboard = writer ?? (typeof navigator !== 'undefined' ? navigator.clipboard : undefined);
    if (!clipboard?.writeText) return false;
    await clipboard.writeText(`${referralId}\n${passcode}`);
    return true;
  } catch {
    return false;
  }
};
