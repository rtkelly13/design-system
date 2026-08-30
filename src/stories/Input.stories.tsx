import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input, TextArea, Select } from '../components/Input';

const meta: Meta<typeof Input> = {
  title: 'Foundations/Input',
  component: Input,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

/**
 * Label, control and helper text, wired together. The `id` comes from `useId`
 * rather than a slug of the label, so two fields labelled the same way on one
 * page still focus their own control.
 */
export const DefaultInput: Story = {
  args: {
    label: 'API Key',
    placeholder: 'sk-brutalist-...',
    helperText: 'Required for cloud SDK authentication',
    accent: 'cyan',
  },
};

/**
 * `error` replaces `helperText` rather than stacking under it, and turns the
 * border to the danger role. One message at a time: the one telling the reader
 * what to fix.
 */
export const InputWithError: Story = {
  args: {
    label: 'Workspace Domain',
    value: 'invalid-domain-name',
    error: 'Domain must end with .internal or .dev',
    accent: 'pink',
  },
};

/**
 * The multi-line shape. Same label, error and helper contract as `Input` — the
 * only difference is box padding instead of line padding, which is a variant of
 * the shared recipe rather than a separate component.
 */
export const TextAreaStory: StoryObj<typeof TextArea> = {
  render: () => (
    <TextArea
      label="System Configuration (YAML)"
      rows={4}
      defaultValue={`version: "2.0"\ncluster: us-east-1\nauto_scale: true`}
    />
  ),
};

/**
 * The choice shape, taking `options` as data rather than `<option>` children so
 * a caller cannot style the list into something the native control will not
 * render.
 */
export const SelectStory: StoryObj<typeof Select> = {
  render: () => (
    <Select
      label="Deployment Region"
      options={[
        { label: 'US East (N. Virginia)', value: 'us-east-1' },
        { label: 'EU West (Frankfurt)', value: 'eu-west-1' },
        { label: 'AP South (Singapore)', value: 'ap-south-1' },
      ]}
    />
  ),
};
