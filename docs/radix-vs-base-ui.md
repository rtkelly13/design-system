# Radix or Base UI — the primitive-layer decision

The comparison behind the choice recorded in
[`shadcn-evaluation.md`](./shadcn-evaluation.md) §6. Measured against
`radix-ui` 1.6.7 and `@base-ui/react` 1.7.0, from the published packages and both
git histories rather than either docs site.

**Outcome: `@base-ui/react`.** Churn accepted deliberately, bounded by the
confinement rule in §6 of the evaluation. `@tanstack/react-table` covers tables,
which neither library provides.

Sources: `radix-ui/primitives` @ `f7ecd5a`, `mui/base-ui` @ `2665e49`,
`shadcn-ui/ui` @ `63c1308`, npm registry as at 2026-09-01.

---

## 1. Maintenance — the dimension that decided it

Both default branches, window 2025-09-01 to 2026-09-01, bots excluded from
author counts.

```bash
git log --since=2025-09-01 --until=2026-09-01 --format=%ad --date=format:%Y-%m | sort | uniq -c
git log --since=2025-09-01 --until=2026-09-01 --format=%an | grep -vi bot | sort | uniq -c | sort -rn
```

| Measure | Radix | Base UI |
|---|---|---|
| Commits merged | 243 | **1,852** (7.6×) |
| Human commits | 239 | 1,431 (6.0×) |
| Distinct authors | 22 | 94 |
| Top author's share | **90.4%** | 45.6% |
| Authors to reach half the commits | **1** | 2 |
| Months at ≤1 commit | **7** (5 at zero) | 0 |
| Quietest month | 0 | 114 |
| Last commit on default branch | 2026-07-31 | 2026-09-01 |
| Stable npm releases | 9 | 9 |
| Test files in repo | 45 | 274 |

Monthly commits, same scale:

| | S | O | N | D | J | F | M | A | M | J | J | A |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| Radix | 0 | 23 | 3 | 1 | 0 | 1 | 0 | 0 | 24 | 87 | 104 | 0 |
| Base UI | 172 | 144 | 161 | 169 | 153 | 169 | 182 | 163 | 122 | 141 | 162 | 114 |

**The release count is the trap.** Both shipped nine stable versions, so npm says
"equally maintained". The commit history says one of them shipped those nine off
243 commits in two bursts with 88% of the year's work inside 2026-05→07, and the
other off 1,852 sustained with no quiet month.

**Where the maintainers went is on the record.** Base UI's README opens *"From
the creators of Radix, Floating UI, and Material UI"*, and its team list names
**Colm Tuite** (Radix co-creator) and **Jenna Smith** (Radix core maintainer).
Neither appears in Radix's last 1,284 commits. Base UI's most active contributor
— 653 of 1,431 — is **atomiks**, author of Floating UI, which every popover,
tooltip, select and menu in both ecosystems positions itself with.

This does not mean Radix is abandoned: the 2026-05→07 burst was 191 commits of
real work. It means Radix's continuity rests on one person's availability, which
is a different risk from the one its 2022–2024 reputation was earned under.

## 2. Composition model

AGENTS.md makes this decisive after maintenance: appearance is written on
elements as utilities, composed through `recipe` with one slot per element. So
the question is how each library hands over every element's class attribute.

| | Radix | Base UI |
|---|---|---|
| Escape hatch | `asChild` + `Slot` | `render` |
| Accepts | a child element | an element **or** `(props, state) => element` |
| Prop type | `React.ComponentProps<typeof X.Root>` | `X.Root.Props` |
| Variant syntax | `data-[state=checked]:` | `data-checked:` |
| Authoring toolkit exposed | `Slot` (refs + props) | **`useRender`** — public, with state→`data-*` |

`render` taking a function of `(props, state)` is exactly the shape a `recipe`
slot wants:

```tsx
render={(p, s) => <span {...p} className={styles.box({ checked: s.checked })} />}
```

`asChild` instead needs a real child element supplied at every part, and the
composition is invisible to typing across the boundary.

**`useRender` being public matters more than it looks.** It is the same hook Base
UI's own primitives are built on — a `render` prop plus a `state` object where,
in its own words, *"state properties are automatically converted to `data-*`
attributes"*. For a package that authors components rather than only consuming
them, that is a primitive-authoring toolkit. Radix has no equivalent.

## 3. Styling and state surface

| Concern | Radix | Base UI |
|---|---|---|
| Open / closed | `data-state="open\|closed"` | `data-open`, `data-closed`, `data-popup-open` |
| Checked | `data-state="checked\|indeterminate"` | `data-checked`, `data-indeterminate` |
| Validity | `data-invalid` | `data-invalid`, `data-dirty`, `data-filled`, `data-touched` |
| Interaction | `data-highlighted`, `data-disabled` | + `data-focused`, `data-pressed`, `data-readonly`, `data-required` |
| **Enter / exit transition** | **none** | `data-starting-style`, `data-ending-style` |
| Internal plumbing on your DOM | ~18 × `data-radix-*` | 1 × `data-base-ui-scroll-locked` |

```bash
grep -rho "'data-[a-z-]*'" packages/react/src | sort -u          # Base UI: 25+ semantic
grep -rc "data-\(starting\|ending\)-style"                       # Base UI 230 · Radix 0
```

The transition row lands on **issue #49** (no motion or z-index tokens). Radix
expects CSS keyframes per overlay — which is why shadcn carries
`tw-animate-css`. Base UI holds the element in the DOM through the transition and
exposes both ends as attributes, so an enter/exit is two variants and a duration.
Neither library removes #49 from the critical path; one makes it much smaller.

## 4. Forms — where this system's gap actually is

Against **issue #50** ("the form layer cannot express a form"):

| Needed | Radix | Base UI |
|---|---|---|
| Checkbox / RadioGroup / Switch | yes | yes |
| **Field** (label, description, error, id wiring) | no primitive | `field` |
| **Fieldset** + legend | no primitive | `fieldset` |
| Form-level error summary | `react-form` @ `0.1.x` | `form` |
| Controls inherit field validity | wire it yourself | `CheckboxRootState extends FieldRootState` |

The last row is the one that matters: a control inside a Base UI field inherits
validity, dirty and touched state without being told about it. That is precisely
what `useField()` (`src/components/Input.tsx:84`) does by hand for three controls
today, and would have kept doing by hand for three more.

## 5. Coverage divergence

Shared coverage omitted; 30 of 39 for Base UI against 26 for Radix.

| Primitive | Radix | Base UI | Cost of the gap |
|---|---|---|---|
| Drawer / Sheet | — | yes | `+ vaul` |
| Combobox / command palette | — | yes | `+ cmdk` |
| OTP field | `0.1.x` | yes | `+ input-otp` |
| Toast | yes (shadcn routes past it) | yes | `+ sonner` |
| Meter, NumberField | — | yes | hand-roll |
| Field / Fieldset | — | yes | hand-roll |
| Table with sorting | — | — | `@tanstack/react-table` |
| Calendar / DatePicker | — | — | neither |

## 6. Package shape

| Measure | radix-ui 1.6.7 | @base-ui/react 1.7.0 |
|---|---|---|
| Licence | MIT | MIT |
| Unpacked | 0.11 MB | 9.49 MB |
| Packages installed | **55** | **6** |
| Summed install weight | 4.22 MB | 9.49 MB |
| Direct dependencies | 54 | 5 |
| `sideEffects` | false | false |
| Subpath exports | wildcard `./*` | 83 explicit |
| First published | 2022-08 | 2025-12 |
| Versions published | **189** | **11** |

Two corrections to the folklore, both verified:

- **Radix is the one with package sprawl** — 55 packages for 31 components,
  because the `radix-ui` umbrella re-exports primitives still published
  individually. That is ~55 rows into PR #64's licence baseline against ~6.
- **Base UI's 9.49 MB is one package and none of it ships.** Most is bundled
  locale data and a dual CJS/ESM build. Both declare `sideEffects: false`, both
  support subpath imports, and `tsup` externalises `dependencies` here — so this
  is `node_modules` weight, not `dist` weight.

One point for Radix worth recording: its `Dialog` pulls `aria-hidden` and
`react-remove-scroll`, so it fixes two of the current hand-rolled `Modal`'s
defects — a genuinely inert background and a scroll lock that compensates for
scrollbar width. Base UI does both itself with no extra dependency. Either is an
upgrade on what ships today.

## Scorecard

| Dimension | Weight | Winner |
|---|---|---|
| Maintenance & continuity | Decisive | **Base UI** — 7.6× commits, bus factor 2 vs 1 |
| Composition model | Decisive | **Base UI** — `render` fits `recipe`; `asChild` fights it |
| Styling & state surface | Significant | **Base UI** — semantic `data-*`, transitions without keyframes |
| Form / field integration | Significant | **Base UI** — import vs build for issue #50 |
| Component coverage | Significant | **Base UI** — 30 vs 26, four fewer satellite deps |
| Package shape | Minor | tie — both MIT, both tree-shakeable |
| **Maturity** | — | **Radix** — 189 versions vs 11; the entire case against |

Base UI takes five of six with one tie, and loses only on age. Radix's single
advantage is the one this evaluation expected to be decisive; the commit history
is what changed the answer.

## The accepted risk

Base UI's risk is **churn** — an API change inside a year is plausible, and nine
months of published history cannot prove otherwise. Radix's risk is **stall** — a
focus-management bug or a React incompatibility open for a quarter, with this
system's accessibility floor underneath it.

Churn is bounded by a rule this package already enforces on
`tailwind-variants`: confine it to one wrapper per primitive, never re-export raw,
keep its types out of the published `.d.ts`. Stall is bounded by nothing the
consumer controls. That asymmetry is the decision.
