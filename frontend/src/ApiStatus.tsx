import { useEffect, useState } from 'react';

export default function ApiStatus() {
  const [status, setStatus] = useState<'unknown' | 'ok' | 'error'>('unknown');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => {
        if (data.status === 'ok') setStatus('ok');
        else setStatus('error');
      })
      .catch(() => setStatus('error'));
  }, []);

  const color = status === 'ok' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-gray-500';
  const label = status === 'ok' ? 'API Online' : status === 'error' ? 'API Offline' : 'Checking API...';

  return <div className={`text-sm font-medium ${color}`}>{label}</div>;
}
