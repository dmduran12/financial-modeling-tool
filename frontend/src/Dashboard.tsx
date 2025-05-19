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
import KPIChip from './components/KPIChip';
import SidePanel from './components/SidePanel';
import InputRow from './components/InputRow';
import ChartCard from './components/ChartCard';
import { formatCurrency, formatNumberShort } from './utils/format';

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
  const [loading, setLoading] = useState(false);
  const mrrRef = useRef<HTMLCanvasElement>(null);
  const custRef = useRef<HTMLCanvasElement>(null);
  const tierRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<{ mrr?: Chart; cust?: Chart; tier?: Chart }>({});

  useEffect(() => {
    setLoading(true);
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
    const tierArr = results.projections.tier_revenue_by_month;

    if (mrrRef.current) {
      const ctx = mrrRef.current.getContext('2d');
      if (ctx) {
        if (!chartInstances.current.mrr) {
          chartInstances.current.mrr = new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [{ data: mrrArr, borderColor: '#4A47DC' }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: { x: {}, y: {} },
            },
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
              datasets: [{ data: custArr, borderColor: '#BF7DC4' }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: { x: {}, y: {} },
            },
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
        const datasets = tierArr.map((arr: number[], idx: number) => ({
          label: `Tier ${idx + 1}`,
          data: arr,
          backgroundColor: ['#4A47DC', '#8D8BE9', '#BF7DC4', '#E3C7E6'][idx],
        }));
        if (!chartInstances.current.tier) {
          chartInstances.current.tier = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: { x: { stacked: true }, y: { stacked: true } },
            },
          });
        } else {
          const ch = chartInstances.current.tier;
          ch.data.labels = labels;
          ch.data.datasets = datasets as any;
          ch.update();
        }
      }
    }
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  return (
    <div className="space-y-6">
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPIChip label="Total MRR" value={formatCurrency(metrics.total_mrr)} />
          <KPIChip label="Active Customers" value={formatNumberShort(metrics.active_customers)} />
          <KPIChip label="Annual Revenue" value={formatCurrency(metrics.annual_revenue)} />
          <KPIChip label="Customer LTV" value={formatCurrency(metrics.ltv)} />
          <KPIChip label="New Customers (Month 1)" value={formatNumberShort(metrics.new_cust_month)} />
        </div>
      )}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <SidePanel>
            <h3 className="text-sm font-semibold">Revenue Tiers</h3>
            {[1, 2, 3, 4].map((n) => (
              <InputRow
                key={n}
                label={`Tier ${n} Revenue`}
                name={`tier${n}_revenue`}
                value={form[`tier${n}_revenue` as keyof FormState] as number}
                onChange={handleChange}
              />
            ))}
          </SidePanel>
          <SidePanel>
            <h3 className="text-sm font-semibold">Marketing</h3>
            <InputRow label="Marketing Budget" name="marketing_budget" value={form.marketing_budget} onChange={handleChange} />
            <InputRow label="Cost Per Lead" name="cpl" value={form.cpl} onChange={handleChange} />
            <InputRow label="Conversion Rate (%)" name="conversion_rate" value={form.conversion_rate} onChange={handleChange} />
          </SidePanel>
          <SidePanel>
            <h3 className="text-sm font-semibold">Financial</h3>
            <InputRow label="Churn Rate (%)" name="churn_rate_smb" value={form.churn_rate_smb} onChange={handleChange} />
            <InputRow label="WACC (%)" name="wacc" value={form.wacc} onChange={handleChange} />
            <InputRow label="Projection Months" name="projection_months" value={form.projection_months} onChange={handleChange} />
            <InputRow label="Initial Investment" name="initial_investment" value={form.initial_investment} onChange={handleChange} />
            <InputRow label="Operating Expense Rate (%)" name="operating_expense_rate" value={form.operating_expense_rate} onChange={handleChange} />
            <InputRow label="Fixed Costs" name="fixed_costs" value={form.fixed_costs} onChange={handleChange} />
          </SidePanel>
        </div>
        <div className="col-span-12 lg:col-span-9 space-y-4">
          <ChartCard title="Monthly Recurring Revenue" loading={loading}>
            <canvas ref={mrrRef}></canvas>
          </ChartCard>
          <ChartCard title="Active Customers" loading={loading}>
            <canvas ref={custRef}></canvas>
          </ChartCard>
          <ChartCard title="Revenue by Tier" loading={loading}>
            <canvas ref={tierRef}></canvas>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
