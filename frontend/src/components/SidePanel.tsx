import { ReactNode } from 'react';
interface Props {
  children: ReactNode;
  className?: string;
}

export default function SidePanel({ children, className = '' }: Props) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}
