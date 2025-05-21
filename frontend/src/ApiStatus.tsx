import { useEffect, useState } from "react";

export default function ApiStatus() {
  const [status, setStatus] = useState<"unknown" | "ok" | "error">("unknown");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.status === "ok") setStatus("ok");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, []);

  const label =
    status === "ok"
      ? "API Online"
      : status === "error"
        ? "API Offline"
        : "Checking API...";
  const pillClasses =
    "px-2 py-1 text-xs font-medium rounded-full " +
    (status === "ok"
      ? "bg-[var(--success-500)] text-[var(--color-neutral-900)]"
      : status === "error"
        ? "bg-[var(--error-500)] text-white"
        : "bg-[var(--color-neutral-200)] text-[var(--color-neutral-900)]");

  const icon = status === "ok" ? "✓" : status === "error" ? "✕" : "?";
  const iconClasses =
    "flex items-center justify-center w-5 h-5 rounded-full text-xs ml-2 " +
    (status === "ok"
      ? "bg-[var(--success-500)] text-[var(--color-squid-ink)]"
      : status === "error"
        ? "bg-[var(--error-500)] text-[var(--color-pearl)]"
        : "bg-[var(--color-neutral-200)] text-[var(--color-neutral-900)]");

  return (
    <span className="flex items-center">
      <span className={pillClasses}>{label}</span>
      <span className={iconClasses}>{icon}</span>
    </span>
  );
}
