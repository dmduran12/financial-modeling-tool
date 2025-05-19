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
  DEFAULT_TIER_ADOPTION,
} from './model/constants';
import { runSubscriptionModel } from './model/subscription';
import { calculateFinancialMetrics } from './model/finance';
import { calculateTierMetrics } from './model/marketing';
import { Chart } from 'chart.js/auto';
import KPIChip from './components/KPIChip';
import SidePanel from './components/SidePanel';
import InlineNumberInput from './components/InlineNumberInput';
import ChartCard from './components/ChartCard';
import { generateLegend } from './utils/chartLegend';
import { formatCurrency } from './utils/format';
import { getCssVar } from './utils/cssVar';

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
  annual_revenue: number;
  subscriber_ltv: number;
  total_subscribers: number;
  npv: number;
  paybackMonths: number | null;
  blended_cvr: number;
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
  const [projections, setProjections] = useState<{ mrr: number[]; subscribers: number[] }>({ mrr: [], subscribers: [] });
  const [combinedLegend, setCombinedLegend] = useState<string>('');
  const [tierLegend, setTierLegend] = useState<string>('');
  const mrrCustRef = useRef<HTMLCanvasElement>(null);
  const tierRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<{ combined?: Chart; tier?: Chart }>({});
  const warned = useRef(false);

  useEffect(() => {
    if (form.cpl < 50 || form.conversion_rate > 10) {
      if (!warned.current) {
        alert('Base CPL must be at least $50 and base CVR at most 10%');
        warned.current = true;
      }
      return;
    }
    if (form.conversion_rate > 15 || form.churn_rate_smb < 1) {
      if (!warned.current) {
        alert('Inputs look unrealistic');
        warned.current = true;
      }
      return;
    }
    warned.current = false;
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
      tier_adoption_rates: DEFAULT_TIER_ADOPTION,
    };

    const expenses = {
      operatingExpenseRate: form.operating_expense_rate,
      fixedCosts: form.fixed_costs,
      marketingSpend: form.marketing_budget,
    };

    const tierMetrics = calculateTierMetrics(
      form.cpl,
      form.conversion_rate,
      form.marketing_budget
    );
    const blendedCvr = tierMetrics.totalLeads ? (tierMetrics.totalNewCustomers / tierMetrics.totalLeads) * 100 : 0;

    const results = runSubscriptionModel(modelInput);
    const financial = calculateFinancialMetrics(
      results,
      DEFAULT_INITIAL_INVESTMENT,
      expenses,
      form.wacc
    );

    setMetrics({
      total_mrr: results.metrics.total_mrr,
      annual_revenue: results.metrics.annual_revenue,
      subscriber_ltv: results.metrics.subscriber_ltv,
      total_subscribers: results.metrics.total_subscribers,
      npv: financial.npv,
      paybackMonths: financial.paybackMonths,
      blended_cvr: blendedCvr,
    });

    const labels = results.projections.monthLabels;
    const mrrArr = results.projections.mrr_by_month;
    const subArr = results.projections.customers_by_month;
    const tierArr = results.projections.tier_revenue_by_month;
    const tierPrices = results.projections.tier_revenues_end;
    const tierCustomers = tierArr.map((arr, idx) =>
      arr.map((val) => Math.round(val / (tierPrices[idx] || 1)))
    );
    setProjections({ mrr: mrrArr, subscribers: subArr });

    if (mrrCustRef.current) {
      const ctx = mrrCustRef.current.getContext('2d');
      if (ctx) {
        const mrrColor = getCssVar('--success-500', mrrCustRef.current!);
        const datasets = [
          {
            label: 'MRR',
            data: mrrArr,
            borderColor: mrrColor,
            borderWidth: 4,
            yAxisID: 'y1',
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          ...tierCustomers.map((arr, idx) => ({
            label: `Tier ${idx + 1}`,
            data: arr,
            borderColor: ['#4A47DC', '#8D8BE9', '#BF7DC4', '#E3C7E6'][idx],
            borderWidth: 2,
            yAxisID: 'y2',
            pointRadius: 0,
            pointHoverRadius: 4,
          })),
        ];
        if (!chartInstances.current.combined) {
          chartInstances.current.combined = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false } },
                y1: {
                  position: 'left',
                  ticks: {
                    callback: (v: any) => '$' + formatCurrency(Number(v)),
                  },
                },
                y2: {
                  position: 'right',
                  grid: { drawOnChartArea: false },
                  ticks: {
                    callback: (v: any) => Math.round(Number(v)).toLocaleString(),
                  },
                },
              },
            },
          });
        } else {
          const ch = chartInstances.current.combined;
          ch.data.labels = labels;
          ch.data.datasets = datasets as any;
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
              scales: {
                x: { stacked: true, grid: { display: false } },
                y: {
                  stacked: true,
                  ticks: {
                    callback: (v: any) => '$' + formatCurrency(Number(v)),
                  },
                },
              },
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          <KPIChip
            labelTop="Total"
            labelBottom="MRR"
            value={metrics.total_mrr}
            dataArray={projections.mrr}
          />
          <KPIChip
            labelTop="Annual"
            labelBottom="Revenue"
            value={metrics.annual_revenue}
            dataArray={projections.mrr.map((v) => v * 12)}
          />
          <KPIChip
            labelTop="Subscriber"
            labelBottom="LTV"
            value={metrics.subscriber_ltv}
            dataArray={projections.mrr.map((v) => v / (form.churn_rate_smb / 100))}
          />
          <KPIChip
            labelTop="Total"
            labelBottom="Subscribers"
            value={metrics.total_subscribers}
            dataArray={projections.subscribers}
          />
          <KPIChip
            labelTop="Blended"
            labelBottom="CVR"
            value={metrics.blended_cvr}
            dataArray={projections.subscribers}
            unit="percent"
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
            <p className="text-xs text-gray-500">Upper tiers scale automatically from Tier 1 inputs.</p>
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
          <ChartCard title="MRR & Subscribers" legend={combinedLegend}>
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
