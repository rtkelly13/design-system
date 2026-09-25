/**
 * Adapted from mdxcn by Keshav Bagaade, MIT licensed.
 * Source: https://github.com/keshav-exe/mdxcn/blob/2928126ba146ebbae9c2351deca27d27bb40e744/registry/default/terminal/terminal.tsx
 * The local port replaces motion and graph variables with deterministic
 * rendering, semantic tokens, and a keyboard-focusable scrolling surface.
 */

import type { ReactNode } from 'react';
import { Graph, GraphBody, textOf } from './GraphFrame';
import { cn } from '../../../lib/recipe';

export interface TerminalProps {
  /** Frame caption. Defaults to `shell`. */
  title?: string;
  /** Prompt glyph marking a command line. Defaults to `$`. */
  prompt?: string;
  /** Plain lines or a fenced code block. `$ cmd` is a command and `# …` a comment. */
  children?: ReactNode;
  /** Character used at each frame corner. */
  corner?: string;
  /** Additional classes for the outer figure. */
  className?: string;
}

type TerminalLine = { kind: 'command' | 'comment' | 'ok' | 'output'; text: string };

function parse(source: string, prompt: string): TerminalLine[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  while (lines.length > 0 && lines[0]?.trim() === '') lines.shift();
  while (lines.length > 0 && lines[lines.length - 1]?.trim() === '') lines.pop();
  return lines.map((raw) => {
    const text = raw.replace(/\s+$/, '');
    if (text.startsWith(`${prompt} `) || text === prompt) return { kind: 'command', text: text.slice(prompt.length).trimStart() };
    if (text.startsWith('#')) return { kind: 'comment', text };
    if (/^[✓✔√]/.test(text)) return { kind: 'ok', text };
    return { kind: 'output', text };
  });
}

/** Renders a shell session with command, comment, success, and output line semantics. */
export function Terminal({ title = 'shell', prompt = '$', children, corner, className }: TerminalProps) {
  const lines = parse(textOf(children), prompt);
  return (
    <Graph className={className} corner={corner} title={title}>
      <GraphBody className="overflow-x-auto">
        <pre className="m-0 flex min-w-max flex-col gap-0.5 whitespace-pre leading-relaxed" role="region" tabIndex={0} aria-label={`${title} terminal output`}>
          {lines.map((line, index) => <code className={cn('grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-2', line.kind === 'command' ? 'text-content-primary' : line.kind === 'ok' ? 'text-accent-primary' : 'text-content-muted')} key={`${index}-${line.text}`}>
            <span aria-hidden="true" className={cn('select-none text-center', line.kind === 'command' ? 'text-accent-primary' : 'text-transparent')}>{line.kind === 'command' ? prompt : ' '}</span>
            <span>{line.text || ' '}</span>
          </code>)}
        </pre>
        <span className="sr-only">Terminal with {lines.length} line{lines.length === 1 ? '' : 's'}.</span>
      </GraphBody>
    </Graph>
  );
}
