# Theme taxonomy — what a Level declares, and what that lets us emit

**Parent:** [`AGENTS.md`](../AGENTS.md) · **Glossary:** [`CONTEXT.md`](../CONTEXT.md) ·
**Tracking:** #77

This is the reference for *which Groups a Level has to declare before a given Target can be
emitted*. It exists because the answer is not obvious: of the eleven plausible Targets, five
are blocked on a Group that does not exist yet, two of those on a Group nothing has claimed,
and one is blocked on a Group that cannot be built until a contrast finding is resolved.

Terms used here — Level, Group, Role, Hue, Slot, Target, Emitter, Declared, Derived — are
defined in [`CONTEXT.md`](../CONTEXT.md) and used in that sense throughout.

**This file covers one of the two axes.** Everything below varies by Level, which per
[`adr/0004`](./adr/0004-two-axes-level-and-medium.md) means it is colour. Type scale, spacing,
border width, shadow offset, radius, motion and z-index vary by **Medium** — `web`, `video`,
`graphic` — and are not in these tables. The two Targets added in §3 are here because of what
colour they need, not because they carry scales.

---

## 1. Two vocabularies, and which way they point

Every colour in the system is named in one of exactly two ways.

**Roles** name a job. `accent.primary` is "what the eye should reach first"; `intent.danger`
is "this carries bad news"; `syntax.keyword` is "this token is a keyword". A Role is what a
component addresses, and it is the vocabulary the whole system is built on — § *Semantic
Theming* in `AGENTS.md` is the argument for it, and #90, #91 and #96 are the migration onto it.

**Hues** name an appearance. `cyan` is cyan. A Hue is what a Target addresses when it has no
notion of jobs — a terminal has sixteen positions named by colour and no concept of a keyword.

The load-bearing structural decision is **which of the two holds the literal**:

```
palette          ← Hues. Declared literals. The only place a colour originates.
  ↑ referenced by
accent, intent, syntax    ← Roles. Reference a palette entry by name.
```

Not the other way round. If Roles held the literals and Hues were Derived from them, an
Emitter targeting ANSI would have to answer "which of the sixteen is `#22d3ee`?" by
inspecting a hex — ambiguous when two Roles share a value, and lossy when none of them is
close to a named hue. Hue → Role is a declared lookup; Role → Hue is a guess.

The consequence that makes this safe: **a component never addresses a Hue.** `palette.cyan`
in component code would be exactly the defect #96 describes. `LegacyAccent` — the deprecated
`'cyan' | 'pink' | 'yellow' | 'green'` union — is retired in 0.5.0 alongside the Level
collapse, so after that release a hue name has one meaning in this repo and it is this one.

---

## 2. The Groups

| Group | Vocabulary | Origin | Alpha | Gate | Status |
|---|---|---|---|---|---|
| `palette` | **Hue** | Declared | no | contrast + separation, once per Hue | **#79 — does not exist** |
| `chart` | **Hue**, ordered | → `palette` | no | pairwise separation across the whole sequence | **does not exist — unowned** |
| `surface` | Role — elevation | Declared | `overlay` only | contrast (as ground); surface pairs reported, never a device | ships |
| `text` | Role — prominence | Declared | no | contrast ≥ 4.5 on every surface | ships |
| `border` | Role — weight | Declared | no | contrast ≥ 3 (`strong`, `default`), ≥ 1.4 (`subtle`) | ships |
| `accent` | Role — hierarchy | → `palette` | no | contrast ≥ 4.5; selection device ≥ 3 on `base` and `raised` | ships |
| `intent` | Role — meaning | → `palette` | no | contrast ≥ 4.5 | ships |
| `syntax` | Role — code token | → `palette` | no | contrast on `base`/`raised`/`sunken`; separation ΔLuma ≥ 20 on measured-adjacent pairs | **#76 — open** |
| `syntaxEmphasis` | none — weight, slant | Declared, sparse | — | none: carries no colour | **#76 — open** |
| `editor` | Role — chrome | Declared `#rrggbbaa` | **yes** | composited contrast; background-pair separation | **#80 — blocked by #78** |
| `shadow` | single value | Declared | no | none — tracks `border.strong` | ships |

Four observations that fall out of the table.

**The two Hue Groups are the two that serve a Target with no notion of jobs.** Everything else
is role-addressable, which is why #79's value is precise rather than general: it unlocks
terminals and half of JetBrains, and elsewhere it clarifies without unblocking.

**`chart` is a sequence, not a record, and that is the whole difficulty.** Every other Group is
a set of named members answering a fixed question — four accents, three borders. A chart, a
diagram or an ASCII panel needs *N* colours that are mutually distinguishable, where the caller
picks N at use time and the only contract is that any two members read as different. So its
Gate is not "each member against a ground" but **every pair against every other pair**, which
is a check no existing Gate has the shape of. `adr/0002` names the requirement — "N mutually
distinguishable colours rather than four levels of emphasis" — and nothing has owned it since.
It is the reason the graphics surfaces reach for raw primaries: `palette` will give them hue
names, and still will not tell them which six to use in one figure.

**`editor` is the only Group with meaningful alpha**, and that is why #81 exists. Both current
Gates measure a foreground against an opaque, Declared background. "Keyword over selection
over code well" is neither, so neither Gate can see it — which is how #78's finding went
unnoticed: on the light Level a selection band has **0 sRGB steps** of Headroom, and nothing
in CI can say so.

**`syntaxEmphasis` is the one Group with no colour in it**, and it is not decoration. Light
grounds compress the usable luma band, so weight and slant do work that colour cannot. A
Group that no Gate covers is normally a smell; here it is correct, because there is nothing
arithmetic to check.

---

## 3. What each Target needs

✓ required · ~ partial · – not used

| Target | Medium | palette | chart | surface | text | border | accent | intent | syntax | syntaxEmphasis | editor | Blocked on |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Web / Tailwind** `theme.css` | `web` | – | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | – | nothing — ships today |
| **Shiki** | `web` | – | – | ~ `sunken` | ~ `primary` | – | – | – | ✓ | ✓ | – | #76 merging |
| **OpenDesign package** | `web` | – | – | ✓ | ✓ | ✓ | ✓ | ✓ | – | – | – | nothing — see #117 |
| **Remotion compositions** | `video` | – | – | ✓ | ✓ | ✓ | ✓ | ✓ | ~ via Shiki | ~ via Shiki | – | the `video` Medium — #49, `adr/0004` |
| **SVG / diagram generators** | `graphic` | ✓ | **✓** | ~ ground only | ~ `primary` | ~ `strong` | – | ~ good/warn/bad | – | – | – | **#79, and `chart` is unowned** |
| **Mermaid theme** | `graphic` | ✓ | **✓** | ✓ | ✓ | ✓ | ~ | ✓ | – | – | – | **#79, `chart`; ~40 Slots, fan-out unwritten** |
| **VS Code** | — host | – | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | #80 → #78 |
| **Zed** | — host | – | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | #80 → #78 |
| **Neovim** | — host | – | – | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | ~ flattened | capture fan-out; #80 |
| **Terminal / ANSI** | — host | **✓** | – | ~ `base`, `sunken` | ~ `primary` | – | – | – | – | – | ~ selection only | **#79** |
| **JetBrains** | — host | ✓ | – | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | everything above |

**Shiki is the keystone**, and it is worth being explicit about why: Shiki consumes VS Code
theme JSON directly. The file that themes the editor is the file that highlights the blog, the
docs portal (#74) and the Remotion frames. One Emitter, one file per Level, four consumers.
Nothing else on the list has that property.

**Terminal / ANSI is the cheapest Target that is completely blocked.** It needs no chrome, no
scopes and no semantic map — sixteen Slots, a foreground, a background, a cursor and a
selection. It is blocked entirely on `palette` not existing. That asymmetry is the argument
for #79 landing before any editor work: one Group unlocks a whole Target, and four encodings
of it (iTerm2, Windows Terminal, Alacritty, Ghostty) are the same sixteen values written four
ways.

**The three rows below `OpenDesign` are the ones `adr/0002` says were missing**, and adding
them changes what the table says about priority. Two of the four surface classes had no row at
all, so the eight Targets listed were all web or editor — and the estate does not look like
that. `blog/css/tailwind.css` declares 35 `--diagram-*` properties across ten names,
`blog/components/graphics/palette.ts` holds two hue-keyed records, `blog/video/src` hardcodes a
retired ground, `mermaid-toolkit` hand-authors four presets of roughly forty Slots each, and
`shared-utilities/image_drift` has independently reinvented the Role vocabulary in Python under
different names — `ink`, `panel`, `edge`, `sunken`, `accent`, `good`, `warn`, `bad`. Five
forks, and only one of them is the one 0002 names.

**The graphics Targets are blocked twice, and the second block is the interesting one.** #79
gives them hue *names*; it does not tell a figure which six hues to use together, which is
`chart` and which nothing owns. So `palette` unblocks Terminal / ANSI completely and the
graphics rows only halfway — worth knowing before #79 is scoped, because the same solve could
produce the ordered sequence while the separation arithmetic is already loaded.

**The `graphic` and `video` rows also need a Medium**, per `adr/0004`, and the `— host` rows do
not. That column is not decoration: it is what says a Mermaid theme needs a type scale from us
and a VS Code theme must never receive one.

---

## 4. What is Derived, and where the fan-out lives

Nothing in the table above is Derived. Every Group is Declared literals, per rule 4 of
§ *The Theme Ladder*. Everything below is computed from them, is a cache, and is verified
against its source in CI.

| Derived form | From | Fan-out? | Verified by |
|---|---|---|---|
| `--ds-*` custom properties | every Group | no — 1:1 | `tokens:check` |
| `--color-*` Tailwind aliases | Groups, per Family | no — 1:1 | `tokens:check`, `theme.css.test.ts` |
| Per-Level and polarity variants | Level names | no | `theme.css.test.ts` |
| **ANSI 16 map** | `palette` | **yes** — 16 Slots from ~10 Hues | fixture diff, per §5 |
| **TextMate scope map** | `syntax` | **yes** — hundreds of scopes from 8 Roles | scope-coverage gate |
| **Semantic token map** | `syntax` | **yes** — `parameter` → `variable`, etc. | must be emitted *with* TextMate |
| **Treesitter capture map** | `syntax` | **yes** | scope-coverage gate |
| Opaque `editor` values | `editor` + `surface` | no — composite | composited contrast |
| Design Tokens JSON | Role Groups | no | `--check` mode, see #117 |

Two rules govern this half of the taxonomy.

**A fan-out map lives in the Emitter, never in a Level.** It is data, so it is unit-testable;
and keeping it out of the Levels means adding a Target can never change a colour. Widening
`SyntaxRole` to chase a Target's granularity is the failure mode this prevents — there is no
luma range to pay for a ninth Role, least of all on the light Level.

**Targets that cannot take alpha need `editor` flattened, and the flattened value needs
re-gating.** Terminals and Neovim have no alpha. Compositing `editor.selection` against a
known `surface.sunken` produces an opaque value that must *itself* clear contrast against
every `syntax` Role painted on it. This is the same arithmetic as composited contrast, run at
emit time rather than declaration time — so #81's gate covers both, and is a prerequisite for
those two Targets as much as for VS Code.

One trap, stated once because it costs a day to find: **semantic tokens override TextMate
scopes in VS Code, and Shiki only implements TextMate.** Emit `tokenColors` without
`semanticTokenColors` and TypeScript renders one way in the editor and another on the blog,
from the same file — with a screenshot gate that passes, because the screenshot came from
Shiki. Emit both maps from one source, and say so in the Emitter's header.

---

## 5. Gate coverage, and the holes

| Gate | Measures | Covers | Exists |
|---|---|---|---|
| `check:contrast` | foreground vs Declared ground | `text`, `border`, `accent`, `intent`, `syntax` | yes |
| `check:separation` | foreground vs adjacent foreground, **OKLab ΔE** | `syntax` measured-adjacent pairs | #76 |
| `auditSelectionDevices` | accent fill / edge vs two grounds | `accent` | yes |
| **composited contrast** | foreground vs translucent-over-ground | `editor`, flattened `editor` | **#81 — no** |
| **background-pair separation** | ground vs ground, ΔLuma | `editor` diff and merge bands | **#81 — no** |
| **pairwise separation** | every member against every other member, ΔE | `chart`, at each N | **no** |
| **slot coverage** | Slots that map to nothing | every fan-out map | **no** |
| **fixture diff** | emitted Slots vs a committed expectation | ANSI 16, and later scope maps | **no** |

Slot coverage and the fixture diff are the two a purely Derived pipeline needs and does not
have. A fan-out map that is wrong emits confidently: an inverted ANSI map, or a scope that
resolves to no Role, produces a valid file full of wrong colours. `check:visual-coverage`
already does this shape of bookkeeping for stories against snapshots; slot coverage is the same
idea aimed at Slots, and the fixture diff is `api/index.d.ts`'s trick — commit the emitted
shape, and make the diff the review.

Two further notes on this table, both from `adr/0004`.

**Pairwise separation is a different arithmetic, not a wider loop.** Every other separation
Gate walks a list of pairs someone decided are adjacent. `chart` has no adjacency: any two
members can end up next to each other in a figure, so the Gate is the full N×N and it has to
hold *at every N* the sequence is truncated to — a six-colour chart that separates cleanly can
collide at four if the members are dropped from the wrong end. That is why the sequence is
ordered rather than a set.

**The floors in this table are one global record, and they should be per Medium.**
`MINIMUM_RATIO` in `src/theme/contrast.ts` holds a single number per Role for every surface the
system emits to. `palette-provenance.md` solves the palette to 5.5:1 while the Gate enforces
4.5:1, so the floor the values were actually chosen against is not the floor anything checks.
A projected 1080p frame and an unantialiased terminal cell are not the browser's problem
either. Nothing here needs a new Gate — it needs the number it reads to be indexed.

---

## 6. Sequence this implies

1. **#79 — `palette`, with `chart` in the same solve.** Unlocks a whole Target on its own, and
   is the layer every later Emitter names its colours through. Retire `LegacyAccent` in the
   same release so a Hue name has one meaning. Do #48 first: it collapses four accent-to-class
   maps into one, which turns widening `Emphasis` from a four-site change into a one-site
   change. `chart` belongs here rather than later because the separation arithmetic is already
   loaded at this point and the five forked graphics palettes have nowhere to migrate to
   without it.
2. **#78 — re-solve the light Level.** Before anything external pins a value. Note this is now
   larger than #78 states: the Level collapse replaced `bright` with `sketch` values that do
   not clear the 4.5:1 floor they already have, let alone the 5.5:1 floor #78 proposes.
3. **#81 — the composited gate**, before `editor` rather than after, so twelve translucent
   values per Level are never a palette someone eyeballed.
4. **#80 — `editor`.** The largest single Group, and the one that decides whether the VS Code
   theme looks finished or looks generated.
5. **#84 — `build-themes.mjs`**, emitting VS Code JSON, which is Shiki's input too. Add the
   slot-coverage and fixture-diff gates here, with the maps.
6. **Terminals, then Neovim, then Zed.** A day each once `palette` and the flattening exist.
   JetBrains last, and only if it is actually wanted.

The ordering is not by appeal. #79 comes first because it is the only item that unblocks a
Target by itself; #78 comes second because it is the only item that gets more expensive the
longer it waits.

**The Medium axis runs alongside this list, not inside it.** `adr/0004` is a decision rather
than an implementation, and #49 is the implementation of it; neither blocks nor is blocked by
`palette`. It does have one ordering constraint of its own: it gets more expensive after #49
starts, because a spacing scale authored on the wrong axis has to be re-authored rather than
extended. So it wants settling before the first non-colour token is written, and nothing about
it needs to wait for a Level to be re-solved.
