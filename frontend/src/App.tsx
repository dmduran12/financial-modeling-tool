import Dashboard from './Dashboard';
import ApiStatus from './ApiStatus';

export default function App() {
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex justify-end">
        <ApiStatus />
      </div>
      <Dashboard />
    </div>
  );
}
