import { ReactNode } from 'react';
import Card from './Card';

export default function SidePanel({ children }: { children: ReactNode }) {
  return <Card className="space-y-4">{children}</Card>;
}
