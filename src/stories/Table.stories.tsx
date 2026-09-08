import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/Table';

/**
 * The unstyled table primitive, as eight parts rather than one component with a
 * `columns` prop.
 *
 * That split is the point. `DataTable` takes columns and data and decides the
 * markup for you, which is right until the moment a cell needs to be a link, a
 * row needs a colspan, or a footer needs to total a column — at which point a
 * configuration-driven table becomes a fight. These parts are the escape hatch:
 * every one is a thin wrapper over the corresponding HTML element, carrying the
 * system's borders and type and nothing else, so a caller composes real table
 * markup and keeps the semantics the browser and screen readers rely on.
 *
 * `Table` renders the scroll container as well as the `<table>`, because a table
 * that overflows its column is the single most common way one breaks a page.
 */
const meta: Meta<typeof Table> = {
  title: 'Foundations/Table',
  component: Table,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

/**
 * All eight parts in one table: caption, header, body, footer.
 *
 * Worth noticing what the parts do *not* do — there is no sorting, no
 * pagination, no empty state. Those belong to `DataTable`, which builds on this.
 * A primitive that grew them would leave nothing to escape to.
 */
export const Composed: Story = {
  render: () => (
    <div className="max-w-2xl p-8">
      <Table>
        <TableCaption>Deploys this week, by environment.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>[ ENVIRONMENT ]</TableHead>
            <TableHead>[ DEPLOYS ]</TableHead>
            <TableHead>[ FAILED ]</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>production</TableCell>
            <TableCell>12</TableCell>
            <TableCell>0</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>staging</TableCell>
            <TableCell>47</TableCell>
            <TableCell>3</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>preview</TableCell>
            <TableCell>128</TableCell>
            <TableCell>9</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>total</TableCell>
            <TableCell>187</TableCell>
            <TableCell>12</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  ),
};

/**
 * A row marked `data-state="selected"`, and a cell holding a link rather than
 * text.
 *
 * Both are things a `columns`-driven table has to invent an API for — a
 * `rowClassName` callback, a `renderCell` escape — and both are ordinary JSX
 * here. This is the case that justifies the parts existing at all.
 */
export const SelectionAndRichCells: Story = {
  render: () => (
    <div className="max-w-2xl p-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>[ SERVICE ]</TableHead>
            <TableHead>[ OWNER ]</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>api-gateway</TableCell>
            <TableCell>
              <a className="text-accent-primary underline" href="#owner">
                platform
              </a>
            </TableCell>
          </TableRow>
          <TableRow data-state="selected">
            <TableCell>image-resizer</TableCell>
            <TableCell>
              <a className="text-accent-primary underline" href="#owner">
                media
              </a>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};

/**
 * A table wider than its container.
 *
 * `Table` owns the scroll container, so this scrolls sideways *inside the
 * table* rather than pushing the page out. Getting this wrong is how a table
 * takes a whole layout with it, which is why the container is not optional.
 */
export const Overflowing: Story = {
  render: () => (
    <div className="max-w-md p-8">
      <Table>
        <TableHeader>
          <TableRow>
            {['REGION', 'INSTANCES', 'CPU', 'MEMORY', 'DISK', 'UPTIME'].map(
              (h) => (
                <TableHead key={h}>[ {h} ]</TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>eu-west-1</TableCell>
            <TableCell>24</TableCell>
            <TableCell>61%</TableCell>
            <TableCell>44%</TableCell>
            <TableCell>72%</TableCell>
            <TableCell>31d</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>us-east-1</TableCell>
            <TableCell>108</TableCell>
            <TableCell>78%</TableCell>
            <TableCell>66%</TableCell>
            <TableCell>51%</TableCell>
            <TableCell>9d</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
