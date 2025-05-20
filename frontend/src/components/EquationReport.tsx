import Card from "./Card";

export default function EquationReport() {
  return (
    <div>
      <h3 className="content-header">Model Equations</h3>
      <Card>
        <ul className="text-sm leading-snug list-disc pl-6 space-y-2 font-mono">
          <li>
            <span className="font-semibold">Impressions</span> = (Marketing
            Budget / Cost per 1K Impressions) × 1000
          </li>
          <li>
            <span className="font-semibold">Clicks</span> = Impressions × CTR
          </li>
          <li>
            <span className="font-semibold">Leads</span> = Marketing Budget /
            Cost Per Lead
          </li>
          <li>
            <span className="font-semibold">New Customers</span> = Leads ×
            Conversion Rate
          </li>
          <li>
            <span className="font-semibold">Churned Customers</span> = Customers
            × Churn Rate
          </li>
          <li>
            <span className="font-semibold">Customers Next Month</span> =
            Customers + New Customers − Churned Customers
          </li>
          <li>
            <span className="font-semibold">MRR</span> = Customers × Average
            Revenue Per Customer
          </li>
          <li>
            <span className="font-semibold">Subscriber LTV</span> = [Average
            Revenue Per Customer × (1 − Operating Expense %)] / Churn Rate
          </li>
          <li>
            <span className="font-semibold">Gross Profit</span> = MRR × (1 −
            Operating Expense %)
          </li>
          <li>
            <span className="font-semibold">Monthly Cash Flow</span> = Gross
            Profit − Fixed Costs − Marketing Spend
          </li>
          <li>
            <span className="font-semibold">Blended CPL</span> = Marketing
            Budget / Leads
          </li>
          <li>
            <span className="font-semibold">Blended CVR</span> = (New Customers
            / Leads) × 100
          </li>
          <li>
            <span className="font-semibold">NPV</span> = ∑ Cash Flow / (1 + WACC
            / 12)<sup>n</sup> − Initial Investment
          </li>
        </ul>
      </Card>
    </div>
  );
}
