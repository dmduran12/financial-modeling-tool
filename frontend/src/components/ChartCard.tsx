import { ReactNode } from 'react';
import Card from './Card';

interface Props {
  title: string;
  children: ReactNode;
  legend?: string | ReactNode;
}

export default function ChartCard({ title, children, legend }: Props) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="content-header">{title}</h3>
        {legend && (
          <div
            className="text-xs font-mono text-[var(--squid-ink)]"
            {...(typeof legend === 'string' ? { dangerouslySetInnerHTML: { __html: legend } } : {})}
          >
            {typeof legend === 'string' ? null : legend}
          </div>
        )}
      </div>
      <Card className="relative overflow-hidden">
        <div className="h-64 relative">{children}</div>
      </Card>
    </div>
  );
}
