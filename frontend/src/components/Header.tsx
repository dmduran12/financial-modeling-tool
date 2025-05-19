import ApiStatus from '../ApiStatus';

export default function Header() {
  return (
    <header className="flex items-center justify-between py-4">
      <div>
        <h1 className="font-bold text-[32px] leading-[1.2]">SMB Program Modeling</h1>
        <p className="font-medium text-sm leading-[1.4] text-[var(--color-neutral-500)]">Carbon Removal Subscription Service</p>
      </div>
      <ApiStatus />
    </header>
  );
}
