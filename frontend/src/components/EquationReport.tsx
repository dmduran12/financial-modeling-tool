import Card from "./Card";

export default function EquationReport() {
  return (
    <div>
      <h3 className="content-header">Model Equations</h3>
      <Card>
        <ul className="text-sm list-disc pl-6 space-y-1 font-mono">
          <li>
            Impressions = (Marketing Budget / Cost per 1K impressions) × 1000
          </li>
          <li>Clicks = Impressions × CTR</li>
          <li>Leads = Marketing Budget ÷ Cost Per Lead</li>
          <li>New Customers = Leads × Conversion Rate</li>
          <li>Churned Customers = Customers × Churn Rate</li>
          <li>
            Customers Next Month = Customers + New Customers − Churned Customers
          </li>
          <li>MRR = Customers × Average Revenue Per Customer</li>
          <li>
            Subscriber LTV = [Average Revenue Per Customer × (1 − Operating
            Expense %)] / Churn Rate
          </li>
          <li>Gross Profit = MRR × (1 − Operating Expense %)</li>
          <li>
            Monthly Cash Flow = Gross Profit − Fixed Costs − Marketing Spend
          </li>
          <li>
            NPV = ∑ Cash Flow / (1 + WACC / 12)<sup>n</sup> − Initial Investment
          </li>
          <li>Blended CPL = Marketing Budget ÷ Leads</li>
          <li>Blended CVR = New Customers ÷ Leads</li>
        </ul>
      </Card>
    </div>
  );
}
