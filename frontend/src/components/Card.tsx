import { ReactNode } from 'react';

interface Props { children: ReactNode; className?: string; }

export default function Card({ children, className = '' }: Props) {
  return (
    <div className={`bg-[var(--color-neutral-100)] border border-[var(--color-neutral-200)] rounded-lg p-5 ${className}`}>
      {children}
    </div>
  );
}
