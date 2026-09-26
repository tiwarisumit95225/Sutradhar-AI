import React, { ReactNode } from 'react';

export type CardVariant = 'default' | 'alert' | 'success' | 'primary' | 'inset';

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-space-sm',
    md: 'p-space-md',
    lg: 'p-space-lg',
  };

  const variantStyles: Record<CardVariant, string> = {
    default:
      'bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30',
    alert:
      'bg-surface-container-lowest rounded-xl shadow-sm border-l-4 border-error border-y border-r border-outline-variant/30',
    success:
      'bg-surface-container-lowest rounded-xl shadow-sm border-l-4 border-tertiary border-y border-r border-outline-variant/30',
    primary:
      'bg-surface-container-lowest rounded-xl shadow-sm border-l-4 border-primary border-y border-r border-outline-variant/30',
    inset:
      'bg-surface-container-low rounded-lg border border-outline-variant/20',
  };

  return (
    <div
      onClick={onClick}
      className={`flex flex-col relative transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
};
