import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import InlineNumberInput from '../components/InlineNumberInput';

const meta: Meta<typeof InlineNumberInput> = {
  title: 'InlineNumberInput',
  component: InlineNumberInput,
};
export default meta;
type Story = StoryObj<typeof InlineNumberInput>;

export const AllRows: Story = {
  render: () => {
    const [state, setState] = useState({
      tier1: 1000,
      budget: 5000,
      cpl: 50,
      cvr: 10,
      months: 24,
    });
    return (
      <div className="space-y-3 max-w-xs">
        <InlineNumberInput label="Tier 1" unit="$" value={state.tier1} onChange={(v) => setState({ ...state, tier1: v })} />
        <InlineNumberInput label="Budget" unit="$" value={state.budget} onChange={(v) => setState({ ...state, budget: v })} />
        <InlineNumberInput label="CPL" unit="$" value={state.cpl} onChange={(v) => setState({ ...state, cpl: v })} />
        <InlineNumberInput label="CVR" unit="%" value={state.cvr} onChange={(v) => setState({ ...state, cvr: v })} />
        <InlineNumberInput label="Months" value={state.months} onChange={(v) => setState({ ...state, months: v })} />
      </div>
    );
  },
};
