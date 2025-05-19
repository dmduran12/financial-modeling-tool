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
import InlineNumberInput from './components/InlineNumberInput';
import ChartCard from './components/ChartCard';
import { generateLegend } from './utils/chartLegend';

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
  operating_expense_rate: number;
  fixed_costs: number;
}

interface Metrics {
  total_mrr: number;
  active_customers: number;
  annual_revenue: number;
  ltv: number;
  total_customers: number;
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
    operating_expense_rate: DEFAULT_OPERATING_EXPENSE_RATE,
    fixed_costs: DEFAULT_FIXED_COSTS,
  });

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [projections, setProjections] = useState<{ mrr: number[]; customers: number[] }>({ mrr: [], customers: [] });
  const [combinedLegend, setCombinedLegend] = useState<string>('');
  const [tierLegend, setTierLegend] = useState<string>('');
  const mrrCustRef = useRef<HTMLCanvasElement>(null);
  const tierRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<{ combined?: Chart; tier?: Chart }>({});

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
      DEFAULT_INITIAL_INVESTMENT,
      expenses,
      form.wacc
    );

    setMetrics({
      total_mrr: results.metrics.total_mrr,
      active_customers: results.metrics.total_customers,
      annual_revenue: results.metrics.annual_revenue,
      ltv: results.metrics.customer_ltv,
      total_customers: results.metrics.total_customers,
      npv: financial.npv,
      paybackMonths: financial.paybackMonths,
    });

    const labels = results.projections.monthLabels;
    const mrrArr = results.projections.mrr_by_month;
    const custArr = results.projections.customers_by_month;
    const tierArr = results.projections.tier_revenue_by_month;
    setProjections({ mrr: mrrArr, customers: custArr });

    if (mrrCustRef.current) {
      const ctx = mrrCustRef.current.getContext('2d');
      if (ctx) {
        if (!chartInstances.current.combined) {
          chartInstances.current.combined = new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [
                { data: mrrArr, borderColor: '#4A47DC', yAxisID: 'y1' },
                { data: custArr, borderColor: '#BF7DC4', yAxisID: 'y2' },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y1: { position: 'left' },
                y2: { position: 'right' },
              },
            },
          });
        } else {
          const ch = chartInstances.current.combined;
          ch.data.labels = labels;
          (ch.data.datasets[0].data as number[]) = mrrArr;
          (ch.data.datasets[1].data as number[]) = custArr;
          ch.update();
        }
        if (chartInstances.current.combined) {
          setCombinedLegend(generateLegend(chartInstances.current.combined));
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
              plugins: { legend: { display: false } },
              scales: { x: { stacked: true }, y: { stacked: true } },
            },
          });
        } else {
          const ch = chartInstances.current.tier;
          ch.data.labels = labels;
          ch.data.datasets = datasets as any;
          ch.update();
        }
        if (chartInstances.current.tier) {
          setTierLegend(generateLegend(chartInstances.current.tier));
        }
      }
    }
    return () => {
      if (chartInstances.current.combined) {
        chartInstances.current.combined.destroy();
        delete chartInstances.current.combined;
      }
      if (chartInstances.current.tier) {
        chartInstances.current.tier.destroy();
        delete chartInstances.current.tier;
      }
    };
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleValueChange = (name: keyof FormState, value: number) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPIChip
            labelTop="Total"
            labelBottom="MRR"
            value={metrics.total_mrr}
            dataArray={projections.mrr}
          />
          <KPIChip
            labelTop="Active"
            labelBottom="Customers"
            value={metrics.active_customers}
            dataArray={projections.customers}
          />
          <KPIChip
            labelTop="Annual"
            labelBottom="Revenue"
            value={metrics.annual_revenue}
            dataArray={projections.mrr.map((v) => v * 12)}
          />
          <KPIChip
            labelTop="Customer"
            labelBottom="LTV"
            value={metrics.ltv}
            dataArray={projections.mrr.map((v) => v / (form.churn_rate_smb / 100))}
          />
          <KPIChip
            labelTop="Total"
            labelBottom="Customers"
            value={metrics.total_customers}
            dataArray={projections.customers}
          />
        </div>
      )}
      <div className="lg:flex gap-4">
        <SidePanel className="sticky top-4 lg:w-[260px] w-full max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold mb-2 font-sans">Pricing Tiers</h3>
            {[1, 2, 3, 4].map((n) => (
              <InlineNumberInput
                key={n}
                label={`Tier ${n}`}
                unit="currency"
                value={form[`tier${n}_revenue` as keyof FormState] as number}
                onChange={(v) => handleValueChange(`tier${n}_revenue` as keyof FormState, v)}
              />
            ))}
          </div>
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold mb-2 font-sans">Marketing</h3>
            <InlineNumberInput label="Budget" unit="currency" value={form.marketing_budget} onChange={(v) => handleValueChange('marketing_budget', v)} />
            <InlineNumberInput label="CPL" unit="currency" value={form.cpl} onChange={(v) => handleValueChange('cpl', v)} />
            <InlineNumberInput label="CVR" unit="percent" value={form.conversion_rate} onChange={(v) => handleValueChange('conversion_rate', v)} />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold mb-2 font-sans">Financial</h3>
            <InlineNumberInput label="Churn %" unit="percent" value={form.churn_rate_smb} onChange={(v) => handleValueChange('churn_rate_smb', v)} />
            <InlineNumberInput label="WACC %" unit="percent" value={form.wacc} onChange={(v) => handleValueChange('wacc', v)} />
            <InlineNumberInput label="Months" value={form.projection_months} onChange={(v) => handleValueChange('projection_months', v)} />
            <InlineNumberInput label="Opex %" unit="percent" value={form.operating_expense_rate} onChange={(v) => handleValueChange('operating_expense_rate', v)} />
            <InlineNumberInput label="Fixed Costs" unit="currency" value={form.fixed_costs} onChange={(v) => handleValueChange('fixed_costs', v)} />
          </div>
        </SidePanel>
        <div className="flex-1 space-y-4">
          <ChartCard title="MRR & Customers" legend={combinedLegend}>
            <canvas ref={mrrCustRef}></canvas>
          </ChartCard>
          <ChartCard title="Revenue by Tier" legend={tierLegend}>
            <canvas ref={tierRef}></canvas>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
