import { useEffect, useRef, useState } from "react";
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
  DEFAULT_CTR,
  DEFAULT_COST_OF_CARBON,
  DEFAULT_TONS_PER_CUSTOMER,
  COST_PER_MILLE,
  BLENDED_WEIGHTS,
} from "./model/constants";
import { runSubscriptionModel } from "./model/subscription";
import { calculateFinancialMetrics } from "./model/finance";
import { calculateTierMetrics } from "./model/marketing";
import { Chart } from "chart.js/auto";
import KPIChip from "./components/KPIChip";
import SidePanel from "./components/SidePanel";
import InlineNumberInput from "./components/InlineNumberInput";
import ChartCard from "./components/ChartCard";
import EquationReport from "./components/EquationReport";
import FunnelTable from "./components/FunnelTable";
import SankeyChart from "./components/SankeyChart";
import { generateLegend } from "./utils/chartLegend";
import { formatCurrency } from "./utils/format";
import { getCssVar } from "./utils/cssVar";
import { deriveCarbonPerCustomer } from "./model/carbon";

const TIER_COLORS = ["#4A47DC", "#8D8BE9", "#BF7DC4", "#E3C7E6"];

interface FormState {
  tier1_revenue: number;
  tier2_revenue: number;
  tier3_revenue: number;
  tier4_revenue: number;
  marketing_budget: number;
  conversion_rate: number;
  ctr: number;
  churn_rate_smb: number;
  wacc: number;
  projection_months: number;
  operating_expense_rate: number;
  fixed_costs: number;
  initial_investment: number;
  cost_of_carbon: number;
  carbon1: number;
  carbon2: number;
  carbon3: number;
  carbon4: number;
}

interface Metrics {
  total_mrr: number;
  annual_revenue: number;
  subscriber_ltv: number;
  total_subscribers: number;
  npv: number;
  paybackMonths: number | null;
  blended_cvr: number;
  blended_cpl: number;
  carbon_ordered: number;
  carbon_spend_pct: number;
  blended_usd_per_ton: number;
  margin_warning: boolean;
}

export default function Dashboard() {
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

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const saveScenario = () => {
    localStorage.setItem("scenario", JSON.stringify(form));
    alert("Scenario saved");
  };
  const loadScenario = () => {
    const data = localStorage.getItem("scenario");
    if (data) {
      setForm(JSON.parse(data));
    }
  };
  const exportScenario = () => {
    const blob = new Blob([JSON.stringify(form, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scenario.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const [projections, setProjections] = useState<{
    mrr: number[];
    subscribers: number[];
    impressions: number[];
    clicks: number[];
    leads: number[];
    newCustomers: number[];
    carbonTons: number[];
    carbonCost: number[];
    cashFlows: number[];
  }>({
    mrr: [],
    subscribers: [],
    impressions: [],
    clicks: [],
    leads: [],
    newCustomers: [],
    carbonTons: [],
    carbonCost: [],
    cashFlows: [],
  });
  const [combinedLegend, setCombinedLegend] = useState<string>("");
  const [tierLegend, setTierLegend] = useState<string>("");
  const mrrCustRef = useRef<HTMLCanvasElement>(null);
  const tierRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<{
    combined?: Chart;
    tier?: Chart;
  }>({});
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    const prices = [
      form.tier1_revenue,
      form.tier2_revenue,
      form.tier3_revenue,
      form.tier4_revenue,
    ];
    const tons = deriveCarbonPerCustomer(prices, form.cost_of_carbon);
    if (
      tons[0] !== form.carbon1 ||
      tons[1] !== form.carbon2 ||
      tons[2] !== form.carbon3 ||
      tons[3] !== form.carbon4
    ) {
      setForm((prev) => ({
        ...prev,
        carbon1: tons[0],
        carbon2: tons[1],
        carbon3: tons[2],
        carbon4: tons[3],
      }));
    }
  }, [
    form.tier1_revenue,
    form.tier2_revenue,
    form.tier3_revenue,
    form.tier4_revenue,
    form.cost_of_carbon,
    form.carbon1,
    form.carbon2,
    form.carbon3,
    form.carbon4,
  ]);

  useEffect(() => {
    const badCvr = form.conversion_rate < 0.1 || form.conversion_rate > 6;
    setWarning(badCvr);
    const modelInput = {
      tier_revenues: [
        form.tier1_revenue,
        form.tier2_revenue,
        form.tier3_revenue,
        form.tier4_revenue,
      ],
      marketing_budget: form.marketing_budget,
      conversion_rate: form.conversion_rate,
      ctr: form.ctr,
      churn_rate_smb: form.churn_rate_smb,
      wacc: form.wacc,
      initial_cac_smb: 0,
      projection_months: form.projection_months,
      operating_expense_rate: form.operating_expense_rate,
      fixed_costs: form.fixed_costs,
      tier_adoption_rates: DEFAULT_TIER_ADOPTION,
      cost_of_carbon: form.cost_of_carbon,
      carbon_per_customer: [
        form.carbon1,
        form.carbon2,
        form.carbon3,
        form.carbon4,
      ],
    };

    const expenses = {
      operatingExpenseRate: form.operating_expense_rate,
      fixedCosts: form.fixed_costs,
      marketingSpend: form.marketing_budget,
    };

    const tierMetrics = calculateTierMetrics(
      form.conversion_rate,
      form.marketing_budget,
      form.ctr,
      COST_PER_MILLE,
    );
    const weightedClicks = tierMetrics.clicks.reduce(
      (sum, c, idx) => sum + c * BLENDED_WEIGHTS[idx],
      0,
    );
    const weightedNew = tierMetrics.newCustomers.reduce(
      (sum, n, idx) => sum + n * BLENDED_WEIGHTS[idx],
      0,
    );
    const blendedCvr = weightedClicks
      ? (weightedNew / weightedClicks) * 100
      : 0;
    const blendedCpl = weightedNew ? form.marketing_budget / weightedNew : 0;

    const results = runSubscriptionModel(modelInput);
    const financial = calculateFinancialMetrics(
      results,
      form.initial_investment,
      expenses,
      form.wacc,
    );

    setMetrics({
      total_mrr: results.metrics.total_mrr,
      annual_revenue: results.metrics.annual_revenue,
      subscriber_ltv: results.metrics.subscriber_ltv,
      total_subscribers: Math.round(results.metrics.total_subscribers),
      npv: financial.npv,
      paybackMonths: financial.paybackMonths,
      blended_cvr: blendedCvr,
      blended_cpl: blendedCpl,
      carbon_ordered: results.metrics.carbon_ordered,
      carbon_spend_pct: results.metrics.carbon_spend_pct,
      blended_usd_per_ton: results.metrics.blended_usd_per_ton,
      margin_warning: results.metrics.margin_warning,
    });

    const labels = results.projections.monthLabels;
    const mrrArr = results.projections.mrr_by_month;
    const subArr = results.projections.customers_by_month.map(Math.round);
    const tierArr = results.projections.tier_revenue_by_month;
    const tierPrices = results.projections.tier_revenues_end;
    const tierCustomers = tierArr.map((arr, idx) =>
      arr.map((val) => val / (tierPrices[idx] || 1)),
    );
    setProjections({
      mrr: mrrArr,
      subscribers: subArr,
      impressions: results.projections.impressions_by_month,
      clicks: results.projections.clicks_by_month,
      leads: results.projections.leads_by_month,
      newCustomers: results.projections.new_customers_by_month.map(Math.round),
      carbonTons: results.projections.carbon_tons_by_month,
      carbonCost: results.projections.carbon_cost_by_month,
      cashFlows: financial.cashFlows,
    });

    if (mrrCustRef.current) {
      const ctx = mrrCustRef.current.getContext("2d");
      if (ctx) {
        const mrrColor = getCssVar("--success-500", mrrCustRef.current!);
        const datasets = [
          {
            label: "MRR",
            data: mrrArr,
            borderColor: mrrColor,
            borderWidth: 6,
            yAxisID: "y1",
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0,
            order: -1,
          },
          ...tierCustomers.map((arr, idx) => ({
            label: `Tier ${idx + 1}`,
            data: arr,
            borderColor: ["#4A47DC", "#8D8BE9", "#BF7DC4", "#E3C7E6"][idx],
            borderWidth: 2,
            yAxisID: "y2",
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0,
            stepped: true,
          })),
        ];
        if (!chartInstances.current.combined) {
          chartInstances.current.combined = new Chart(ctx, {
            type: "line",
            data: { labels, datasets },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: { duration: 500 },
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false } },
                y1: {
                  position: "left",
                  min: 1,
                  ticks: {
                    callback: (v: any) => "$" + formatCurrency(Number(v)),
                  },
                },
                y2: {
                  position: "right",
                  min: 1,
                  grid: { drawOnChartArea: false },
                  ticks: {
                    callback: (v: any) => Number(v).toLocaleString(),
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
      const ctx = tierRef.current.getContext("2d");
      if (ctx) {
        const datasets = tierArr.map((arr: number[], idx: number) => ({
          label: `Tier ${idx + 1}`,
          data: arr,
          backgroundColor: ["#4A47DC", "#8D8BE9", "#BF7DC4", "#E3C7E6"][idx],
        }));
        if (!chartInstances.current.tier) {
          chartInstances.current.tier = new Chart(ctx, {
            type: "bar",
            data: { labels, datasets },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: { duration: 500 },
              plugins: { legend: { display: false } },
              scales: {
                x: { stacked: true, grid: { display: false } },
                y: {
                  stacked: true,
                  min: 1,
                  ticks: {
                    callback: (v: any) => "$" + formatCurrency(Number(v)),
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

  const lastIdx = Math.max(0, form.projection_months - 1);

  return (
    <div className="space-y-6">
      {warning && (
        <div className="text-xs text-yellow-700 bg-yellow-100 py-1 px-2 rounded">
          Input assumptions outside EY benchmark – review Marketing CPL / CVR
        </div>
      )}
      <div className="lg:flex gap-4">
        <div className="md:hidden">
          <button
            className="btn w-full mb-2"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? "Hide Inputs" : "Show Inputs"}
          </button>
        </div>
        <SidePanel
          className={`side-panel lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-[260px] md:w-72 w-full overflow-y-auto ${mobileOpen ? "" : "hidden md:block"}`}
        >
          <div className="space-y-3">
            <h3 className="sidebar-title mb-2">Pricing Tiers</h3>
            {[1, 2, 3, 4].map((n) => (
              <InlineNumberInput
                key={n}
                label={
                  <>
                    <span
                      className="swatch"
                      style={{ backgroundColor: TIER_COLORS[n - 1] }}
                    ></span>
                    {`Tier ${n}`}
                  </>
                }
                unit="currency"
                value={form[`tier${n}_revenue` as keyof FormState] as number}
                onChange={(v) =>
                  handleValueChange(`tier${n}_revenue` as keyof FormState, v)
                }
              />
            ))}
          </div>
          <div className="space-y-3">
            <h3 className="sidebar-title mb-2">Marketing</h3>
            <InlineNumberInput
              label="Budget"
              unit="currency"
              value={form.marketing_budget}
              onChange={(v) => handleValueChange("marketing_budget", v)}
            />
            <InlineNumberInput
              label="CVR"
              unit="percent"
              value={form.conversion_rate}
              onChange={(v) => handleValueChange("conversion_rate", v)}
            />
            <InlineNumberInput
              label="CTR"
              unit="percent"
              value={form.ctr}
              onChange={(v) => handleValueChange("ctr", v)}
            />
            <p className="text-xs text-gray-500">
              Upper tiers scale automatically: CPL factors 1 / 1.6 / 2.5 / 4.0,
              CVR factors 1 / 0.65 / 0.35 / 0.15
            </p>
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer">Advanced</summary>
              <div className="mt-1 space-y-1">
                <div>{`Cost per 1K impressions: $${COST_PER_MILLE}`}</div>
                <div>Marketing split: 40 / 30 / 20 / 10</div>
              </div>
            </details>
          </div>
          <div className="space-y-3">
            <h3 className="sidebar-title mb-2">Financial</h3>
            <InlineNumberInput
              label="Churn %"
              unit="percent"
              value={form.churn_rate_smb}
              onChange={(v) => handleValueChange("churn_rate_smb", v)}
            />
            <InlineNumberInput
              label="WACC %"
              unit="percent"
              value={form.wacc}
              onChange={(v) => handleValueChange("wacc", v)}
            />
            <InlineNumberInput
              label="Initial Investment"
              unit="currency"
              value={form.initial_investment}
              onChange={(v) => handleValueChange("initial_investment", v)}
            />
            <InlineNumberInput
              label="Months"
              value={form.projection_months}
              onChange={(v) => handleValueChange("projection_months", v)}
            />
            <InlineNumberInput
              label="Opex %"
              unit="percent"
              value={form.operating_expense_rate}
              onChange={(v) => handleValueChange("operating_expense_rate", v)}
            />
            <InlineNumberInput
              label="Fixed Costs"
              unit="currency"
              value={form.fixed_costs}
              onChange={(v) => handleValueChange("fixed_costs", v)}
            />
            <InlineNumberInput
              label="Cost of Carbon"
              unit="currency"
              value={form.cost_of_carbon}
              onChange={(v) => handleValueChange("cost_of_carbon", v)}
            />
            <details className="text-xs">
              <summary className="cursor-pointer">Edit carbon per tier</summary>
              <div className="mt-2 space-y-2">
                {[1, 2, 3, 4].map((n) => (
                  <InlineNumberInput
                    key={n}
                    label={`Tier ${n} t`}
                    value={form[`carbon${n}` as keyof FormState] as number}
                    onChange={(v) =>
                      handleValueChange(`carbon${n}` as keyof FormState, v)
                    }
                  />
                ))}
              </div>
            </details>
          </div>
        </SidePanel>
        <div className="flex-1 space-y-4">
          <div className="flex justify-end gap-2">
            <button
              className="btn"
              onClick={saveScenario}
              aria-label="Save scenario"
            >
              Save
            </button>
            <button
              className="btn"
              onClick={loadScenario}
              aria-label="Load scenario"
            >
              Load
            </button>
            <button
              className="btn"
              onClick={exportScenario}
              aria-label="Export scenario"
            >
              Export
            </button>
          </div>
          {metrics && (
            <>
              <h3 className="content-header">Key Metrics</h3>
              <div id="kpiRow" className="sticky-metrics">
                <KPIChip
                  labelTop="Total"
                  labelBottom="MRR"
                  value={metrics.total_mrr}
                  dataArray={projections.mrr}
                  unit="currency"
                />
                <KPIChip
                  labelTop="Annual"
                  labelBottom="Revenue"
                  value={metrics.annual_revenue}
                  dataArray={projections.mrr.map((v) => v * 12)}
                  unit="currency"
                />
                <KPIChip
                  labelTop="Subscriber"
                  labelBottom="LTV"
                  value={metrics.subscriber_ltv}
                  dataArray={projections.mrr.map(
                    (v) => v / (form.churn_rate_smb / 100),
                  )}
                  unit="currency"
                />
                <KPIChip
                  labelTop="Total"
                  labelBottom="Subscribers"
                  value={metrics.total_subscribers}
                  dataArray={projections.subscribers}
                />
                <KPIChip
                  labelTop="Blended"
                  labelBottom="CPL"
                  value={metrics.blended_cpl}
                  dataArray={projections.leads.map((l, i) =>
                    l ? form.marketing_budget / l : 0,
                  )}
                  unit="currency"
                  warning={warning}
                />
                <KPIChip
                  labelTop="Blended"
                  labelBottom="CVR"
                  value={metrics.blended_cvr}
                  dataArray={projections.leads.map((l, i) =>
                    l ? (projections.newCustomers[i] / l) * 100 : 0,
                  )}
                  unit="percent"
                  warning={warning}
                />
              </div>
            </>
          )}
          <ChartCard title="MRR & Subscribers" legend={combinedLegend}>
            <canvas ref={mrrCustRef}></canvas>
          </ChartCard>
          <ChartCard title="Revenue by Tier" legend={tierLegend}>
            <canvas ref={tierRef}></canvas>
          </ChartCard>
          <ChartCard
            title="Cash Flows"
            className="h-80 flex items-center justify-center"
          >
            <SankeyChart
              mrr={projections.mrr[lastIdx] || 0}
              operatingExpenses={
                (projections.mrr[lastIdx] || 0) *
                (form.operating_expense_rate / 100)
              }
              marketing={form.marketing_budget}
              fixed={form.fixed_costs}
              cash={projections.cashFlows[lastIdx] || 0}
              investment={form.initial_investment}
            />
          </ChartCard>
          <FunnelTable
            impressions={projections.impressions}
            clicks={projections.clicks}
            leads={projections.leads}
            newCustomers={projections.newCustomers}
            marketingBudget={form.marketing_budget}
          />
          <EquationReport
            form={form}
            metrics={metrics}
            projections={projections}
          />
        </div>
      </div>
    </div>
  );
}
