import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'FRONTLINE_ASHA' | 'FACILITY_CLINICIAN';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type?: 'success' | 'alert' | 'info';
}

export interface ShellContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  toggleOnline: () => void;
  toast: ToastMessage | null;
  showToast: (title: string, description: string, type?: 'success' | 'alert' | 'info') => void;
  hideToast: () => void;
}

const ShellContext = createContext<ShellContextType | undefined>(undefined);

export const ShellProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('FRONTLINE_ASHA');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const toggleOnline = () => setIsOnline((prev) => !prev);

  const showToast = (title: string, description: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setToast({
      id: Date.now().toString(),
      title,
      description,
      type,
    });
  };

  const hideToast = () => setToast(null);

  return (
    <ShellContext.Provider
      value={{
        role,
        setRole,
        activeTab,
        setActiveTab,
        isOnline,
        toggleOnline,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
};

export const useShell = (): ShellContextType => {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
};
