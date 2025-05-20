import Card from "./Card";

interface Props {
  impressions: number[];
  clicks: number[];
  leads: number[];
  newCustomers: number[];
  marketingBudget: number;
}

export default function FunnelTable({
  impressions,
  clicks,
  leads,
  newCustomers,
  marketingBudget,
}: Props) {
  const months = ["M1", "M2", "M3"];

  const renderCells = (arr: number[], fmt: (v: number) => string) =>
    months.map((_, i) => <td key={i}>{fmt(arr[i] || 0)}</td>);

  return (
    <div>
      <h3 className="content-header">Funnel Metrics</h3>
      <Card className="overflow-x-auto">
        <table className="funnel-table text-xs w-full font-mono">
          <thead>
            <tr>
              <th></th>
              {months.map((m) => (
                <th key={m}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Impr</td>
              {renderCells(impressions, (v) => Math.round(v).toLocaleString())}
            </tr>
            <tr>
              <td>Clicks</td>
              {renderCells(clicks, (v) => Math.round(v).toLocaleString())}
            </tr>
            <tr>
              <td>Leads</td>
              {renderCells(leads, (v) => Math.round(v).toLocaleString())}
            </tr>
            <tr>
              <td>NewCust</td>
              {renderCells(newCustomers, (v) => Math.round(v).toLocaleString())}
            </tr>
            <tr>
              <td>BlendedCPL</td>
              {renderCells(leads, (v) =>
                v ? `$${(marketingBudget / v).toFixed(0)}` : "—",
              )}
            </tr>
            <tr>
              <td>BlendedCVR</td>
              {renderCells(
                leads.map((l, i) => (l ? (newCustomers[i] / l) * 100 : 0)),
                (v) => `${v.toFixed(1)}%`,
              )}
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
