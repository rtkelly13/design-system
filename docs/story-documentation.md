# Story documentation — what a component page actually tells you

An audit of the **per-component documentation** in this package's Storybook:
what a reader — or an agent asked to use a component — is told when they land
on `Foundations/Badge`, and what they were told before this branch.

It is deliberately narrow. The companion docs cover other axes:

- [`docs/evaluation.md`](./evaluation.md) — the package as a *system*: token
  design, test layer, publishing.
- [`docs/gap-analysis.md`](./gap-analysis.md) — stated invariants with no
  enforcement, and consumer divergence.
- [`docs/surface-readiness.md`](./surface-readiness.md) — how many kinds of
  site the inventory can build.
- [`docs/visual-regression.md`](./visual-regression.md) — what the gated suite
  asserts and why.

Every number here is produced by `pnpm check:story-docs`, so they can be
re-derived rather than trusted.

---

## Verdict

**Before:** the Storybook looked documented and was not. 29 of 37 components
had a docs page, 10 described themselves, a third of stories had a caption, and
36% of props had a description. The most-used component in the package —
`Button` — had a **completely empty props table**, and nothing anywhere said so.

**After:** every component has a page, a description, at least three captioned
samples, and a description on every prop. `pnpm check:story-docs` is a required
check, so the next component cannot arrive without them.

| | Before | After |
| --- | --- | --- |
| Components with a docs page | 29 / 37 | **37 / 37** |
| Components that describe themselves | 10 / 37 | **37 / 37** |
| Stories | 102 | **116** |
| Stories with a caption | 34 (33%) | **116 (100%)** |
| Props with a description | 46 / 110 (42%) | **158 / 158 (100%)** |
| Props described *in the built page* | 59 / 165 (36%) | **166 / 166 (100%)** |
| Components below the standard | 37 | **0** |

The last two rows are different measurements on purpose: the first is what the
source declares, the second is what `react-docgen` actually put into the built
Storybook. They disagreed badly, and the gap is the most interesting finding
here.

---

## What was wrong, in order of how much it cost

### 1. A docs page can be empty and look fine

Storybook publishes a page whether or not anyone wrote anything on it. With no
description and no prop docs, `Foundations/StatCard` rendered as a title, a
props table with eight rows and eight blank Description cells, and three
stories called `SystemHealth`, `ComputeLatency` and `SecurityAudit`. Nothing on
that page is *missing* in a way a reader can see — the blank column reads as
"self-explanatory", and the three story names read as a considered set.

They were not. `StatCard` carries two independent colour channels — `accent`
for hierarchy, `changeType` for meaning — and all three stories set
`changeType: 'positive'`, so the page demonstrated the distinction exactly zero
times. That is the failure mode this whole document is about: **the page looked
complete and taught nothing.**

### 2. `Button`'s props table was empty, and had been for as long as it existed

```
Button   props=0   described=0
```

`ButtonProps` is a discriminated union — `ButtonElementProps | ButtonLinkProps`
— and `react-docgen`, which is what Storybook's React props table is generated
from, extracts nothing from it. Not a partial table: an empty one, with no
warning, on the component every consumer reaches for first.

The JSDoc on `ButtonOwnProps` was real, careful, and reached editor hover and
the emitted `.d.ts`. It simply never reached the page. The `variant` prop is a
genuine trap — the names are hues (`cyan`, `pink`) but resolve through the
accent *roles*, so `pink` means "tertiary" and remaps on every rung of the
ladder — and that explanation was invisible in the one place a consumer chooses
a variant.

Fixed by writing `argTypes` by hand in the story meta, with a comment saying
why and when to delete it. `check:story-docs` accepts an `argTypes` description
in place of a JSDoc for exactly this case.

### 3. Documentation written in the wrong place, silently

`Divider.stories.tsx` opened with an excellent four-paragraph explanation of why
the divider draws a different mark on each polarity, and why the component
exists at all. It was attached to `const meta`.

Storybook does not read that. A component description comes from the
component's own docgen block or from `parameters.docs.description.component`; a
JSDoc above the meta object is a comment for whoever opens the file. The best
piece of writing in the story layer was reaching nobody.

The same shape appeared on `ThemeLadder` and `SemanticTokens`.

### 4. Story captions were the exception, not the rule

34 of 102 stories had one. Where they existed they were good — *"Emphasis
tokens: hierarchy, not meaning — which pill should catch the eye"* is the
single most useful sentence on the `Badge` page — which makes the 68 without
them the clearer loss. A story named `PinkAccent` with no caption tells a
reader the colour and nothing about when to choose it.

### 5. Twelve components had fewer than three samples

Five had exactly one. A single story can only answer *does this render*; the
second and third are what force the component's axis of variation to be named.
`Card` is the example: it had one story, and the page therefore never mentioned
that the component has **two entirely different forms**, or that the form is
selected implicitly by whether you pass a `title` — so a panel that later gains
a title silently becomes a blog card.

### 6. Four exported components had no page at all

`TextArea`, `Select`, `ThemeProvider` and `DocsLink` are exported from
`src/index.ts` and a consumer can import them. None appeared anywhere in
Storybook, and **nothing in the repo noticed**: `check:visual-coverage` reads
the story list, so a component with no story is simply absent from the thing
being audited. Both checks were blind in the same direction.

They are now listed in `UNSTORIED` with a reason each — three are shapes of a
contract documented on another page, one renders no markup — and the *next*
export without a page fails the check.

---

## The standard, and what enforces it

`pnpm check:story-docs` reads `src/stories/*.stories.tsx` and the component
sources. Five rules, budget **0**:

| Rule | Why |
| --- | --- |
| A docs page — `tags: ['autodocs']` | Without it the component has stories and no page. The only gap here that is invisible rather than merely thin. |
| A component description | What it is for and when to reach for it. Preferred as JSDoc on the component, so it also reaches editor hover and the `.d.ts`. |
| At least **three** samples | One shows it renders; three force the axis of variation to be named. |
| A caption on every story | The caption is where *when to use this one* lives. |
| A description on every prop | The table is generated regardless; a blank cell reads as "self-explanatory". |

Two waiver maps, both requiring a sentence rather than a number, following
`check-visual-coverage.mjs`'s precedent:

- **`EXCLUDED`** — waives the sample minimum (`samples`) or the props table
  (`propsTable`) for one component. Nothing waives a description, a caption or
  a prop doc.
- **`UNSTORIED`** — publicly exported components with no page, each with a
  reason.

It reads **source, not a built Storybook**, which is why it sits in the `gates`
job rather than behind the browser install (AGENTS.md § CI Shape). It runs in
about a second.

### Prop discovery does not trust the generator

The check finds props syntactically — the members declared by the props type in
the component's own file, following unions, intersections, `extends` clauses
and local aliases, and stopping at anything imported, since `HTMLAttributes` is
React's to document. It also counts a destructured parameter with a default
value, because that is what puts `className` in the table on half the
components here.

That is the same set `react-docgen` tabulates, *except* where docgen gives up —
and it gives up silently. A check that asked docgen "are these props
documented?" would have been perfectly happy with `Button`'s empty table.

Two bugs found while writing it are worth recording, because both were checks
that passed while measuring nothing:

- Components declared as `React.FC<Props>` put the props on the **variable**,
  not the parameter, so an early version read zero props from roughly half the
  package and reported a pass.
- `extends Foo` is an `ExpressionWithTypeArguments`, not a `TypeReferenceNode`.
  Missing that skipped every inherited member — `Input`'s entire shared field
  contract — while still reporting a pass.

---

## Known gaps, not fixed here

Documenting every component surfaced several things that are **API problems
rather than documentation problems**. They are written down in the prop docs
where a consumer will meet them, and left alone otherwise.

Each open row has an issue — [#90](https://github.com/rtkelly13/design-system/issues/90)
through [#96](https://github.com/rtkelly13/design-system/issues/96) — and a PR
stacked on this branch. A row struck through has landed.

| What | Where | Why it was not fixed here |
| --- | --- | --- |
| `Button`'s `variant` names are hues (`cyan`, `pink`) for props that resolve to roles | `Button.tsx` | Renaming is a breaking API change; deliberately not bundled with the token migration. |
| `Avatar.accent` still takes only the four legacy palette names, not `AccentToken` | `Avatar.tsx` | Widening it is a small, non-breaking change and a better fit for its own PR. |
| `Card`'s form is chosen implicitly by the presence of `title` | `Card.tsx` | Changing the default is breaking. Documented as a trap and `panel` recommended explicitly. |
| `BlogPost` defaults `readingTime` to `'5 min read'` and `tags` to a three-item sample | `BlogPost.tsx` | These are *content* defaults that publish claims nobody made. Making them required is breaking. |
| `Slide.speakerNotes` is accepted and rendered nowhere | `slides/Slide.tsx` | There is no presenter view yet. Documented as such rather than removed. |
| ~~`ExperimentsView` hardcodes its catalogue; `DEFAULT_EXPERIMENTS` is exported but not a prop~~ | `experiments/ExperimentsView.tsx` | **Fixed** — [#95](https://github.com/rtkelly13/design-system/issues/95). |
| ~~`ExperimentsView` picks a badge accent with `status === 'active' ? 'cyan' : 'yellow'` — a status rendered through emphasis tokens, in legacy names~~ | `experiments/ExperimentsView.tsx` | **Fixed** — [#96](https://github.com/rtkelly13/design-system/issues/96). Now a `Record` over the intent roles; needed a re-baseline. |
| `not-prose` had never been checked by `no-custom-classname` | `authored-classes.mjs` | Every existing call site spells it inside a template literal ending in `.trim()` — the one shape the rule does not traverse. Now whitelisted as a plugin class, which is the honest fix. |

Two structural follow-ups worth considering, neither gated:

- **No Storybook landing page.** There is no `Introduction` entry, so the
  sidebar opens on whatever sorts first. The system-level material — the
  ladder, the role split, the styling rule — now lives on
  `Foundations/Theme Ladder` and `Foundations/Semantic Tokens`, which is a
  reasonable home but not a discoverable one.
- **`Docs/DocsLayout` and `Docs/TableOfContents` both used to report their
  title as `Overview`** to a naive parser, because the first `title:` in each
  file belongs to a nav fixture rather than the meta. Harmless here — the check
  parses properly now — but it is the kind of thing a regex-based tool gets
  wrong.
