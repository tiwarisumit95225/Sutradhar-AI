import React from 'react';

export interface PatientIdentityProps {
  fullName: string;
  initials?: string;
  age?: number;
  gender?: 'FEMALE' | 'MALE' | 'OTHER' | string;
  syntheticId?: string;
  syntheticRchId?: string;
  village?: string;
  assignedAshaName?: string;
  subtext?: string;
  avatarBgColor?: string;
  className?: string;
}

export const PatientIdentity: React.FC<PatientIdentityProps> = ({
  fullName,
  initials,
  age,
  gender,
  syntheticId,
  syntheticRchId,
  village,
  assignedAshaName,
  subtext,
  avatarBgColor = 'bg-secondary-container text-on-secondary-fixed',
  className = '',
}) => {
  const displayInitials =
    initials ||
    fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

  const demographicTag = age && gender ? `${age}y • ${gender[0]}` : null;

  return (
    <div className={`flex items-center gap-space-sm min-w-0 ${className}`}>
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-headline-sm text-headline-sm font-bold flex-shrink-0 shadow-xs ${avatarBgColor}`}
      >
        {displayInitials}
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">
            {fullName}
          </span>
          {demographicTag && (
            <span className="font-code-xs text-code-xs bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded">
              {demographicTag}
            </span>
          )}
          {syntheticId && (
            <span className="font-code-xs text-code-xs bg-primary-fixed text-on-primary-fixed px-1.5 py-0.5 rounded font-mono font-medium">
              ID: {syntheticId}
            </span>
          )}
        </div>

        <span className="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
          {subtext
            ? subtext
            : [
                syntheticRchId ? `RCH: ${syntheticRchId}` : null,
                village,
                assignedAshaName ? `ASHA: ${assignedAshaName}` : null,
              ]
                .filter(Boolean)
                .join(' • ')}
        </span>
      </div>
    </div>
  );
};
