# AGENTS.md

Foundational brutalist design system for ryankelly.dev and personal web applications (`@rtkelly13/design-system`, published to public npm).

Package manager is **pnpm** (`node >=22`).

---

## 🛑 Repository Conventions & Workflow Policy

1. **Squash Merge Only**: All pull requests must be merged into `main` using **Squash and Merge** exclusively.
2. **Delete Branch on Merge**: Feature branches must be automatically or manually deleted immediately upon merge into `main`.
3. **Linear History**: Maintain a strictly linear history. Rebase feature branches onto `main` before merging; no merge commits allowed.
4. **Publishing (npm, trusted publishing)**:
   - Stable releases publish automatically from pushes to `main` via `publish-package.yml`, using npm **Trusted Publishing** (OIDC) — no tokens anywhere. Bump `package.json` version in the PR; the workflow skips already-published versions.
   - Dev prereleases: comment **`/publish-dev`** on a PR to publish `<version>-dev.<pr>.<sha>` under the `dev` dist-tag (`publish-dev-command.yml` dispatches the trusted workflow on the PR branch). Consumers test with `pnpm add @rtkelly13/design-system@dev`.
   - The Tailwind contract consumers import is **`theme.css`** (`@theme` tokens, per-level and polarity variants, `@source`) — now **generated** from `src/theme/levels.ts`; `styles.css` layers fonts + global resets on top. There is no JS tailwind preset — do not reintroduce one.
5. **Visual Regression Testing**:
   - Powered by Playwright snapshot testing (`tests/visual.spec.ts`).
   - Runs strictly on **Linux CI** to avoid OS font rendering diffs. Current tolerance is `maxDiffPixelRatio: 0.05` with `threshold: 0.2` (this file previously claimed `0.002`, which has never been the configured value). That tolerance was only ever exercised against a placeholder image — see the next bullet — so it is probably looser than it needs to be now that baselines are real components; tighten deliberately rather than by accident.
   - **Clean URLs must stay off in the static server.** `serve` enables them by default, which 301s `/iframe.html?id=<story>` to `/iframe` and **drops the query string**. Storybook then has no story to select and renders its "No Preview" placeholder — and because `--update-snapshots` will happily bake that placeholder in as the baseline, the whole suite silently passes while testing nothing. That is exactly what happened up to `0.0.5`: all five baselines were the same error page. Both Playwright configs therefore pass `--config ../serve.json`, which sets `cleanUrls: false`; see "`serve.json` is load-bearing" below. `tests/story-ready.ts` is the second line of defence, asserting on Storybook's `sb-show-main` / `sb-show-nopreview` / `sb-show-errordisplay` body classes so a non-render fails loudly rather than being screenshotted.
   - Run manual snapshot updates via GitHub Actions `Update Visual Regression Snapshots` workflow (dispatch it on your branch; it commits regenerated baselines back to that branch — this repo blocks Actions from creating PRs).
   - **The update runs in `missing` mode by default**, writing only baselines that do not exist. That matters: a bare `--update-snapshots` presets to `changed`, so a run intended to add one new story would also re-record every baseline whose render had drifted — which is exactly how a regression becomes the expectation. Say **`/update-snapshots all`** (or `changed`) when a change is *meant* to alter rendering; the mode is echoed back in the PR comment so a reviewer can tell "two added" from "everything re-recorded".
   - Note that the snapshot workflow pushes as `github-actions[bot]`, and CI runs on bot-authored commits land in **`action_required`** — they need an "Approve and run" click before the PR shows a green check.
6. **Required Checks**:
   - `pnpm tokens:check` (theme.css matches `src/theme/levels.ts`)
   - `pnpm check:contrast` (every role pair, every level)
   - `pnpm check:tokens` (colour-instead-of-role ratchet)
   - `pnpm check:css` (styling-in-CSS ratchet)
   - `pnpm check:deps` (dependency reasons, sections and usage)
   - `pnpm check:visual-coverage` (every story asserted or excluded with a reason)
   - `pnpm typecheck`
   - `pnpm build`
   - `pnpm build-storybook`
   - `pnpm test:visual` (Linux CI)
7. **New Components Need Baselines**: adding a story without a snapshot leaves
   `test:visual` unable to assert it. Add the story first, comment
   **`/update-snapshots`** on the PR to generate baselines, then add the
   corresponding case to `tests/visual.spec.ts`.
   This is no longer a convention you have to remember: `pnpm check:visual-coverage`
   reads Storybook's own build index and fails when a story is neither asserted
   nor listed in `EXCLUDED` with a reason. It is a ratchet — the 20 stories that
   were already ungated are budgeted and burn down, but a *new* one cannot land
   unasserted. It also catches the reverse: an `id` in the spec that Storybook
   no longer builds, i.e. a test asserting nothing.
8. **Re-baselining Happens In The PR**: any change that legitimately alters
   rendering turns the visual check red. Comment **`/update-snapshots`** on the
   PR — it regenerates on Linux, verifies the suite passes against the new
   baselines, commits them back to the branch, and reports what changed. No
   merge required. `workflow_dispatch` still works for baselining `main`.
   Caveat: the baseline commit is pushed with `GITHUB_TOKEN`, and GitHub does
   not start workflow runs from those pushes, so the PR's own visual check keeps
   its previous result until you re-run it or push again. The verification step
   inside the update run is what tells you the new baselines are good.
   Closing that last gap needs a push identity that is not `GITHUB_TOKEN` —
   designed, with the exact token to create, in
   [`docs/ci-dispatch-token.md`](./docs/ci-dispatch-token.md). Not implemented;
   nothing reads `CI_DISPATCH_TOKEN` yet.

---

## 🎨 Design System Principles

- **Zero Border-Radius**: `0px` globally enforced.
- **Hard Offset Shadows**: `shadow-hard-*` utilities (2px, 4px, 6px offset, no blur).
- **A Four-Rung Theme Ladder**: `midnight` → `dim` → `bright` → `white`, selected by a `data-theme` attribute. Not a light/dark flip — see Theme Ladder below.
- **Bracketed Display Typography**: Headings render in Space Grotesk enclosed in `[ BRACKETED ]` display type.
- **Semantic Roles Over Hues**: Components address roles, never colours. See below.
- **Styling Lives in TSX**: Tailwind utilities on the element. CSS files declare variables and nothing else. See below.

---

## 🧱 Styling Lives in TSX

**A component's appearance is written on its elements, as Tailwind utilities.
CSS files declare variables.** There is no third place for styling to live, and
no `.component-name { … }` class to go looking in.

Composition goes through **`recipe` from `src/lib/recipe.ts`** — never a
template string. `src/components/Input.tsx` is the worked example: one slot per
element, variants as data, and the consumer's `className` passed as the recipe's
`class` override.

That last part is a correctness fix, not a convenience. Appending a caller's
`className` to the end of a string does nothing: Tailwind decides between two
conflicting utilities by **CSS source order**, not class-attribute order, so a
caller's `bg-surface-raised` was racing the component's `bg-surface-base` and
whichever the stylesheet emitted later won. Every `className` prop in this
package was unreliable in exactly that way. `recipe` resolves the conflict
before the string reaches the DOM.

**Which library builds the recipes is an implementation detail of that one
file.** `tailwind-variants` currently does, chosen because most components here
style more than one element and the alternatives model one element per recipe.
Nothing else in the package names it, and `recipe` is deliberately **not**
exported from the entrypoint: its type comes from that library, so exporting it
would put the library back into the published `.d.ts` and make swapping it a
breaking change. `cn` is public, with a signature written out locally for the
same reason.

Only the hard-shadow scale needs declaring to the class merger — `shadow-none`
could not otherwise clear `shadow-hard-md`. Everything else works untouched: the
merger classifies the semantic tokens correctly out of the box, including telling
a colour from a size in the same `text-*` position.

`pnpm check:css` enforces it, and it is a ratchet like `check:tokens`: it counts
every declaration whose selector names a class this repo authors and fails when
the number rises. `pnpm check:css:list` shows what is left.

### The three things CSS may still do

Each is exempt because there is no element in a component to put a `className`
on — not because it was inconvenient to move.

| Exempt | Why | Where |
|---|---|---|
| Custom properties (`--x: …`) anywhere | Variables are the sanctioned CSS payload | `theme.css`, generated |
| Selectors of only element names, `:root`, `html`, `body`, `*`, pseudo-classes | No JSX element for the document; a consumer's own `<h1>` has no class we can add | `styles.css` |
| Class names emitted by third-party tooling | We never render `.markdown-alert` — a remark plugin does | `prose.css`, listed in `THIRD_PARTY` |

### Prose is the plugin's job, not ours

A Markdown pipeline emits bare tags with no class names, so there is nothing for
a utility to attach to. **`@tailwindcss/typography`** is built for that case, so
the prose layer is the plugin plus two things:

- `@utility prose-ladder` in `prose.css` maps its `--tw-prose-*` knobs onto the
  `--ds-*` role tokens. Variables only, so it is the sanctioned CSS payload —
  and there is deliberately no `--tw-prose-invert-*` block: the plugin needs one
  because it models theming as a light/dark flip, while `--ds-*` already resolves
  per level, so one mapping is correct on all four rungs.
- The brutalist deltas are `prose-h1:` / `prose-table:` / `prose-code:` element
  modifiers in `Prose.tsx` — the plugin's own mechanism for exactly this.

The plugin is an **optional peer dependency**: `@plugin` resolves from the
*consumer's* `node_modules` at their build time, so it cannot be bundled. Only
`prose.css` consumers need it; `theme.css`-only consumers do not.

Chrome nested inside an article (a breadcrumb above the title, a pager below the
body) carries `not-prose`, which every selector the plugin generates excludes.
That replaced ~70 declarations of hand-written reset — and it is the reason to
prefer the plugin over `[&_h2]:…` arbitrary variants on the container, which
would keep all of CSS's specificity gymnastics with worse ergonomics.

There is deliberately **no hook-class exemption**. `AsciiDivider` used to keep a
bare `.ascii-divider` class so the blog could attach `::after` to it — the last
hole in the rule. `Divider` closes it: the mark differs by *polarity*, so that
is now a `Record<Polarity, string>` in the component and the glyph is real text
rather than generated content. When a pseudo-element seems necessary, the
question to ask first is what design decision it is encoding, and whether that
belongs in a component.

### Consequences worth knowing before you rely on them

- **Consumers must import `theme.css` and let Tailwind scan the package.** The
  generated `theme.css` carries `@source "./"`, which points at `dist/` once
  published — verified: a consumer importing only `theme.css` gets every
  utility, variants and arbitrary values included, generated from the compiled
  bundle. This is what makes the rule safe, and it is why that `@source` line
  must never be removed.
- **The system no longer promises to style raw HTML.** `prose.css` styles bare
  tags inside `.docs-prose`; as those move into `mdxComponents`, Markdown must
  be rendered *through* the component map. A consumer pushing a markdown-to-HTML
  string through `dangerouslySetInnerHTML` will get unstyled output.
- **Translate faithfully, then check.** Named Tailwind sizes ship a paired
  line-height that a bare `font-size` declaration did not — `text-xs` is
  `0.75rem` *and* a leading. `Badge` uses `text-[0.75rem]` precisely so it keeps
  inheriting the article's unitless `1.5`. This cost one round of visual-suite
  failures to find; when a migration shifts layout by a few pixels, this is why.

### What is migrated

`styles.css` is done — its four component classes are utilities in `Badge`,
`Divider` and `ExperimentsView`, and `.brutalist-btn` / `.brutalist-btn-pink`
were deleted outright as they had no caller. What is left in that file is
document-level and stays.

`prose.css` is down from 455 declarations to 328. The bare-tag prose rules and
the chrome-inside-prose resets are gone. What remains is the docs chrome —
roughly twelve components, each with a 1:1 class. Migrate one per PR with
`recipe`, and lower its budget line.

---

## 🪜 The Theme Ladder

**`src/theme/levels.ts` is the only place a level name or a level colour is written.**
Everything else derives from it: `src/theme.css` (generated), the runtime provider, the
Storybook toolbar, the walkthrough matrix, and the contrast gate.

| Level | Polarity | Ground | For |
|---|---|---|---|
| `midnight` | dark | `#0a0a1a` | Neon on blue-black — the maximal end |
| `dim` | dark | `#121316` | Desaturated, softer inks, long reading |
| `bright` | light | `#fcfbf9` | Warm sketch paper and pen ink |
| `white` | light | `#ffffff` | Neutral, print-safe, dense UI |

Four rules follow from that, and they are what keep four levels maintainable:

1. **`theme.css` is generated — never edit it.** Change `levels.ts`, run `pnpm tokens:build`,
   commit both. `pnpm tokens:check` fails CI on drift. TypeScript covers the TS half of the
   ladder; this covers the CSS half, which is where the drift used to live.
2. **Never branch on a level with an if-chain.** Use a `Record<ThemeLevel, T>` — adding a rung
   is then a compile error until every branch answers it — or end a `switch` with
   `assertNever(level)`. Map over `THEME_LEVELS`; never re-list the names.
3. **Polarity is a declared field, not the axis.** `LEVELS[x].polarity` drives `color-scheme`,
   the `dark:`/`light:` variants, and the `prefers-color-scheme` mapping in `SYSTEM_LEVEL`.
   `dark:` now means "midnight or dim" and is only for non-colour utilities.
4. **Every level colour is a literal.** No `color-mix` derivation, because percentages tuned
   against near-black do not hold at the light end — and because literals make
   `pnpm check:contrast` able to audit all 200 role pairs without a browser.

Selection is `data-theme="<level>"` on the root (the level class is mirrored for consumers
whose own CSS selects on it). `<ThemeProvider scoped>` themes a subtree instead — a `bright`
panel inside a `midnight` page resolves correctly at any depth. For SSR, render
`getThemeInitScript()` in an inline `<script>` in `<head>`: it sets the attribute before
first paint, which React cannot do without either a flash or a hydration mismatch.

---

## 🎯 Semantic Theming

Components must **never** reference `--brutalist-cyan`, `--color-white`, `--border-color`
or the `brutalist-*` Tailwind utilities directly. Those names now resolve through a
**deprecated compatibility block** in the generated `theme.css`, which exists only so the
~30 not-yet-migrated components keep rendering while they are ported. `pnpm check:tokens`
counts the remaining call sites; the block is deleted when that reaches zero.
`src/components/Input.tsx` is the worked example of a migrated component.

| Role group | Tokens | Use for |
|---|---|---|
| `--ds-accent-*` | `primary`, `secondary`, `tertiary`, `quiet` | Visual hierarchy — what draws the eye first |
| `--ds-intent-*` | `info`, `success`, `warning`, `danger` | Communicated meaning the reader must act on |
| `--ds-surface-*` | `base`, `raised`, `sunken`, `overlay` | Background elevation |
| `--ds-text-*` | `primary`, `secondary`, `muted`, `inverse` | Text prominence |
| `--ds-border-*` | `strong`, `default`, `subtle` | Rule weight |
| `--ds-font-*` | `display`, `body`, `mono`, `pixel` | Typography roles |

From TypeScript, use `accentVar()`, `surfaceVar()`, `textVar()`, `borderVar()`, or the
`semanticTokens` object from `src/lib/theme.ts`. From Tailwind, use the semantic aliases:
`text-accent-primary`, `bg-surface-raised`, `border-edge-subtle`, `text-intent-danger`.

Accent-style props take an `Emphasis` or an `Intent`. The old palette names
(`'cyan' | 'pink' | 'yellow' | 'green'`) still resolve to identical values so existing
consumers keep compiling, but they are deprecated — do not use them in new code.

---

## 📜 Commands

- `pnpm tokens:build`: Regenerates `src/theme.css` from `src/theme/levels.ts`.
- `pnpm tokens:check`: Fails if the generated CSS is stale. Runs in CI.
- `pnpm check:contrast`: Audits every role pair on every level. Runs in CI.
- `pnpm contrast:report`: Prints the full matrix with margins, worst first.
- `pnpm check:tokens`: Ratchet on colour-instead-of-role call sites. Runs in CI.
- `pnpm check:tokens:list`: Same, broken down by file.
- `pnpm check:css`: Ratchet on styling that lives in a stylesheet. Runs in CI.
- `pnpm check:css:list`: Same, showing the offending selectors.
- `pnpm check:deps`: Dependency reasons, sections and usage. Runs in CI.
- `pnpm deps:list`: Prints the dependency table with each package's reason.
- `pnpm knip`: Full hygiene sweep — also unused files and exports. Not gated.
- `pnpm build`: Regenerates tokens, then bundles ESM, CJS, DTS types, and CSS via `tsup`.
- `pnpm storybook`: Starts interactive Storybook dev server on port `6006`.
- `pnpm build-storybook`: Compiles static Storybook documentation site to `storybook-static/`.
- `pnpm test:visual`: Runs Playwright visual regression suite against Storybook stories.
- `pnpm check:visual-coverage`: Fails if a story is neither asserted nor excluded. Runs in CI.
- `pnpm check:visual-coverage:list`: Same, naming every unasserted story.
- `pnpm test:visual:missing`: Writes only baselines that do not yet exist.
- `pnpm test:visual:update`: Re-records **all** baselines. Deliberate act — prefer `:missing`.
- `pnpm walkthrough`: Screenshots every story on every level into `walkthrough-report/`.
- `pnpm walkthrough:show`: Opens that report locally.
- `pnpm typecheck`: Validates TypeScript strict mode.

---

## 📦 Dependencies

Dependencies are fine. **Undocumented ones are not.** Every entry in
`package.json` must have a reason recorded in `MANIFEST` in
`scripts/check-deps.mjs`, and `pnpm deps:list` prints the table.

`pnpm check:deps` runs two things, because no single tool covers this:

- **`knip`** answers *is it used* — unused packages, unlisted imports,
  unresolved specifiers. It is the standard tool for that and worth more than
  anything hand-rolled.
- **`scripts/check-deps.mjs`** answers *is it justified, and in the right
  place*: a package with no `MANIFEST` entry fails, a `MANIFEST` entry with no
  package fails, and the declared section must match the reason's `kind`.

Three things it catches that knip structurally cannot:

1. **Shipped source importing a devDependency.** That publishes a package which
   breaks on install. `src/stories/**` is excluded from "shipped", since those
   files sit under `src/` but are unreachable from `src/index.ts` — which is why
   Storybook is legitimately a devDependency.
2. **The CSS contract.** `styles.css` does `@import "tailwindcss"` and
   `prose.css` does `@plugin "@tailwindcss/typography"`. Both resolve from the
   *consumer's* `node_modules` at their build time, so both are real
   dependencies — but knip does not parse at-rules and reported the typography
   plugin as unused. It is in `ignoreDependencies` for that reason, and this
   check covers it instead. Adding a package to `ignoreDependencies` without a
   corresponding CSS reference is how that exemption gets abused.
3. **Shipped CSS missing from the `exports` map.** `prose.css` was built into
   `dist/`, its own header told consumers to import it, and the map never
   declared it — so following the documentation produced a resolution error. The
   check found that on its first run.

### Known and not yet gated

`pnpm knip` (the full sweep) reports **28 duplicate exports**: every component
has both a named and a `default` export. `src/index.ts` uses `export *`, which
does not forward defaults, and the `exports` map has no deep paths — so all 28
defaults are unreachable from any consumer. Dead API surface, safe to delete,
not yet done. The gated run is scoped to dependency issues so this does not
block CI while it stands.

---

## 📌 Dependencies Held Back on Purpose

Anything here is **pinned below latest for a reason**. Check this list before
"just bumping it", and delete the row if you clear the blocker.

| Package      | Held at  | Latest | Why, and what unblocks it |
| ------------ | -------- | ------ | ------------------------- |
| `typescript` | `^6.0.3` | 7.0.2  | TS 7 breaks `pnpm build` — see below. Also keeps this package aligned with the blog, which consumes it. |

### The TypeScript 7 blocker

TS 7 does two things this repo cannot yet absorb:

1. **`baseUrl` was removed** (`error TS5102`). Our own `tsconfig.json` no longer
   sets it — the `@/*` mapping is tsconfig-relative — but `tsup`'s dts worker
   *injects* `baseUrl` itself, which is why `ignoreDeprecations: "6.0"` is
   currently required just to build on TS 6. Remove that escape hatch only when
   tsup stops injecting it.
2. **`tsup`'s DTS step crashes outright.** `tsup` vendors `rollup-plugin-dts`,
   which reads TS internals that TS 7 removed:

   ```
   TypeError: Cannot read properties of undefined (reading 'useCaseSensitiveFileNames')
       at rollup-plugin-dts.cjs
   ```

   This is upstream, not a config mistake: `rollup-plugin-dts@6.4.1` (latest)
   still declares `typescript: ^4.5 || ^5.0 || ^6.0`. Note the failure is
   **`pnpm build` only** — `pnpm typecheck` passes fine on TS 7, so a green
   typecheck is not evidence the upgrade works. Always run `pnpm build`.

**Unblocked when** `rollup-plugin-dts` supports TS 7, or this package moves off
`tsup` for bundling (`tsdown`, the rolldown-era successor, is the likely
candidate). Because the blog consumes this package, move both repos together.

---

## 🌐 Hosted Storybook

| URL | Serves | Vercel mechanism |
| --- | --- | --- |
| [design-system.ryankelly.dev](https://design-system.ryankelly.dev) | `main` | Production domain |
| [preview.design-system.ryankelly.dev](https://preview.design-system.ryankelly.dev) | the `preview` branch | Branch domain (`gitBranch`) |

Both domains are declared **outside this repo**, in `rtkelly13/shared-utilities` at
[`infra/vercel/`](https://github.com/rtkelly13/shared-utilities/tree/main/infra/vercel) —
one Pulumi stack covering every ryankelly.dev site rather than a per-repo copy. Add or
change a domain in that repo's `sites.ts` (site key `design-system-storybook`).

Build settings stay here in `vercel.json`, and that split is deliberate: Vercel reads
`vercel.json` from the repo at build time and it **overrides** project settings, so the
shared stack declares only identity, domains and env vars. Repos own how they build.

`vercel.json` sets **`"cleanUrls": false`**. This is load-bearing for the same reason
`serve.json` is (see below): clean URLs rewrite `/iframe.html` to `/iframe`, breaking
Storybook's asset preloading and yielding an empty preview pane. Storybook is one of
the few static sites where clean URLs are actively wrong.

`preview` is a long-lived branch, not a per-PR URL. A Vercel branch domain maps to
exactly one branch; individual PRs still get their own generated `*.vercel.app` URLs.
To promote work to the preview site, merge it into `preview`.

### Composition

The blog's Storybook is composed into this one's sidebar as **`ryankelly.dev (site)`**,
so one URL answers both "what does the system provide" and "what does the site do with
it". It is driven by `STORYBOOK_REF_BLOG_URL` in `.storybook/main.ts`, not hardcoded:
the URL differs per environment, and an unreachable ref renders as a permanently
erroring sidebar entry. Unset — the default for `pnpm storybook` locally — composes
nothing.

Composition is resolved **in the browser**, which has two consequences worth knowing
before debugging it:

- The composed Storybook must send `Access-Control-Allow-Origin` on `/index.json`;
  the manager fetches it cross-origin. It also probes `stories.json` and
  `metadata.json`, which no longer exist in Storybook 10. Those failures are
  harmless — composition works from `index.json` alone — but they surface as
  **CORS errors, not 404s**, if the composed origin scopes its
  `Access-Control-Allow-Origin` to `/index.json`: the browser blocks the response
  before the status is readable. The blog's `storybook-site/vercel.json`
  therefore sets the header on all paths, which keeps the console clean.
- The ref URL is baked into the manager bundle at **build** time, so changing
  `STORYBOOK_REF_BLOG_URL` requires a redeploy, not just a reload.

The blog's Storybook is deployed by a second Vercel project reading
`storybook-site/vercel.json` in the blog repo, declared in the shared stack as
`blog-storybook`. That project needs **"Include source files outside of the Root
Directory in the Build Step"** ticked by hand — the Vercel provider does not expose it.

Both repos are on Storybook 10 — this one on 10.5, the blog on 10.4 — so host and
ref agree on the `index.json` v5 format the manager reads. That was not true when
this was written: #23 aligned them precisely so composition would not depend on
cross-major tolerance. Keep them on the same major; see
[`docs/evaluation.md`](./docs/evaluation.md).

---

## 📸 Screenshot Walkthrough

`pnpm walkthrough` captures every Storybook story on **every level**
(derived from `THEME_LEVELS`, so a new rung widens the matrix automatically)
and publishes Playwright's own HTML report to
`walkthrough-report/`. CI attaches it as `storybook-walkthrough-<sha>` on every PR.

Download it, unzip, open `index.html` — it works straight from `file://`, no
server needed. `pnpm walkthrough:show` serves it locally.

It is **not** a gate. It asserts nothing about how things should look; it makes
what they *do* look like reviewable. Visual regression stays in `ci.yml`.

Its real value is cross-level: a token change that reads fine on `midnight` can
be unusable on `white`, and a pixel diff against a single-level baseline will
never surface that. The gated suite still only asserts one level — promoting
`Foundations/Theme Ladder → AllLevels` into `tests/visual.spec.ts` is the next
step there, and per rule 7 it needs `/update-snapshots` run first. It is one of
the 20 stories `pnpm check:visual-coverage` currently reports, so the gap is
visible rather than remembered.

Two structural choices worth keeping:

- **One test per story, not per story-and-level.** The report lists tests, so a
  row is a component and opening it shows all four levels together — which is
  the comparison worth making. Splitting by level quadruples the rows and
  scatters the images that need comparing.
- **Each theme's capture is wrapped in a `test.step`.** Ungrouped, the
  navigation plumbing contributes ~21 rows to the step list and pushes the
  screenshots below the fold.

Note that `expect()`'s message argument becomes the *step title* in the report,
shown next to a green tick on success. `story-ready.ts` therefore raises its
guidance on catch instead — otherwise every passing run reads as a failure.

### Both suites verify the render first

`tests/story-ready.ts` asserts Storybook actually mounted the story before any
screenshot is taken, by checking the `sb-show-main` / `sb-show-errordisplay` /
`sb-show-nopreview` classes Storybook puts on `<body>`.

This is not optional defensiveness. Storybook always paints *something* — a
"No Preview" panel or a red error overlay — so a screenshot taken after a fixed
delay succeeds whether the story rendered or the entire preview bundle failed
to load. Every baseline in this repo was once a screenshot of the "No Preview"
panel, and the suite passed for as long as it kept being one.

### `serve.json` is load-bearing

`serve` rewrites `/iframe.html` to `/iframe` by default (`cleanUrls`), which
breaks Storybook's asset preloading and yields exactly that empty preview. Both
Playwright configs therefore start it as:

```
npx serve storybook-static -p 6006 --config ../serve.json
```

The path is relative to the **served directory**, not the repo root. Do not drop
the `--config` flag.


## 🛑 Repository Conventions & Workflow Policy

1. **Squash Merge Only**: All pull requests must be merged into `main` using **Squash and Merge** exclusively.
2. **Delete Branch on Merge**: Feature branches must be automatically deleted immediately upon merge into `main`.
3. **Linear History**: Maintain a strictly linear history. Rebase feature branches onto `main` before merging; no merge commits allowed.
4. **Direct Push Protection**: Non-force direct pushes to `main` are blocked; PR mechanism required (force pushes permitted when needed).
5. **Local Temp & Worktree Directory**: All temporary files, local databases, scratch files, and git worktrees MUST go inside the root `/temp/` directory (gitignored).
6. **Gitignored Local TODO File**: A root `TODO.md` file MUST exist for local task tracking and be gitignored.
