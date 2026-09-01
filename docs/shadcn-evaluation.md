# shadcn/ui evaluation — September 2026

Whether `@rtkelly13/design-system` should take anything from
[shadcn/ui](https://ui.shadcn.com), what it would take, how it would be
integrated, and whether the licences underneath allow it.

Measured against `shadcn-ui/ui` at `63c1308` (2026-08-31) and this repo at
`650cd9f`. Licence facts were read from `LICENSE.md` in that repo and from
`https://registry.npmjs.org/<pkg>/latest`, not from memory — every row below is
reproducible with the command that produced it.

## Verdict

**Take the behaviour, not the code.** shadcn/ui's value to this repo is almost
entirely in the headless primitives it wraps — Radix UI or Base UI — and almost
none of it is in the wrapper files themselves, because every one of those files
is written against a token vocabulary and a styling engine this repo has
deliberately rejected.

The licences are not a blocker. Everything in the relevant path is permissive
and compatible with publishing this package as MIT to public npm. The one
non-MIT runtime package (`class-variance-authority`, Apache-2.0) is also the one
package this repo would strip anyway, because `src/lib/recipe.ts` already owns
that job.

Two things should be fixed before anything third-party arrives:
`package.json` declares `"license": "MIT"` and lists `LICENSE` in `files`, and
**there is no LICENSE file in the repository** — so the published tarball ships
none. And `docs/gap-analysis.md` is now materially wrong (below).

---

## 1. What shadcn/ui actually is, in 2026

It is not a component library you install. It is a **registry** — JSON payloads
describing files — plus a CLI (`shadcn`, MIT, v4.19.1) that copies those files
into your project as source you then own. There is no `@shadcn/ui` runtime
package to depend on.

Since v4 it also has a **bases** concept: the same component surface is
generated against three different headless engines, declared in
`apps/v4/registry/bases.ts`:

| Base | Package | Notes |
|---|---|---|
| `radix` | `radix-ui` | The historical default; a single package re-exporting every primitive |
| `base` | `@base-ui/react` | The Radix team's successor library |
| `aria` | `react-aria-components` | Adobe's |

The repo ships a first-class `skills/migrate-radix-to-base/` skill. **Read that
as a signal**: the wrapper layer is churning underneath, and a project that
vendors wrappers inherits the churn. A project that depends on one primitive
library directly does not.

The current inventory at `63c1308`:

```bash
ls apps/v4/registry/new-york-v4/ui | wc -l      # 58 (57 components + _registry.ts)
ls apps/v4/registry/new-york-v4/blocks | wc -l  # 28
ls apps/v4/registry/new-york-v4/charts | wc -l  # 71
```

---

## 2. Component gap

This package exports roughly 38 modules. Mapping them onto shadcn's 57
primitives:

**Already covered**, under different names — nothing to take:
`button`, `card`, `badge`, `avatar`, `input`/`textarea`/`native-select` (all
three from `Input.tsx`), `label`, `separator` (`Divider`), `table`
(`DataTable`), `pagination`, `breadcrumb` (docs barrel), `alert` (`NoteBlock`,
which already models intent correctly), `dialog` (`Modal` — but see §3).

**Missing, with demonstrated demand** in `blog` or `ynab-budget-companion`,
and each one is a thing hand-rolling gets wrong:

| Primitive | Why it is not a weekend build |
|---|---|
| `checkbox` | Indeterminate state, `aria-checked="mixed"`, form participation via a hidden input |
| `radio-group` | Roving tabindex — arrow keys move selection, Tab enters and leaves the group as one stop |
| `switch` | `role="switch"`, and the label/click target relationship |
| `select` | A real listbox is typeahead, arrow navigation, collision-aware positioning, scroll containment |
| `tooltip` | Hover *and* focus, delay groups, dismiss-on-Escape, and never trapping a pointer user |
| `tabs` | Roving tabindex plus `aria-controls`/`aria-labelledby` wiring in both directions |
| `sonner` (toast) | A live region that announces without stealing focus |

**Missing, no new dependency needed** — pure markup and tokens, buildable here
today with `recipe` and worth doing regardless of any shadcn decision:
`skeleton`, `spinner`, `empty`, `kbd`, `aspect-ratio`, `field`/`field-group`,
`input-group`, `button-group`, `item`.

`field` and `input-group` are the two most interesting on that list. They are
not primitives — they are *layout conventions for forms*, and shadcn enforces
them as rules (`data-invalid` on the field, `aria-invalid` on the control).
This repo has `Input` with no equivalent, which is why every consumer lays out
its own forms.

**Missing, speculative** for this estate — do not build on spec:
`command`/`combobox`, `sheet`, `drawer`, `sidebar`, `calendar`, `carousel`,
`input-otp`, `resizable`, `chart`, `context-menu`, `menubar`,
`navigation-menu`, and the AI-chat set (`message`, `bubble`, `attachment`,
`message-scroller`, `marker`).

---

## 3. The case that is not about missing components: `Modal`

`src/components/Modal.tsx` is a hand-rolled dialog with a hand-rolled focus
trap. It is unusually well-reasoned for one — the docblock names the four things
that make "modal" a behavioural claim, and it does all four. It is still short
of what a maintained primitive gives you:

- **The background is not inert.** Nothing sets `inert` or `aria-hidden` on the
  rest of the document, so a screen reader's virtual cursor still walks the page
  behind the dialog even though Tab cannot.
- **The scroll lock shifts layout.** `body.style.overflow = 'hidden'` removes the
  scrollbar and the page jumps by its width. Compensating needs
  `scrollbar-gutter` or a measured padding.
- **The trap queries one subtree.** `dialogRef.current.querySelectorAll` misses
  anything the dialog itself portals out — a `Select` listbox, a nested popover
  — which is exactly what happens as soon as the primitives in §2 land.
- **No dialog stack.** Two open dialogs both listen on `document` in the capture
  phase, so Escape closes both.

None of these are mistakes. They are the reason this is a solved problem
somebody else maintains. Replacing `Modal`'s internals with Radix's or Base
UI's `Dialog` is the single highest-value item in this evaluation, and it also
forces the API change worth making anyway: `Modal` takes a closed
`isOpen`/`onClose`/`title` shape where a compound `Dialog.Root`/`Trigger`/
`Content`/`Title` composition is what consumers need. At `0.3.0` that breaking
change is cheap; later it is not.

---

## 4. Licences

### shadcn/ui itself

`LICENSE.md` at `63c1308` is **MIT, Copyright (c) 2023 shadcn**. Compatible
with this package's MIT licence and with public npm.

One obligation that copy-paste distribution makes real and that is widely
ignored: MIT requires the copyright notice to be retained in "all copies or
**substantial portions** of the Software". Copying a registry component into
`src/components/` and publishing it inside `dist/` is a substantial portion.
**If any shadcn source is vendored, this repo owes an attribution notice** — a
`NOTICE` file or a `THIRD-PARTY.md`, plus a header on the vendored file naming
the origin and commit. Recommending against vendoring (§5) largely removes this
obligation; it does not remove it if even one file is copied.

### Runtime packages the components sit on

Read from the npm registry, `latest` at time of writing:

```bash
for p in radix-ui @base-ui/react class-variance-authority clsx tailwind-merge \
  cmdk input-otp vaul sonner next-themes embla-carousel-react recharts \
  react-day-picker react-resizable-panels react-hook-form lucide-react; do
  curl -s "https://registry.npmjs.org/$(printf '%s' "$p" | sed 's|/|%2f|')/latest" \
    | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['name'],d['version'],d.get('license'))"
done
```

| Package | Version | Licence | Which components need it |
|---|---|---|---|
| `radix-ui` | 1.6.7 | MIT | 30 of the 57 |
| `@base-ui/react` | 1.7.0 | MIT | `combobox` today; all of them under the `base` base |
| `class-variance-authority` | 0.7.1 | **Apache-2.0** | 16 wrappers, for variants |
| `clsx` | 2.1.1 | MIT | `cn` |
| `tailwind-merge` | 3.6.0 | MIT | `cn` |
| `lucide-react` | 1.38.0 | **ISC** | icons — *already a dependency here* |
| `cmdk` | 1.1.1 | MIT | `command` |
| `input-otp` | 1.5.0 | MIT | `input-otp` |
| `vaul` | 1.1.2 | MIT | `drawer` |
| `sonner` | 2.0.8 | MIT | `sonner` |
| `next-themes` | 0.4.6 | MIT | `sonner` only, for theme detection |
| `embla-carousel-react` | 8.6.0 | MIT | `carousel` |
| `recharts` | 3.10.1 | MIT | `chart` |
| `react-day-picker` | 10.0.1 | MIT | `calendar` |
| `react-resizable-panels` | 4.12.3 | MIT | `resizable` |
| `react-hook-form` | 7.87.0 | MIT | `form` |
| `shadcn` (CLI) | 4.19.1 | MIT | tooling only, never shipped |

`recharts` is the only one with a non-trivial transitive tail; it is clean:
`victory-vendor` is `MIT AND ISC` (it vendors d3, which is ISC), and
`immer`, `reselect`, `es-toolkit`, `react-redux`, `@reduxjs/toolkit`,
`decimal.js-light`, `eventemitter3`, `tiny-invariant`,
`use-sync-external-store` are all MIT.

### Does this fit the criteria

The criteria are not written down anywhere in this repo, so taking them as
implied by what it already does — MIT itself, published to **public** npm, and
already shipping ISC (`lucide-react`) and MIT (`tailwind-variants`) at runtime:

**Yes, with one asterisk.** No copyleft anywhere in the path — no GPL, LGPL,
AGPL, MPL, or SSPL, and nothing source-available-but-not-open. Everything is
MIT or ISC except `class-variance-authority`.

**The asterisk is Apache-2.0.** It is permissive and one-way compatible into an
MIT-licensed project, but it is not the same deal as MIT: §4 imposes
notice-preservation and change-statement duties, and it carries an express
patent grant with a **patent-retaliation clause** that terminates the grant if
you sue over the covered work. Harmless for a personal design system, and
strictly *better* than MIT for a commercial one — but it is a different set of
obligations arriving in a package whose `check-deps` MANIFEST records reasons
and nothing else.

It is also entirely avoidable. `cva` exists in shadcn to do what
`src/lib/recipe.ts` already does, better for this repo's shape — `recipe`
handles multi-slot components, `cva` models one element per recipe, and
AGENTS.md mandates `recipe` over any alternative. **Do not install `cva`.**
With it excluded, the entire adoption path is MIT and ISC only.

Worth adding while this is being decided: `scripts/check-deps.mjs` records
*why* each package exists but not *under what licence*. Adding a `licence` field
to the MANIFEST — and failing on anything outside an allowlist of
`MIT`/`ISC`/`BSD-*`/`Apache-2.0` — would turn this evaluation into a check, the
same move AGENTS.md already makes everywhere else. That is the mechanism this
repo believes in; the licence question is currently the one policy with no gate.

---

## 5. Integration: three options

### A. Depend on the primitives, wrap them here — **recommended**

Add one headless library as a runtime dependency and build brutalist wrappers
with `recipe`, taking shadcn's *composition* as a reference for API shape while
writing every class string fresh.

```bash
pnpm add radix-ui   # or @base-ui/react
```

`tsup` externalises `dependencies` automatically, so this does not enter the
bundle — the precedent is `lucide-react`, which the MANIFEST already documents
as runtime-rather-than-peer "so a consumer gets working icons without opting
in". Same reasoning applies.

What this costs: one MANIFEST entry, and a decision between Radix and Base UI
(below). What it avoids: every conflict in option B, and every MIT-attribution
obligation from §4.

### B. Vendor the shadcn source and restyle it

Faster to a first render, and wrong for this repo. Each copied file breaks
rules that CI enforces:

- **`cva`, not `recipe`.** AGENTS.md: the engine is an implementation detail of
  one file, and `recipe` is deliberately unexported so it can be swapped. A
  vendored `cva` call site reverses that, and drags in the one Apache-2.0
  package.
- **`pnpm lint` rejects the class names outright.** `no-custom-classname` checks
  against a whitelist *derived* from `styles.css`/`prose.css`/`theme.css` by
  `scripts/authored-classes.mjs`. `bg-background`, `text-muted-foreground`,
  `border-input`, `ring-ring` and `rounded-md` name nothing here, so a vendored
  file fails on its first lint — loudly, which is the check working.
- **`dark:` variants contradict the ladder.** shadcn models theming as a
  light/dark flip. This system has four rungs resolving through `--ds-*`, and
  the `prose-ladder` note in AGENTS.md already explains why one mapping beats a
  flip. Every `dark:` utility in a vendored file is a bug on `dim` and `bright`.
- **Zero border-radius.** Every shadcn file carries `rounded-*`.

Realistically you keep the component's *structure* and rewrite every class
string — at which point you have written option A by hand, plus an attribution
obligation. The honest use of these files is **read them, then close them**:
they are a good reference for what parts a component needs and what the props
should be called.

### C. Publish this package as a shadcn registry

`skills/shadcn/registry.md` documents the format: a `registry.json`,
`npx shadcn@latest build`, and serve the generated `public/r` — which
`design-system.ryankelly.dev` is already positioned to do.

Real, and not worth it yet. It is a *distribution* change, and this package's
distribution is already better for its two known consumers: a versioned npm
package with a compiled `dist/`, a Tailwind `@theme` contract, and semver.
A registry serves the copy-paste-and-fork consumer, which this estate does not
have. Revisit if the package ever wants outside users who need to edit the
source.

### Radix or Base UI

Pick one and do not chase. Taking them on their merits for this repo:

- **Radix** is the safer bet today: `radix-ui` 1.6.7 is stable, is what 30 of
  the 57 wrappers still use, and has the deepest body of prior art. It is also
  the thing shadcn ships a migration path *away* from.
- **Base UI** is where the same authors went, is what the newest component
  (`combobox`) is written against, and its `render` prop is a better-designed
  escape hatch than Radix's `asChild` for a system that wants to own every
  element's classes — which is exactly what "styling lives in TSX" demands.

**Recommend Base UI** on that last point: `render` composition and this repo's
`recipe`-slot model fit together cleanly, where `asChild` fights it. The cost is
a younger library, and it should be recorded in "Dependencies Held Back on
Purpose" style — a named reason, so the next person does not re-litigate it.

---

## Suggested order

1. **Add the LICENSE file.** MIT text, matching `package.json`. One commit, and
   it is a genuine compliance defect today.
2. **Add a `licence` field to the `check-deps` MANIFEST** with an allowlist.
   Cheap, and it converts §4 from a document into a gate.
3. **Build the no-dependency set** — `Skeleton`, `Spinner`, `Empty`, `Kbd`,
   `Field`/`FieldGroup`. No decision required, immediate consumer value, and it
   exercises `recipe` on simple components before the hard ones.
4. **Decide Radix vs Base UI**, and record the reason.
5. **Move `Modal` onto the chosen `Dialog`**, taking the compound-API breaking
   change while the package is at `0.3.x`. This is the item that pays for the
   dependency on its own.
6. **Then the demanded primitives**, in demand order: `Checkbox`, `Switch`,
   `RadioGroup`, `Select`, `Tabs`, `Tooltip`.
7. **Leave `sonner`, `cmdk`, `recharts`, `react-day-picker` and the rest until
   something asks for them.** Every one is a runtime dependency in a package
   whose consumers pay for it.

## Correction to the existing docs

`docs/gap-analysis.md` should be re-dated or deleted. It is measured against
`95ef0ba` and three of its claims are now false:

- "there is no linter in this repo. Not a misconfigured one — none at all" —
  `eslint.config.mjs` exists and `pnpm lint` is a required check.
- Its gap 1 lists 48 palette violations across four components. There are now
  **zero** in shipped source; the only matches are the `FORBIDDEN` regexes in
  `Input.test.tsx` and `StatCard.test.tsx` that guard against regression.

  ```bash
  grep -rn "brutalist-cyan\|brutalist-pink\|brutalist-yellow\|brutalist-green\|--color-white\|--border-color" \
    src/components --include=*.tsx | grep -v stories
  ```

- It reasons throughout about `dark` and `sketch` themes, which the four-rung
  `midnight`/`dim`/`bright`/`white` ladder replaced.

Its §5 component table and its closing "YNAB: adopt or decouple" question are
both still live, and are the parts worth carrying forward.
