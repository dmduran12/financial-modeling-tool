import { ReactNode } from 'react';
import Card from './Card';

interface Props { title: string; children: ReactNode; }

export default function ChartCard({ title, children }: Props) {
  return (
    <Card className="relative">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div className="h-64 relative">{children}</div>
    </Card>
  );
}
