import { h, render, Component } from 'https://cdn.skypack.dev/preact@10.15.1';
import { useState } from 'https://cdn.skypack.dev/preact@10.15.1/hooks';

function Dashboard() {
  const [inputs, setInputs] = useState({
    mrr: 1000,
    arpu: 50,
    churn_rate: 0.05,
    active_users: 20,
    marketing_spend: 5000,
    cost_per_lead: 100,
    conversion_rate: 0.05,
    wacc: 0.15,
    irr: 7.77,
    stripe_fee: 0.029,
    carbon_cost: 18
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: parseFloat(e.target.value) });
  };

  const calculate = async () => {
    const resp = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kpi: { mrr: inputs.mrr, arpu: inputs.arpu, churn_rate: inputs.churn_rate, active_users: inputs.active_users },
        marketing: { marketing_spend: inputs.marketing_spend, cost_per_lead: inputs.cost_per_lead, conversion_rate: inputs.conversion_rate },
        financial: { wacc: inputs.wacc, irr: inputs.irr, stripe_fee: inputs.stripe_fee, carbon_cost: inputs.carbon_cost }
      })
    });
    const data = await resp.json();
    setResult(data);
  };

  return (
    h('div', {}, [
      h('h1', { class: 'text-2xl font-bold mb-4' }, 'Catona Climate Dashboard'),
      h('div', { class: 'grid grid-cols-2 gap-4' }, [
        h('div', {}, [
          h('label', {}, 'MRR'),
          h('input', { class: 'border', type: 'number', name: 'mrr', value: inputs.mrr, onInput: handleChange })
        ]),
        h('div', {}, [
          h('label', {}, 'ARPU'),
          h('input', { class: 'border', type: 'number', name: 'arpu', value: inputs.arpu, onInput: handleChange })
        ]),
        h('div', {}, [
          h('label', {}, 'Churn Rate'),
          h('input', { class: 'border', type: 'number', step: '0.01', name: 'churn_rate', value: inputs.churn_rate, onInput: handleChange })
        ]),
        h('div', {}, [
          h('label', {}, 'Active Users'),
          h('input', { class: 'border', type: 'number', name: 'active_users', value: inputs.active_users, onInput: handleChange })
        ]),
        h('div', {}, [
          h('label', {}, 'Marketing Spend'),
          h('input', { class: 'border', type: 'number', name: 'marketing_spend', value: inputs.marketing_spend, onInput: handleChange })
        ]),
        h('div', {}, [
          h('label', {}, 'Cost Per Lead'),
          h('input', { class: 'border', type: 'number', name: 'cost_per_lead', value: inputs.cost_per_lead, onInput: handleChange })
        ]),
        h('div', {}, [
          h('label', {}, 'Conversion Rate'),
          h('input', { class: 'border', type: 'number', step: '0.01', name: 'conversion_rate', value: inputs.conversion_rate, onInput: handleChange })
        ])
      ]),
      h('button', { class: 'mt-4 px-4 py-2 bg-blue-500 text-white', onClick: calculate }, 'Calculate'),
      result && h('div', { class: 'mt-4 p-4 bg-white rounded shadow' }, [
        h('p', {}, `Annual Revenue: $${result.annual_revenue.toFixed(2)}`),
        h('p', {}, `LTV: $${result.ltv.toFixed(2)}`),
        h('p', {}, `CAC: $${result.cac.toFixed(2)}`)
      ])
    ])
  );
}

render(h(Dashboard), document.getElementById('root'));
