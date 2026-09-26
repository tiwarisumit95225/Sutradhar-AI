import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../../context/ShellContext';

export interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  className?: string;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onRoleChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const roleLabel =
    currentRole === 'FRONTLINE_ASHA'
      ? 'Frontline (ASHA)'
      : 'Facility (Clinician)';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 px-space-sm py-1.5 rounded bg-surface-container-highest text-on-secondary-fixed active:bg-secondary-container transition-colors min-h-[48px] cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="material-symbols-outlined text-[18px] text-primary">
          switch_account
        </span>
        <span className="font-label-sm text-label-sm font-semibold max-w-[85px] sm:max-w-none truncate">
          {roleLabel}
        </span>
        <span className="material-symbols-outlined text-[16px] text-outline">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1 w-52 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 py-1 z-50 overflow-hidden"
        >
          <div className="px-3 py-1.5 text-code-xs font-bold text-on-surface-variant uppercase border-b border-outline-variant/20">
            Switch Operating Persona
          </div>
          <button
            type="button"
            role="option"
            aria-selected={currentRole === 'FRONTLINE_ASHA'}
            onClick={() => {
              onRoleChange('FRONTLINE_ASHA');
              setIsOpen(false);
            }}
            className={`w-full min-h-[48px] text-left px-3 py-2 text-label-sm flex items-center justify-between hover:bg-surface-container transition-colors ${
              currentRole === 'FRONTLINE_ASHA'
                ? 'bg-surface-container-high font-bold text-primary'
                : 'text-on-surface'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-semibold">Frontline (ASHA)</span>
              <span className="text-code-xs text-on-surface-variant font-normal">
                Frontline role
              </span>
            </div>
            {currentRole === 'FRONTLINE_ASHA' && (
              <span className="material-symbols-outlined text-[18px] text-primary">
                check
              </span>
            )}
          </button>
          <button
            type="button"
            role="option"
            aria-selected={currentRole === 'FACILITY_CLINICIAN'}
            onClick={() => {
              onRoleChange('FACILITY_CLINICIAN');
              setIsOpen(false);
            }}
            className={`w-full min-h-[48px] text-left px-3 py-2 text-label-sm flex items-center justify-between hover:bg-surface-container transition-colors ${
              currentRole === 'FACILITY_CLINICIAN'
                ? 'bg-surface-container-high font-bold text-primary'
                : 'text-on-surface'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-semibold">Facility (Clinician)</span>
              <span className="text-code-xs text-on-surface-variant font-normal">
                Facility role
              </span>
            </div>
            {currentRole === 'FACILITY_CLINICIAN' && (
              <span className="material-symbols-outlined text-[18px] text-primary">
                check
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
