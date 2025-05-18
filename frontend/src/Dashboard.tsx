import { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_TIER_REVENUES,
  DEFAULT_MARKETING_BUDGET,
  DEFAULT_COST_PER_LEAD,
  DEFAULT_CONVERSION_RATE,
  DEFAULT_MONTHLY_CHURN_RATE,
  DEFAULT_WACC,
  DEFAULT_PROJECTION_MONTHS,
  DEFAULT_INITIAL_INVESTMENT,
  DEFAULT_OPERATING_EXPENSE_RATE,
  DEFAULT_FIXED_COSTS,
} from './model/constants';
import { runSubscriptionModel } from './model/subscription';
import { calculateFinancialMetrics } from './model/finance';
import { Chart } from 'chart.js/auto';

interface FormState {
  tier1_revenue: number;
  tier2_revenue: number;
  tier3_revenue: number;
  tier4_revenue: number;
  marketing_budget: number;
  cpl: number;
  conversion_rate: number;
  churn_rate_smb: number;
  wacc: number;
  projection_months: number;
  initial_investment: number;
  operating_expense_rate: number;
  fixed_costs: number;
}

interface Metrics {
  total_mrr: number;
  active_customers: number;
  annual_revenue: number;
  ltv: number;
  new_cust_month: number;
  npv: number;
  paybackMonths: number | null;
}

export default function Dashboard() {
  const [form, setForm] = useState<FormState>({
    tier1_revenue: DEFAULT_TIER_REVENUES[0],
    tier2_revenue: DEFAULT_TIER_REVENUES[1],
    tier3_revenue: DEFAULT_TIER_REVENUES[2],
    tier4_revenue: DEFAULT_TIER_REVENUES[3],
    marketing_budget: DEFAULT_MARKETING_BUDGET,
    cpl: DEFAULT_COST_PER_LEAD,
    conversion_rate: DEFAULT_CONVERSION_RATE,
    churn_rate_smb: DEFAULT_MONTHLY_CHURN_RATE,
    wacc: DEFAULT_WACC,
    projection_months: DEFAULT_PROJECTION_MONTHS,
    initial_investment: DEFAULT_INITIAL_INVESTMENT,
    operating_expense_rate: DEFAULT_OPERATING_EXPENSE_RATE,
    fixed_costs: DEFAULT_FIXED_COSTS,
  });

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const mrrRef = useRef<HTMLCanvasElement>(null);
  const custRef = useRef<HTMLCanvasElement>(null);
  const tierRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<{ mrr?: Chart; cust?: Chart; tier?: Chart }>({});

  useEffect(() => {
    const modelInput = {
      tier_revenues: [
        form.tier1_revenue,
        form.tier2_revenue,
        form.tier3_revenue,
        form.tier4_revenue,
      ],
      marketing_budget: form.marketing_budget,
      cpl: form.cpl,
      conversion_rate: form.conversion_rate,
      churn_rate_smb: form.churn_rate_smb,
      wacc: form.wacc,
      initial_cac_smb: 0,
      projection_months: form.projection_months,
      operating_expense_rate: form.operating_expense_rate,
      fixed_costs: form.fixed_costs,
    };

    const expenses = {
      operatingExpenseRate: form.operating_expense_rate,
      fixedCosts: form.fixed_costs,
    };

    const results = runSubscriptionModel(modelInput);
    const financial = calculateFinancialMetrics(
      results,
      form.initial_investment,
      expenses,
      form.wacc
    );

    setMetrics({
      total_mrr: results.metrics.total_mrr,
      active_customers: results.metrics.total_customers,
      annual_revenue: results.metrics.annual_revenue,
      ltv: results.metrics.customer_ltv,
      new_cust_month: results.metrics.new_customers_monthly,
      npv: financial.npv,
      paybackMonths: financial.paybackMonths,
    });

    const labels = results.projections.monthLabels;
    const mrrArr = results.projections.mrr_by_month;
    const custArr = results.projections.customers_by_month;
    const tierArr = results.projections.tier_revenues_end;

    if (mrrRef.current) {
      const ctx = mrrRef.current.getContext('2d');
      if (ctx) {
        if (!chartInstances.current.mrr) {
          chartInstances.current.mrr = new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [{ data: mrrArr, borderColor: '#486BFE', backgroundColor: '#486BFE20', fill: true, tension: 0.3 }],
            },
            options: { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false },
          });
        } else {
          const ch = chartInstances.current.mrr;
          ch.data.labels = labels;
          (ch.data.datasets[0].data as number[]) = mrrArr;
          ch.update();
        }
      }
    }

    if (custRef.current) {
      const ctx = custRef.current.getContext('2d');
      if (ctx) {
        if (!chartInstances.current.cust) {
          chartInstances.current.cust = new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [{ data: custArr, borderColor: '#8262FF', backgroundColor: '#8262FF20', fill: true, tension: 0.3 }],
            },
            options: { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false },
          });
        } else {
          const ch = chartInstances.current.cust;
          ch.data.labels = labels;
          (ch.data.datasets[0].data as number[]) = custArr;
          ch.update();
        }
      }
    }

    if (tierRef.current) {
      const ctx = tierRef.current.getContext('2d');
      if (ctx) {
        if (!chartInstances.current.tier) {
          chartInstances.current.tier = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'],
              datasets: [{ data: tierArr, backgroundColor: ['#486BFE', '#8262FF', '#D19BEA', '#6EE26A'] }],
            },
            options: { responsive: true, maintainAspectRatio: false },
          });
        } else {
          const ch = chartInstances.current.tier;
          (ch.data.datasets[0].data as number[]) = tierArr;
          ch.update();
        }
      }
    }
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">SMB Program Modeling</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="p-4 bg-white rounded shadow">
            <h2 className="font-medium mb-2">Revenue Tiers</h2>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="mb-2">
                <label className="block text-sm">Tier {n} Revenue</label>
                <input
                  type="number"
                  name={`tier${n}_revenue`}
                  value={form[`tier${n}_revenue` as keyof FormState] as number}
                  onChange={handleChange}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            ))}
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="font-medium mb-2">Marketing</h2>
            <div className="mb-2">
              <label className="block text-sm">Marketing Budget</label>
              <input type="number" name="marketing_budget" value={form.marketing_budget} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
            </div>
            <div className="mb-2">
              <label className="block text-sm">Cost Per Lead</label>
              <input type="number" name="cpl" value={form.cpl} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
            </div>
            <div className="mb-2">
              <label className="block text-sm">Conversion Rate (%)</label>
              <input type="number" name="conversion_rate" value={form.conversion_rate} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
            </div>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="font-medium mb-2">Financial</h2>
            <div className="mb-2">
              <label className="block text-sm">Churn Rate (%)</label>
              <input type="number" name="churn_rate_smb" value={form.churn_rate_smb} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
            </div>
            <div className="mb-2">
              <label className="block text-sm">WACC (%)</label>
              <input type="number" name="wacc" value={form.wacc} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
            </div>
            <div className="mb-2">
              <label className="block text-sm">Projection Months</label>
              <input type="number" name="projection_months" value={form.projection_months} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
            </div>
            <div className="mb-2">
              <label className="block text-sm">Initial Investment</label>
              <input type="number" name="initial_investment" value={form.initial_investment} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
            </div>
            <div className="mb-2">
              <label className="block text-sm">Operating Expense Rate (%)</label>
              <input type="number" name="operating_expense_rate" value={form.operating_expense_rate} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
            </div>
            <div className="mb-2">
              <label className="block text-sm">Fixed Costs</label>
              <input type="number" name="fixed_costs" value={form.fixed_costs} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {metrics && (
              <>
                <div className="p-4 bg-white rounded shadow text-center">
                  <div className="text-sm text-gray-500">Total MRR</div>
                  <div className="text-xl font-medium">${metrics.total_mrr.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-white rounded shadow text-center">
                  <div className="text-sm text-gray-500">Active Customers</div>
                  <div className="text-xl font-medium">{metrics.active_customers}</div>
                </div>
                <div className="p-4 bg-white rounded shadow text-center">
                  <div className="text-sm text-gray-500">Annual Revenue</div>
                  <div className="text-xl font-medium">${metrics.annual_revenue.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-white rounded shadow text-center">
                  <div className="text-sm text-gray-500">Customer LTV</div>
                  <div className="text-xl font-medium">${metrics.ltv.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-white rounded shadow text-center">
                  <div className="text-sm text-gray-500">New Customers (Month 1)</div>
                  <div className="text-xl font-medium">{metrics.new_cust_month}</div>
                </div>
                <div className="p-4 bg-white rounded shadow text-center">
                  <div className="text-sm text-gray-500">NPV</div>
                  <div className="text-xl font-medium">${metrics.npv.toFixed(0)}</div>
                </div>
              </>
            )}
          </div>
          <div className="p-4 bg-white rounded shadow" style={{ height: '200px' }}>
            <canvas ref={mrrRef}></canvas>
          </div>
          <div className="p-4 bg-white rounded shadow" style={{ height: '200px' }}>
            <canvas ref={custRef}></canvas>
          </div>
          <div className="p-4 bg-white rounded shadow" style={{ height: '200px' }}>
            <canvas ref={tierRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}
