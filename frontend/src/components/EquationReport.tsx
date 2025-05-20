import { useState } from "react";
import Card from "./Card";
import { calculateTierMetrics } from "../model/marketing";

interface Metrics {
  total_mrr: number;
  annual_revenue: number;
  subscriber_ltv: number;
  total_subscribers: number;
  npv: number;
  paybackMonths: number | null;
  blended_cvr: number;
  blended_cpl: number;
}

interface Props {
  form: {
    marketing_budget: number;
    cpl: number;
    conversion_rate: number;
    ctr: number;
    churn_rate_smb: number;
    operating_expense_rate: number;
    fixed_costs: number;
    wacc: number;
  };
  metrics: Metrics | null;
  projections: {
    mrr: number[];
    subscribers: number[];
    impressions: number[];
    clicks: number[];
    leads: number[];
    newCustomers: number[];
  };
}

export default function EquationReport({ form, metrics, projections }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const impressions = projections.impressions[0] || 0;
  const clicks = projections.clicks[0] || 0;
  const leads = projections.leads[0] || 0;
  const newCustomers = projections.newCustomers[0] || 0;
  const churned = 10 * (form.churn_rate_smb / 100);
  const customersNext = projections.subscribers[0] || 0;
  const mrr = projections.mrr[0] || 0;
  const subscriberLtv = metrics?.subscriber_ltv || 0;
  const grossProfit = mrr * (1 - form.operating_expense_rate / 100);
  const monthlyCash = grossProfit - form.fixed_costs - form.marketing_budget;
  const blendedCpl = metrics?.blended_cpl || 0;
  const blendedCvr = metrics?.blended_cvr || 0;
  const npv = metrics?.npv || 0;
  const carbonTons = projections.carbonTons
    ? projections.carbonTons[0] || 0
    : 0;
  const carbonCost = projections.carbonCost
    ? projections.carbonCost[0] || 0
    : 0;
  const carbonSpendPct = mrr ? (carbonCost / mrr) * 100 : 0;
  const usdPerTon = carbonTons ? carbonCost / carbonTons : 0;
  const tierMetrics = calculateTierMetrics(
    form.cpl,
    form.conversion_rate,
    form.marketing_budget,
  );

  const rows = [
    {
      label: "Impressions",
      value: impressions,
      text: "(Marketing Budget / Cost per 1K Impressions) × 1000",
      code: "const impressions = (marketingBudget / COST_PER_MILLE) * 1000;",
    },
    {
      label: "Clicks",
      value: clicks,
      text: "Impressions × CTR",
      code: "const clicks = impressions * (ctr / 100);",
    },
    {
      label: "Leads",
      value: leads,
      text: "Marketing Budget / Cost Per Lead",
      code: "const leads = marketingBudget / costPerLead;",
    },
    {
      label: "New Customers",
      value: newCustomers,
      text: "Leads × Conversion Rate",
      code: "const newCustomers = leads * (conversionRate / 100);",
    },
    {
      label: "Churned Customers",
      value: churned,
      text: "Customers × Churn Rate",
      code: "const churned = customers * (churnRate / 100);",
    },
    {
      label: "Customers Next Month",
      value: customersNext,
      text: "Customers + New Customers − Churned Customers",
      code: "const next = customers + newCustomers - churned;",
    },
    {
      label: "MRR",
      value: mrr,
      text: "Customers × Average Revenue Per Customer",
      code: "const mrr = customers * arpc;",
    },
    {
      label: "Subscriber LTV",
      value: subscriberLtv,
      text: "[Average Revenue Per Customer × (1 − Operating Expense %)] / Churn Rate",
      code: "const ltv = (arpc * (1 - opexRate/100)) / churnRate;",
    },
    {
      label: "Gross Profit",
      value: grossProfit,
      text: "MRR × (1 − Operating Expense %)",
      code: "const grossProfit = mrr * (1 - opexRate/100);",
    },
    {
      label: "Monthly Cash Flow",
      value: monthlyCash,
      text: "Gross Profit − Fixed Costs − Marketing Spend",
      code: "const cash = grossProfit - fixedCosts - marketingBudget;",
    },
    {
      label: "Blended CPL",
      value: blendedCpl,
      text: "Marketing Budget / Leads",
      code: "const blendedCpl = marketingBudget / leads;",
    },
    {
      label: "Blended CVR",
      value: blendedCvr,
      text: "(New Customers / Leads) × 100",
      code: "const blendedCvr = (newCustomers / leads) * 100;",
    },
    {
      label: "NPV",
      value: npv,
      text: "∑ Cash Flow / (1 + WACC / 12)^n − Initial Investment",
      code: "const npv = sum(cashFlow / (1 + wacc/12)**n) - initialInvestment;",
    },
    {
      label: "Carbon Tons",
      value: carbonTons,
      text: "Customers × Tons per Customer",
      code: "const carbonTons = customers * tonsPerCustomer;",
    },
    {
      label: "Carbon Cost",
      value: carbonCost,
      text: "Carbon Tons × Cost of Carbon",
      code: "const carbonCost = carbonTons * costPerTon;",
    },
    {
      label: "Carbon Spend %",
      value: carbonSpendPct,
      text: "(Carbon Cost / MRR) × 100",
      code: "const carbonSpendPct = (carbonCost / mrr) * 100;",
    },
    {
      label: "USD per Ton",
      value: usdPerTon,
      text: "Carbon Cost / Carbon Tons",
      code: "const usdPerTon = carbonCost / carbonTons;",
    },
    ...tierMetrics.cpl.map((v, idx) => ({
      label: `Tier ${idx + 1} CPL`,
      value: v,
      text: `Base CPL × ${[1, 1.6, 2.5, 4][idx]}`,
      code: `const tier${idx + 1}Cpl = baseCpl * ${[1, 1.6, 2.5, 4][idx]};`,
    })),
    ...tierMetrics.cvr.map((v, idx) => ({
      label: `Tier ${idx + 1} CVR`,
      value: v,
      text: `Base CVR × ${[1, 0.65, 0.35, 0.15][idx]}`,
      code: `const tier${idx + 1}Cvr = Math.max(baseCvr * ${[1, 0.65, 0.35, 0.15][idx]}, 0.1);`,
    })),
    ...tierMetrics.leads.map((v, idx) => ({
      label: `Tier ${idx + 1} Leads`,
      value: v,
      text: `Budget × ${[0.4, 0.3, 0.2, 0.1][idx]} / Tier ${idx + 1} CPL`,
      code: `const tier${idx + 1}Leads = (totalBudget * ${[0.4, 0.3, 0.2, 0.1][idx]}) / tier${idx + 1}Cpl;`,
    })),
    ...tierMetrics.newCustomers.map((v, idx) => ({
      label: `Tier ${idx + 1} New Cust`,
      value: v,
      text: `Tier ${idx + 1} Leads × (Tier ${idx + 1} CVR / 100)`,
      code: `const tier${idx + 1}New = tier${idx + 1}Leads * (tier${idx + 1}Cvr / 100);`,
    })),
  ];

  return (
    <div>
      <h3 className="content-header">Model Equations</h3>
      <Card>
        <table className="w-full text-xs font-mono">
          <tbody>
            {rows.map((row, idx) => (
              <>
                <tr
                  key={row.label}
                  className="align-top cursor-pointer"
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                >
                  <td className="pr-2 text-right whitespace-nowrap">
                    {row.value.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    <span className="font-semibold text-[var(--cobalt-500)]">
                      {row.label}
                    </span>{" "}
                    {"="} {row.text}
                  </td>
                </tr>
                {openIndex === idx && (
                  <tr className="code-row">
                    <td></td>
                    <td>
                      <pre className="code-window">{row.code}</pre>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
