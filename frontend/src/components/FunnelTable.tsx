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
  const months = [0, 1, 2];
  const rows = [
    { label: "Impr", values: impressions },
    { label: "Clicks", values: clicks },
    { label: "Leads", values: leads },
    { label: "NewCust", values: newCustomers },
    {
      label: "BlendedCPL",
      values: months.map((i) => (leads[i] ? marketingBudget / leads[i] : 0)),
    },
    {
      label: "BlendedCVR",
      values: months.map((i) =>
        leads[i] ? (newCustomers[i] / leads[i]) * 100 : 0,
      ),
    },
  ];
  return (
    <div>
      <h3 className="content-header">Funnel Metrics</h3>
      <Card>
        <table className="funnel-table w-full text-right text-xs">
          <thead>
            <tr>
              <th className="text-left">Metric</th>
              {months.map((i) => (
                <th key={i}>{`M${i + 1}`}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="text-left">{row.label}</td>
                {months.map((i) => (
                  <td key={i}>
                    {row.values[i]?.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
