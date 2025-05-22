import { useState, Fragment } from "react";
import Card from "./Card";
import { calculateTierMetrics } from "../model/marketing";
import { COST_PER_MILLE } from "../model/constants";

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
  const marginPerTier = [1, 2, 3, 4].map((n) => {
    const rev = form[`tier${n}_revenue` as keyof typeof form] as number;
    const tons = form[`carbon${n}` as keyof typeof form] as number;
    const cost = tons * form.cost_of_carbon;
    return rev ? ((rev - cost) / rev) * 100 : 0;
  });
  const tierMetrics = calculateTierMetrics(
    form.conversion_rate,
    form.marketing_budget,
    form.ctr,
    COST_PER_MILLE,
  );

  const sections = [
    {
      title: "Funnel",
      rows: [
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
          text: "Clicks × Conversion Rate",
          code: "const leads = clicks * (conversionRate / 100);",
        },
        {
          label: "New Customers",
          value: newCustomers,
          text: "Leads",
          code: "const newCustomers = leads;",
        },
      ],
    },
    {
      title: "Customer Rollforward",
      rows: [
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
      ],
    },
    {
      title: "Revenue & Cash",
      rows: [
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
      ],
    },
    {
      title: "Blended Metrics",
      rows: [
        {
          label: "Blended CPL",
          value: blendedCpl,
          text: "Marketing Budget / Weighted New Customers",
          code: "const blendedCpl = marketingBudget / Σ(newCust[i] * weight[i]);",
        },
        {
          label: "Blended CVR",
          value: blendedCvr,
          text: "(Weighted New Customers / Weighted Clicks) × 100",
          code: "const blendedCvr = (Σ(newCust[i] * weight[i]) / Σ(clicks[i] * weight[i])) * 100;",
        },
        {
          label: "NPV",
          value: npv,
          text: "∑ Cash Flow / (1 + WACC / 12)^n − Initial Investment",
          code: "const npv = sum(cashFlow / (1 + wacc/12)**n) - initialInvestment;",
        },
      ],
    },
    {
      title: "Carbon",
      rows: [
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
      ],
    },
    {
      title: "Tier Metrics",
      rows: [
        ...tierMetrics.cpl.map((v, idx) => ({
          label: `Tier ${idx + 1} CPL`,
          value: v,
          text: `Budget × ${[0.4, 0.3, 0.2, 0.1][idx]} / Tier ${idx + 1} Leads`,
          code: `const tier${idx + 1}Cpl = (totalBudget * ${[0.4, 0.3, 0.2, 0.1][idx]}) / tier${idx + 1}Leads;`,
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
          text: `Tier ${idx + 1} Clicks × (Tier ${idx + 1} CVR / 100)`,
          code: `const tier${idx + 1}Leads = tier${idx + 1}Clicks * (tier${idx + 1}Cvr / 100);`,
        })),
        ...tierMetrics.newCustomers.map((v, idx) => ({
          label: `Tier ${idx + 1} New Cust`,
          value: v,
          text: `Tier ${idx + 1} Leads`,
          code: `const tier${idx + 1}New = tier${idx + 1}Leads;`,
        })),
        ...marginPerTier.map((v, idx) => ({
          label: `Tier ${idx + 1} Margin`,
          value: v,
          text: `((Tier ${idx + 1} Price - (Tier ${idx + 1} t × Cost per Ton)) / Tier ${idx + 1} Price) × 100`,
          code: `const marginTier${idx + 1} = ((tier${idx + 1}Price - (tier${idx + 1}Tons * costPerTon)) / tier${idx + 1}Price) * 100;`,
        })),
      ],
    },
  ];

  return (
    <div>
      <h3 className="content-header">Model Equations</h3>
      <Card>
        <table className="w-full text-xs font-mono">
          <tbody>
            {(() => {
              let i = 0;
              return sections.map((sec, sIdx) => (
                <Fragment key={sIdx}>
                  <tr>
                    <td
                      colSpan={2}
                      className="pt-2 font-semibold text-[var(--cobalt-700)]"
                    >
                      {sec.title}
                    </td>
                  </tr>
                  {sec.rows.map((row) => {
                    const idx = i++;
                    return (
                      <Fragment key={row.label}>
                        <tr
                          className="equation-row align-top cursor-pointer"
                          onClick={() =>
                            setOpenIndex(openIndex === idx ? null : idx)
                          }
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
                      </Fragment>
                    );
                  })}
                  <tr aria-hidden="true">
                    <td colSpan={2} className="h-2"></td>
                  </tr>
                </Fragment>
              ));
            })()}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
