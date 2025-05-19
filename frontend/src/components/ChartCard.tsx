import { ReactNode } from 'react';
import Card from './Card';

interface Props { title: string; children: ReactNode; loading?: boolean; }

export default function ChartCard({ title, children, loading }: Props) {
  return (
    <Card className="relative">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div className="h-64 relative">{children}</div>
      {loading && (
        <div className="absolute inset-0 bg-white/40 flex items-center justify-center text-sm font-medium">
          Updating...
        </div>
      )}
    </Card>
  );
}
