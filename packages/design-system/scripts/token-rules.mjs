/**
 * Compatibility shim — the rules now live in `src/lib/tokenRules.ts`.
 *
 * They moved because they became part of the published surface: a consumer
 * writing a report is held to the same colour-instead-of-role rule this
 * repository holds itself to, and a rule that ships cannot live in a script
 * that does not. `scripts/` is not in `files`.
 *
 * This file stays so the two script consumers — `eslint-token-rule.mjs` and
 * `check-tokens.mjs` — keep one import path between them, and so that the
 * next reader who greps for `token-rules` lands somewhere that explains
 * itself rather than on a dangling reference. Node strips the types on the
 * way through.
 */

export { TOKEN_RULES, scanRules, scanTokenRules } from '../src/lib/tokenRules.ts';
