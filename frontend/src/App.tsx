import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import Header from "./components/Header";
import { setupChartDefaults } from "./chartConfig";
import { ScenarioContext } from "./ScenarioContext";
import type { FormState } from "./types";
import {
  DEFAULT_TIER_REVENUES,
  DEFAULT_MARKETING_BUDGET,
  DEFAULT_CONVERSION_RATE,
  DEFAULT_MONTHLY_CHURN_RATE,
  DEFAULT_WACC,
  DEFAULT_PROJECTION_MONTHS,
  DEFAULT_OPERATING_EXPENSE_RATE,
  DEFAULT_FIXED_COSTS,
  DEFAULT_INITIAL_INVESTMENT,
  DEFAULT_CTR,
  DEFAULT_COST_OF_CARBON,
  DEFAULT_TONS_PER_CUSTOMER,
} from "./model/constants";

export default function App() {
  useEffect(() => {
    setupChartDefaults();
  }, []);

  const [form, setForm] = useState<FormState>({
    tier1_revenue: DEFAULT_TIER_REVENUES[0],
    tier2_revenue: DEFAULT_TIER_REVENUES[1],
    tier3_revenue: DEFAULT_TIER_REVENUES[2],
    tier4_revenue: DEFAULT_TIER_REVENUES[3],
    marketing_budget: DEFAULT_MARKETING_BUDGET,
    conversion_rate: DEFAULT_CONVERSION_RATE,
    ctr: DEFAULT_CTR,
    churn_rate_smb: DEFAULT_MONTHLY_CHURN_RATE,
    wacc: DEFAULT_WACC,
    projection_months: DEFAULT_PROJECTION_MONTHS,
    operating_expense_rate: DEFAULT_OPERATING_EXPENSE_RATE,
    fixed_costs: DEFAULT_FIXED_COSTS,
    initial_investment: DEFAULT_INITIAL_INVESTMENT,
    cost_of_carbon: DEFAULT_COST_OF_CARBON,
    carbon1: DEFAULT_TONS_PER_CUSTOMER[0],
    carbon2: DEFAULT_TONS_PER_CUSTOMER[1],
    carbon3: DEFAULT_TONS_PER_CUSTOMER[2],
    carbon4: DEFAULT_TONS_PER_CUSTOMER[3],
  });

  return (
    <ScenarioContext.Provider value={{ form, setForm }}>
      <div className="max-w-[72rem] mx-auto px-6 space-y-6">
        <Header />
        <Dashboard />
      </div>
    </ScenarioContext.Provider>
  );
}
