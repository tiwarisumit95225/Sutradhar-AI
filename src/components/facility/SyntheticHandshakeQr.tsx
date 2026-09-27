import React from 'react';

interface SyntheticHandshakeQrProps {
  referralId: string;
  passcode: string;
}

const SIZE = 21;

const finderValue = (x: number, y: number, originX: number, originY: number): boolean | undefined => {
  const dx = x - originX;
  const dy = y - originY;
  if (dx < 0 || dx > 6 || dy < 0 || dy > 6) return undefined;
  return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
};

/** A deterministic, visual-only QR-style matrix. It is deliberately not encoded/scannable. */
export const SyntheticHandshakeQr: React.FC<SyntheticHandshakeQrProps> = ({ referralId, passcode }) => {
  const seed = `${referralId}|${passcode}`.split('').reduce((total, character, index) => total + character.charCodeAt(0) * (index + 1), 0);
  const modules: Array<{ x: number; y: number }> = [];

  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const finder = finderValue(x, y, 0, 0)
        ?? finderValue(x, y, SIZE - 7, 0)
        ?? finderValue(x, y, 0, SIZE - 7);
      const timing = ((x === 6 && y >= 8 && y <= 12) || (y === 6 && x >= 8 && x <= 12))
        ? (x + y) % 2 === 0
        : undefined;
      const filled = finder ?? timing ?? ((seed + x * 17 + y * 31 + x * y * 7) % 11 < 5);
      if (filled) modules.push({ x, y });
    }
  }

  return (
    <div
      role="img"
      aria-label={`Visual-only synthetic QR-style pattern for referral ${referralId} and passcode ${passcode}. It is not scannable.`}
      className="mx-auto w-full max-w-[240px] rounded-lg border-4 border-on-surface bg-white p-space-sm"
    >
      <svg viewBox="0 0 230 230" className="block h-auto w-full" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
        <rect width="230" height="230" fill="#ffffff" />
        {modules.map(({ x, y }) => (
          <rect key={`${x}-${y}`} x={10 + x * 10} y={10 + y * 10} width="10" height="10" fill="#0b1c30" />
        ))}
      </svg>
      <span className="mt-space-xs block text-center font-code-xs text-code-xs font-bold text-on-surface">SYNTHETIC QR · VISUAL ONLY</span>
    </div>
  );
};

export default SyntheticHandshakeQr;
