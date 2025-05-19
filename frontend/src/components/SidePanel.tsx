import { ReactNode } from 'react';
import Card from './Card';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function SidePanel({ children, className = '' }: Props) {
  return <Card className={`space-y-4 ${className}`}>{children}</Card>;
}
