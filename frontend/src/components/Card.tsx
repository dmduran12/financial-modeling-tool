import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: Props) {
  return (
    <div className={`bg-[var(--color-neutral-50)] rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
}
