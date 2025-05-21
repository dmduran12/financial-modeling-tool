import { formatCurrency } from "../utils/format";

interface Props {
  mrr: number;
  operatingExpenses: number;
  marketing: number;
  fixed: number;
  cash: number;
  investment: number;
}

export default function SankeyChart({
  mrr,
  operatingExpenses,
  marketing,
  fixed,
  cash,
  investment,
}: Props) {
  const inflowColor = "var(--accent-primary-500)";
  const outflowColor = "var(--accent-secondary-500)";
  const netColor = "var(--accent-primary-300)";
  const width = 600;
  const height = 200;
  const grossProfit = mrr - operatingExpenses;
  const scale = (v: number, total: number) =>
    Math.max(2, (v / (total || 1)) * 40);
  const nodes = {
    investment: { x: 20, y: height * 0.1 },
    revenue: { x: 20, y: height / 2 },
    opex: { x: 220, y: height * 0.25 },
    gp: { x: 220, y: height * 0.75 },
    marketing: { x: 420, y: height * 0.2 },
    fixed: { x: 420, y: height * 0.5 },
    cash: { x: 420, y: height * 0.8 },
  } as const;
  const path = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    `M ${a.x} ${a.y} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x} ${b.y}`;

  const mrrToOpex = scale(operatingExpenses, mrr);
  const mrrToGp = scale(grossProfit, mrr);
  const gpToMarketing = scale(marketing, grossProfit);
  const gpToFixed = scale(fixed, grossProfit);
  const gpToCash = scale(cash, grossProfit);
  const investToCash = scale(investment, investment);

  return (
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
      />
      <path
        d={path(nodes.revenue, nodes.gp)}
        stroke={inflowColor}
        strokeWidth={mrrToGp}
        fill="none"
        strokeOpacity="0.6"
      />
      <path
        d={path(nodes.gp, nodes.marketing)}
        stroke={outflowColor}
        strokeWidth={gpToMarketing}
        fill="none"
        strokeOpacity="0.6"
      />
      <path
        d={path(nodes.gp, nodes.fixed)}
        stroke={outflowColor}
        strokeWidth={gpToFixed}
        fill="none"
        strokeOpacity="0.6"
      />
      <path
        d={path(nodes.gp, nodes.cash)}
        stroke={netColor}
        strokeWidth={gpToCash}
        fill="none"
        strokeOpacity="0.6"
      />
      <path
        d={path(nodes.investment, nodes.cash)}
        stroke={outflowColor}
        strokeWidth={investToCash}
        fill="none"
        strokeOpacity="0.6"
      />

      <text
        className="node-label"
        x={nodes.investment.x - 10}
        y={nodes.investment.y - 8}
        textAnchor="end"
      >
        Investment
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
        Revenue
      </text>
      <text
        className="node-label"
        x={nodes.revenue.x - 10}
        y={nodes.revenue.y + 8}
        textAnchor="end"
      >
        {`$${formatCurrency(mrr)}`}
      </text>
      <text
        className="node-label"
        x={nodes.opex.x}
        y={nodes.opex.y - 8}
      >{`Opex`}</text>
      <text
        className="node-label"
        x={nodes.opex.x}
        y={nodes.opex.y + 8}
      >{`$${formatCurrency(operatingExpenses)}`}</text>
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
      >{`Marketing`}</text>
      <text
        className="node-label"
        x={nodes.marketing.x}
        y={nodes.marketing.y + 8}
      >{`$${formatCurrency(marketing)}`}</text>
      <text
        className="node-label"
        x={nodes.fixed.x}
        y={nodes.fixed.y - 8}
      >{`Fixed`}</text>
      <text
        className="node-label"
        x={nodes.fixed.x}
        y={nodes.fixed.y + 8}
      >{`$${formatCurrency(fixed)}`}</text>
      <text
        className="node-label"
        x={nodes.cash.x}
        y={nodes.cash.y - 8}
      >{`Cash`}</text>
      <text
        className="node-label"
        x={nodes.cash.x}
        y={nodes.cash.y + 8}
      >{`$${formatCurrency(cash)}`}</text>
    </svg>
  );
}
