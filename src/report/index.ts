/**
 * `@rtkelly13/design-system/report` — the TSX-to-HTML report generator.
 *
 * A separate entry point on purpose. It imports `esbuild` and `tailwindcss`,
 * both of which are optional peers and Node-only, so pulling it into the main
 * entry would make every consumer of the components carry a build toolchain.
 */

export { renderReport } from './render';
export type { RenderReportOptions, RenderReportResult } from './render';
export { extractCandidates } from './candidates';
export { buildReportCss } from './css';
export type { ReportCssOptions } from './css';
export { documentShell } from './shell';
export type { DocumentShellOptions } from './shell';
