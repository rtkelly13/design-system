import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard } from '../components/StatCard';
import { Activity, Cpu, ShieldCheck, DollarSign } from 'lucide-react';

const meta: Meta<typeof StatCard> = {
  title: 'Foundations/StatCard',
  component: StatCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

/**
 * The full set: figure, delta, context line, icon and accent. Note the two
 * colour channels are independent — `accent` decides which card in a row the
 * eye reaches first, `changeType` decides whether the movement reads as good.
 */
export const SystemHealth: Story = {
  args: {
    title: 'SYSTEM HEALTH',
    value: '99.98%',
    change: '+0.04%',
    changeType: 'positive',
    subtitle: '42 Nodes Healthy',
    icon: Activity,
    accent: 'cyan',
  },
};

/**
 * Why `changeType` is explicit rather than inferred. The delta here is
 * *negative* — `-3.1 ms` — and it is good news, so it renders in the success
 * colour. A component that read the sign would get every latency and error-rate
 * card backwards.
 */
export const ComputeLatency: Story = {
  args: {
    title: 'COMPUTE LATENCY',
    value: '14.2 ms',
    change: '-3.1 ms',
    changeType: 'positive',
    subtitle: 'Sub-20ms SLA MET',
    icon: Cpu,
    accent: 'pink',
  },
};

/**
 * `change` is a string, not a number, so a card can report a verdict rather
 * than a delta. `subtitle` carries the evidence for it.
 */
export const SecurityAudit: Story = {
  args: {
    title: 'SECURITY AUDIT',
    value: '100%',
    change: 'PASSED',
    changeType: 'positive',
    icon: ShieldCheck,
    accent: 'green',
    subtitle: '0 Critical Alerts',
  },
};
