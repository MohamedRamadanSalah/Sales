'use client';

import { ReactNode } from 'react';

type BadgeVariant =
  | 'default'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'sold'
  | 'rented'
  | 'inactive';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--color-bg-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
  pending:
    'bg-orange-50 text-orange-700 border border-orange-200',
  approved:
    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected:
    'bg-red-50 text-red-700 border border-red-200',
  sold:
    'bg-purple-50 text-purple-700 border border-purple-200',
  rented:
    'bg-blue-50 text-blue-700 border border-blue-200',
  inactive:
    'bg-gray-100 text-gray-500 border border-gray-200',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
