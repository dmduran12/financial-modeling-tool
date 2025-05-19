import { useEffect, useState } from 'react';

export default function ApiStatus() {
  const [status, setStatus] = useState<'unknown' | 'ok' | 'error'>('unknown');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.status === 'ok') setStatus('ok');
        else setStatus('error');
      })
      .catch(() => setStatus('error'));
  }, []);

  const label =
    status === 'ok' ? 'API Online' : status === 'error' ? 'API Offline' : 'Checking API...';
  const classes =
    'px-2 py-1 text-xs font-medium rounded-full ' +
    (status === 'ok'
      ? 'bg-[var(--success-500)] text-[var(--color-neutral-900)]'
      : status === 'error'
      ? 'bg-[var(--error-500)] text-white'
      : 'bg-[var(--color-neutral-200)] text-[var(--color-neutral-900)]');

  return <span className={classes}>{label}</span>;
}
