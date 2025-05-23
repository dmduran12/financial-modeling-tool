import { useState } from "react";
import { formatCurrency } from "../utils/format";

interface Props {
  mrr: number;
  operatingExpenses: number;
  marketing: number;
  fixed: number;
  cash: number;
  investment: number;
  months?: number;
  leads?: number;
  newCustomers?: number;
  churn?: number;
  revenueByTier?: number[];
}

export default function SankeyChart({
  mrr,
  operatingExpenses,
  marketing,
  fixed,
  cash,
  investment,
  months = 1,
  leads = 0,
  newCustomers = 0,
  churn = 0,
  revenueByTier,
}: Props) {
  const [showTiers, setShowTiers] = useState(false);
  const inflowColor = "var(--accent-primary-500)";
  const outflowColor = "var(--accent-secondary-500)";
  const capitalColor = "var(--accent-tertiary-500, #888)";
  const netColor = "var(--accent-primary-300)";
  const width = 960;
  const height = 240;
  const periodLabel = months === 1 ? "Monthly" : `${months}-mo`;
  const revenueTotal = mrr * months;
  const opexTotal = operatingExpenses * months;
  const marketingTotal = marketing * months;
  const fixedTotal = fixed * months;
  const cashTotal = cash * months;
  const grossProfit = revenueTotal - opexTotal;
  const scale = (v: number, total: number) =>
    Math.max(2, (v / (total || 1)) * 40);
  const nodes = {
    investment: { x: 40, y: height * 0.15 },
    revenue: { x: 40, y: height * 0.55 },
    opex: { x: 360, y: height * 0.25 },
    gp: { x: 360, y: height * 0.75 },
    marketing: { x: 520, y: height * 0.35 },
    leads: { x: 640, y: height * 0.2 },
    newCust: { x: 640, y: height * 0.4 },
    churn: { x: 640, y: height * 0.6 },
    fixed: { x: 840, y: height * 0.6 },
    cash: { x: 840, y: height * 0.85 },
  } as const;
  const path = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    `M ${a.x} ${a.y} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x} ${b.y}`;

  const mrrToOpex = scale(opexTotal, revenueTotal);
  const mrrToGp = scale(grossProfit, revenueTotal);
  const gpToMarketing = scale(marketingTotal, grossProfit);
  const gpToFixed = scale(fixedTotal, grossProfit);
  const gpToCash = scale(cashTotal, grossProfit);

  const marketingToLeads = scale(leads, marketingTotal);
  const leadsToNew = scale(newCustomers, leads);
  const newToRevenue = scale(Math.max(newCustomers - churn, 0), newCustomers);
  const newToChurn = scale(churn, newCustomers);

  const investAlloc = {
    marketing: investment * 0.4,
    opex: investment * 0.3,
    fixed: investment * 0.2,
    cash: investment * 0.1,
  };
  const investToMarketing = scale(investAlloc.marketing, investment);
  const investToOpex = scale(investAlloc.opex, investment);
  const investToFixed = scale(investAlloc.fixed, investment);
  const investToCash = scale(investAlloc.cash, investment);

  const totalIn = revenueTotal + investment;
  const totalOut = marketingTotal + fixedTotal + cashTotal + opexTotal;
  const roundingDiff = Math.round((totalIn - totalOut) * 100) / 100;

  return (
    <div>
      <button
        className="text-xs mb-1 underline"
        onClick={() => setShowTiers((s) => !s)}
      >
        {showTiers ? "Hide Tier Breakdown" : "Show Tier Breakdown"}
      </button>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="text-xs font-mono"
      >
        <defs>
          <style>{`.node-label{fill:var(--squid-ink);}`}</style>
        </defs>
        <path
          d={path(nodes.revenue, nodes.opex)}
          stroke={outflowColor}
          strokeWidth={mrrToOpex}
          fill="none"
          strokeOpacity="0.6"
          style={{ transition: "stroke-width 0.3s" }}
        >
          <title>{`${periodLabel} Revenue → ${periodLabel} Opex: $${formatCurrency(opexTotal)} (${((opexTotal / totalIn) * 100).toFixed(1)}%)`}</title>
        </path>
        <path
          d={path(nodes.revenue, nodes.gp)}
          stroke={inflowColor}
          strokeWidth={mrrToGp}
          fill="none"
          strokeOpacity="0.6"
          style={{ transition: "stroke-width 0.3s" }}
        >
          <title>{`${periodLabel} Revenue → Gross Profit: $${formatCurrency(grossProfit)} (${((grossProfit / totalIn) * 100).toFixed(1)}%)`}</title>
        </path>
        <path
          d={path(nodes.gp, nodes.marketing)}
          stroke={outflowColor}
          strokeWidth={gpToMarketing}
          fill="none"
          strokeOpacity="0.6"
          style={{ transition: "stroke-width 0.3s" }}
        />
        <path
          d={path(nodes.marketing, nodes.leads)}
          stroke={outflowColor}
          strokeWidth={marketingToLeads}
          fill="none"
          strokeOpacity="0.6"
          style={{ transition: "stroke-width 0.3s" }}
        />
        <path
          d={path(nodes.leads, nodes.newCust)}
          stroke={inflowColor}
          strokeWidth={leadsToNew}
          fill="none"
          strokeOpacity="0.6"
          style={{ transition: "stroke-width 0.3s" }}
        />
        <path
          d={path(nodes.newCust, nodes.churn)}
          stroke={outflowColor}
          strokeWidth={newToChurn}
          fill="none"
          strokeOpacity="0.6"
          style={{ transition: "stroke-width 0.3s" }}
        />
        <path
          d={path(nodes.newCust, nodes.revenue)}
          stroke={inflowColor}
          strokeWidth={newToRevenue}
          fill="none"
          strokeOpacity="0.6"
          style={{ transition: "stroke-width 0.3s" }}
        />
        <path
          d={path(nodes.gp, nodes.fixed)}
          stroke={outflowColor}
          strokeWidth={gpToFixed}
          fill="none"
          strokeOpacity="0.6"
          style={{ transition: "stroke-width 0.3s" }}
        />
        <path
          d={path(nodes.gp, nodes.cash)}
          stroke={netColor}
          strokeWidth={gpToCash}
          fill="none"
          strokeOpacity="0.6"
          style={{ transition: "stroke-width 0.3s" }}
        />
        <path
          d={path(nodes.investment, nodes.opex)}
          stroke={capitalColor}
          strokeWidth={investToOpex}
          fill="none"
          strokeOpacity="0.6"
          style={{ transition: "stroke-width 0.3s" }}
        />
        <path
          d={path(nodes.investment, nodes.marketing)}
          stroke={capitalColor}
          strokeWidth={investToMarketing}
          fill="none"
          strokeOpacity="0.6"
          style={{ transition: "stroke-width 0.3s" }}
        />
        <path
          d={path(nodes.investment, nodes.fixed)}
          stroke={capitalColor}
          strokeWidth={investToFixed}
          fill="none"
          strokeOpacity="0.6"
          style={{ transition: "stroke-width 0.3s" }}
        />
        <path
          d={path(nodes.investment, nodes.cash)}
          stroke={capitalColor}
          strokeWidth={investToCash}
          fill="none"
          strokeOpacity="0.6"
          style={{ transition: "stroke-width 0.3s" }}
        />

        <text
          className="node-label"
          x={nodes.investment.x - 10}
          y={nodes.investment.y - 8}
          textAnchor="end"
        >
          One-time Investment
        </text>
        <text
          className="node-label"
          x={nodes.investment.x - 10}
          y={nodes.investment.y + 8}
          textAnchor="end"
        >{`$${formatCurrency(investment)}`}</text>
        <text
          className="node-label"
          x={nodes.revenue.x - 10}
          y={nodes.revenue.y - 8}
          textAnchor="end"
        >
          {`${periodLabel} Revenue`}
        </text>
        <text
          className="node-label"
          x={nodes.revenue.x - 10}
          y={nodes.revenue.y + 8}
          textAnchor="end"
        >
          {`$${formatCurrency(revenueTotal)}`}
        </text>
        {showTiers &&
          revenueByTier?.map((v, idx) => (
            <text
              key={idx}
              className="node-label"
              x={nodes.revenue.x - 10}
              y={nodes.revenue.y + 20 + idx * 12}
              textAnchor="end"
            >{`Tier ${idx + 1}: $${formatCurrency(v * months)}`}</text>
          ))}
        <text
          className="node-label"
          x={nodes.opex.x}
          y={nodes.opex.y - 8}
        >{`${periodLabel} Opex`}</text>
        <text
          className="node-label"
          x={nodes.opex.x}
          y={nodes.opex.y + 8}
        >{`$${formatCurrency(opexTotal)}`}</text>
        <text
          className="node-label"
          x={nodes.gp.x}
          y={nodes.gp.y - 8}
        >{`Gross Profit`}</text>
        <text
          className="node-label"
          x={nodes.gp.x}
          y={nodes.gp.y + 8}
        >{`$${formatCurrency(grossProfit)}`}</text>
        <text
          className="node-label"
          x={nodes.marketing.x}
          y={nodes.marketing.y - 8}
        >{`${periodLabel} Marketing`}</text>
        <text
          className="node-label"
          x={nodes.marketing.x}
          y={nodes.marketing.y + 8}
        >{`$${formatCurrency(marketingTotal)}`}</text>
        <text
          className="node-label"
          x={nodes.fixed.x}
          y={nodes.fixed.y - 8}
        >{`${periodLabel} Fixed`}</text>
        <text
          className="node-label"
          x={nodes.fixed.x}
          y={nodes.fixed.y + 8}
        >{`$${formatCurrency(fixedTotal)}`}</text>
        <text
          className="node-label"
          x={nodes.cash.x}
          y={nodes.cash.y - 8}
        >{`${periodLabel} Cash`}</text>
        <text
          className="node-label"
          x={nodes.cash.x}
          y={nodes.cash.y + 8}
        >{`$${formatCurrency(cashTotal)}`}</text>
        {Math.abs(roundingDiff) > 0.01 && (
          <text
            className="node-label"
            x={nodes.cash.x}
            y={height - 4}
            textAnchor="end"
          >
            {`Rounding Adj. $${formatCurrency(roundingDiff)}`}
          </text>
        )}
      </svg>
    </div>
  );
}
