/**
 * Adapted from mdxcn by Keshav Bagaade, MIT licensed.
 * Source: https://github.com/keshav-exe/mdxcn/blob/2928126ba146ebbae9c2351deca27d27bb40e744/registry/default/graph-diff/graph-diff.tsx
 * The local port removes motion and graph variables while retaining the
 * source component's Markdown and `<Line>` data forms.
 */

import type { ReactNode } from 'react';
import {
  childItems,
  defineItem,
  Graph,
  GraphBody,
  GraphRule,
  hasHost,
  itemText,
  listItems,
  splitLabel,
  textOf,
  type GraphPalette,
} from './GraphFrame';
import { cn } from '../../../lib/recipe';

export type DiffSign = 'add' | 'remove' | 'keep';

export interface DiffRow {
  /** Falls back to the child text for `<Line value="31 kb">app</Line>`. */
  label?: string;
  value: string;
  sign?: DiffSign;
}

export interface DiffLineProps extends DiffRow {
  /** Draw the row under a rule as the total. */
  total?: boolean;
}

export interface GraphDiffProps {
  /** Short caption shown in the graph frame. */
  title: string;
  /** Data form. If omitted, the component reads Markdown or `<Line>` children. */
  rows?: DiffRow[];
  /** Optional typed total shown below the row rule. */
  footer?: DiffRow;
  /** Markdown list or `<Line>` content used to derive rows. */
  children?: ReactNode;
  /** Accent palette used for additions and removals. */
  palette?: GraphPalette;
  /** Character used at each frame corner. */
  corner?: string;
  /** Additional classes for the outer figure. */
  className?: string;
}

/** MDX-only diff item, for example `<Line sign="add" value="31 kb">app</Line>`. */
export const Line = defineItem<DiffLineProps>('Line');

function signOf(value: string): DiffSign | undefined {
  if (/^\+/.test(value.trim())) return 'add';
  if (/^[−-]/.test(value.trim())) return 'remove';
  return undefined;
}

function diffFromList(children: ReactNode): DiffLineProps[] {
  return listItems(children).map((item) => {
    const { label, rest } = splitLabel(itemText(item));
    const content = (item.props as { children?: ReactNode }).children;
    return {
      label,
      value: rest.replace(/^[+−-]\s*/, '') || rest,
      sign: signOf(rest),
      total: hasHost(content, ['strong', 'b']),
    };
  });
}

function signClass(palette: GraphPalette | undefined, sign: DiffSign): string {
  if (sign === 'add') return 'text-accent-primary';
  if (sign === 'remove') return palette === 'multi' ? 'text-accent-secondary' : 'text-content-secondary';
  return 'text-content-primary';
}

function lineText(row: DiffRow): string {
  return `${row.label ?? ''} ${row.value}`.trim();
}

/** Renders additions, removals, and unchanged rows with a readable text summary. */
export function GraphDiff({ title, rows: rowsProp, footer: footerProp, children, palette, corner, className }: GraphDiffProps) {
  const listed = diffFromList(children);
  const tagged = childItems(children, Line).map((entry) => ({ ...entry, label: entry.label ?? textOf(entry.children) }));
  const lines = listed.length > 0 ? listed : tagged;
  const rows = (rowsProp ?? lines.filter((entry) => !entry.total)).map((entry) => ({ ...entry, label: entry.label ?? '' }));
  const footerLine = footerProp ?? lines.find((entry) => entry.total);
  const footer = footerLine ? { ...footerLine, label: footerLine.label ?? '' } : undefined;

  return (
    <Graph title={title} className={className} corner={corner}>
      <GraphBody className="flex flex-col gap-3">
        <ul className="flex flex-col gap-2" aria-label={`${title} changes`}>
          {rows.map((row, index) => {
            const sign = row.sign ?? 'keep';
            const tone = signClass(palette, sign);
            return (
              <li className="grid grid-cols-[1.25rem_minmax(0,1fr)_8ch] items-baseline gap-x-3" key={`${lineText(row)}-${index}`} aria-label={`${sign}: ${lineText(row)}`}>
                <span aria-hidden="true" className={cn('select-none text-center', sign === 'keep' ? 'text-content-muted' : tone)}>{sign === 'keep' ? ' ' : sign === 'add' ? '+' : '-'}</span>
                <span className={tone}>{row.label}</span>
                <span className={cn('text-right tabular-nums', tone)}>{row.value}</span>
              </li>
            );
          })}
        </ul>
        {footer ? <><GraphRule /><div className="grid grid-cols-[1.25rem_minmax(0,1fr)_8ch] items-baseline gap-x-3" aria-label={`total: ${lineText(footer)}`}><span aria-hidden="true" className="text-content-muted"> </span><span className="text-content-primary">{footer.label}</span><span className="text-right tabular-nums text-content-primary">{footer.value}</span></div></> : null}
        <span className="sr-only">{rows.length === 0 && !footer ? 'Empty diff.' : `${rows.length} changed row${rows.length === 1 ? '' : 's'}${footer ? `, total ${lineText(footer)}` : ''}.`}</span>
      </GraphBody>
    </Graph>
  );
}
