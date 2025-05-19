import { ReactNode } from 'react';
import Card from './Card';

interface Props { title: string; children: ReactNode; }

export default function ChartCard({ title, children }: Props) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2 font-sans">{title}</h3>
      <Card className="relative">
        <div className="h-64 relative">{children}</div>
      </Card>
    </div>
  );
}
