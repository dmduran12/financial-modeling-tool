import { useEffect } from 'react';
import Dashboard from './Dashboard';
import Header from './components/Header';
import { setupChartDefaults } from './chartConfig';

export default function App() {
  useEffect(() => {
    setupChartDefaults();
  }, []);

  return (
    <div className="max-w-[72rem] mx-auto px-6 space-y-6">
      <Header />
      <Dashboard />
    </div>
  );
}
