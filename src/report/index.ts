/**
 * `@rtkelly13/design-system/report` — the TSX-to-HTML report generator.
 *
 * A separate entry point on purpose. It imports `esbuild` and `tailwindcss`,
 * both of which are optional peers and Node-only, so pulling it into the main
 * entry would make every consumer of the components carry a build toolchain.
 */

export { renderReport, renderReports } from './render';
export type {
  ReportOptions,
  RenderReportOptions,
  RenderReportsOptions,
  RenderReportResult,
} from './render';
export { extractCandidates } from './candidates';
export { lintReport, formatProblems } from './lint';
export type { ReportProblem, Severity } from './lint';
export { buildReportCss, createReportCssCompiler } from './css';
export type { ReportCssOptions, ReportCssCompiler } from './css';
export { documentShell } from './shell';
export { typecheckReports, findChecker } from './typecheck';
export type { Checker, TypecheckResult } from './typecheck';
export type { DocumentShellOptions } from './shell';
