#!/usr/bin/env node
/**
 * `ds-report <report.tsx> [options]`
 *
 * The agent-facing surface. Deliberately thin: parse flags, call
 * `renderReport`, print one line of what happened, and turn a missing optional
 * peer into an instruction rather than a stack trace.
 */

import process from 'node:process';
import { THEME_LEVELS, type ThemeLevel } from '../theme/levels';
import { renderReport } from './render';

const USAGE = `ds-report — render a TSX report to one self-contained HTML file

  ds-report <report.tsx> [options]

Options
  -o, --output <file>   Where to write. Default: the input with an .html extension.
  -t, --theme <level>   Theme ladder rung: ${THEME_LEVELS.join(' | ')}. Default: white.
      --title <text>    Document <title>. Default: the input's filename.
      --offline         Drop the webfont import; fall back to system type.
  -h, --help            This text.

The report must default-export a React component. Compose it from
@rtkelly13/design-system — ReportDocument and ReportSection are the frame.
`;

interface Parsed {
  input?: string;
  output?: string;
  theme?: string;
  title?: string;
  offline: boolean;
  help: boolean;
}

function parse(argv: readonly string[]): Parsed {
  const parsed: Parsed = { offline: false, help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index] as string;
    const next = () => {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('-')) throw new Error(`${argument} needs a value.`);
      index += 1;
      return value;
    };
    switch (argument) {
      case '-o':
      case '--output':
        parsed.output = next();
        break;
      case '-t':
      case '--theme':
        parsed.theme = next();
        break;
      case '--title':
        parsed.title = next();
        break;
      case '--offline':
        parsed.offline = true;
        break;
      case '-h':
      case '--help':
        parsed.help = true;
        break;
      default:
        if (argument.startsWith('-')) throw new Error(`Unknown option ${argument}.`);
        if (parsed.input) throw new Error('Only one report file at a time.');
        parsed.input = argument;
    }
  }
  return parsed;
}

/**
 * `esbuild` and `tailwindcss` are optional peers — a consumer who only renders
 * components should not be made to install a build toolchain. That trade is only
 * defensible if the failure says so precisely.
 */
function explain(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const missing = /Cannot find (?:package|module) '(esbuild|tailwindcss)'/.exec(message);
  if (missing) {
    return `ds-report needs ${missing[1]}, which is an optional peer dependency of this package.\n  pnpm add -D esbuild tailwindcss`;
  }
  return message;
}

async function main(argv: readonly string[]) {
  const options = parse(argv);
  if (options.help || !options.input) {
    process.stdout.write(USAGE);
    process.exitCode = options.input ? 0 : 1;
    return;
  }
  const result = await renderReport({
    input: options.input,
    output: options.output,
    title: options.title,
    theme: options.theme as ThemeLevel | undefined,
    offline: options.offline,
  });
  process.stdout.write(
    `${result.output}  ${(result.bytes / 1024).toFixed(1)}kB, ${result.candidates} utilities\n`,
  );
}

main(process.argv.slice(2)).catch((error: unknown) => {
  process.stderr.write(`ds-report: ${explain(error)}\n`);
  process.exitCode = 1;
});
