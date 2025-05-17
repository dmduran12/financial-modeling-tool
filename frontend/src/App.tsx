import { useEffect, useState } from 'react';

interface KPI {
  name: string;
  value: number;
}

export default function App() {
  const [kpis, setKpis] = useState<KPI[]>([]);

  useEffect(() => {
    fetch('/api/kpis')
      .then(res => res.json())
      .then(setKpis)
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">SMB Program Modeling</h1>
      <ul className="grid grid-cols-2 gap-4">
        {kpis.map(kpi => (
          <li key={kpi.name} className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-500">{kpi.name}</div>
            <div className="text-xl font-medium">{kpi.value}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
