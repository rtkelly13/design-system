# Notes: designing a syntax palette for a four-rung ladder

Working notes from building the `syntax` layer. Recorded because most of it was
learned by being wrong, and the wrong turns are the expensive part to repeat.

Everything below is measured. The scripts are `pnpm check:contrast --report`
(via `contrast:report`) and `pnpm separation:report`.

---

## 1. Contrast and distinctness are different gates, and only one existed

`check:contrast` asks *can this be read against its background*. Every colour in
a code block shares one background, so passing it says nothing about whether a
reader can tell a keyword from a string.

The measure that matters for the second question is **BT.709 luma**, not hue
distance — because luma is what survives the two things that destroy hue-only
distinctions:

- **4:2:0 chroma subsampling.** H.264 keeps luma per pixel and throws away three
  quarters of the colour. A 1–2px glyph stroke separated only by chroma
  converges to a single grey. This is not hypothetical — it is what happens the
  first time a code surface is rendered to video.
- **Colour vision deficiency.** The same pairs fail.

Measured on themes in wide use, pairs separated by chroma alone (ΔLuma < 20):

| theme | chroma-only pairs | worst |
|---|---|---|
| VS Code Dark+ | **4 / 10** | `keyword`/`string` ΔLuma **10.9** |
| Dracula | 1 / 10 | — |

Dark+ fails on keyword-vs-string, which is the most load-bearing distinction in
code. It is the theme anyone would reach for by default.

## 2. "Separate every pair" is arithmetically impossible

This was the first real wrong turn: six hand-picked palettes, six failures,
before working out that the target could not exist.

WCAG AA pins every colour into one luminance band relative to the ground:

| rung | usable luma band | width | roles it seats at Δ20 |
|---|---|---|---|
| midnight | 123–255 | 132 | 7 |
| dim | 124–255 | 131 | 7 |
| bright | 0–117 | **117** | 6 |
| white | 0–119 | **119** | 6 |

Eight roles held 20 apart need **140 steps**. No rung has one. No amount of
colour-picking fixes it, and picking colours was exactly what I kept trying.

The premise is what is wrong. **Roles do not all meet.** What must be told apart
is what sits adjacent.

## 3. Punctuation is the connective tissue

Measured over 3,875 role transitions across five real files (`levels.ts`,
`ThemeProvider.tsx`, and `terminalEngine.ts` / `Terminal.tsx` / `talkVideo.ts`
from `rtkelly13/blog`):

```
punctuation · variable   51.9%      number · punctuation      3.8%
keyword · punctuation    11.8%      keyword · variable        3.3%
punctuation · string      9.7%      comment · punctuation     2.0%
function · punctuation    7.0%      comment · keyword         1.2%
punctuation · type        6.3%      type · variable           0.6%
```

Punctuation appears in seven of the eight hottest pairs; pairs involving it
carry **92%** of all adjacencies. **Thirteen of the 28 possible pairs never
occur at all** and are free to share a luma band, differing by hue alone.

That is what turns an impossible 28-constraint problem into a satisfiable
10-constraint one — and it is why `midnight` can park `string`, `number`,
`function` and `type` within 17 luma of each other and still read correctly.

The list is in `ADJACENT_PAIRS` with the distribution in its doc comment. If the
corpus changes shape — a language with different punctuation density — remeasure
rather than guess.

### The corpus is five TypeScript files, and that is a limit worth stating

`punctuation · variable` at 51.9% is a property of TypeScript, not of source
code. Markdown, YAML, shell and SQL have different punctuation densities and
different hot pairs, and this ladder ships to a blog whose fenced blocks are in
several of them.

Nothing measured here is wrong; it is narrower than "real files" suggests. The
distribution should be remeasured across a wider corpus before `ADJACENT_PAIRS`
is treated as settled — and before anything is generated from it for an editor,
where the languages a reader opens are not the ones this package is written in.

## 4. Hand-picking does not converge; solve it

Six attempts failed. A trivial backtracking search over per-role candidate
lists found all four rungs immediately.

The transferable part: **assign luma first, then pick a hue at that luma.**
Every constraint lives on the luma axis, so choosing hex values and hoping is
searching the wrong space.

This is also the argument for shipping a gate rather than a palette. A palette
someone eyeballs will drift; `check:separation` will not.

## 5. Two things I got wrong that the gates caught

**Verified against the wrong ground.** The first palette was checked against
`surface.base` only. `check:contrast` audits `base`, `raised` *and* `sunken` —
and a code well **is** a sunken surface. On `white`, `surface.sunken` is
`#eef1f5`, a full step darker than the page, and `comment` went under at 2.86:1.
Caught only because the existing gate already knew to check all three.

**Claimed the light rungs were unsolvable.** After the band arithmetic came out
at 117 steps, I concluded `bright` and `white` could not be solved at any
threshold. That was the solver's *candidate list* talking, not a theorem — it
had no mid-luma options for `punctuation`. Once punctuation was allowed to sit
between the emphasis cluster and the comments, both rungs solved with a tightest
Δ of 20 and 27.

The theorem is narrower than I first stated it: **all-pairs** separation is
impossible; adjacency-only separation is achievable on every rung. Worth being
precise about, because the false version argues for abandoning light themes.

## 6. Light rungs need a second axis anyway

117 steps against 132 is a real squeeze even with the adjacency rule, so `bright`
and `white` carry **weight** as well as colour: keywords 700, types 600. Comments
are italic on all four rungs.

Solarized Light and GitHub Light both do this. The difference here is that it is
a declared consequence of the band arithmetic rather than a stylistic habit —
`syntaxEmphasis` is sparse on purpose, and the dark rungs have the range to
spare and so spend nothing.

## 7. Nobody clears both bars, so declare the exception

| theme | roles below AA 4.5:1 | worst | ratio |
|---|---|---|---|
| VS Code Dark+ | 0 / 8 | `comment` | 5.00 |
| Dracula | 1 / 9 | `comment` | 3.03 |
| Solarized Dark | **6 / 10** | `comment` | 2.79 |

Every failure is a low-emphasis role, and that is not carelessness. A comment as
loud as the code it annotates is worse for the reader than a ratio a checker
dislikes.

So `MINIMUM_RATIO` holds emphasis roles to 4.5:1 and `comment`/`punctuation` to
3:1 — written down and enforced, rather than discovered later by someone
wondering why the audit was silent about the syntax layer.

## 8. Portability needs a palette layer, not just roles

Not built here; recorded because it is the next decision.

Dracula ports to hundreds of tools because its contract is a **named palette**
(`Pink`, `Purple`, `Cyan`) and each port maps those names to its own tool's
scopes. A terminal has no concept of a keyword, but it can map *Violet →
magenta*.

This ladder has the opposite: a strong **role** vocabulary and no colour
vocabulary. Roles alone cannot port. Publishing both layers is what would make a
VS Code theme, an ANSI-16 map and a Shiki theme mechanical adapters rather than
redesigns.

Two gaps block that today, both tracked in #75:

- **No violet on any rung.** `number` borrows one inside `syntax`, but `accent`
  has none — so the ANSI **magenta** slot cannot be filled at all.
- **`accent.primary` is the only cool hue**, so a terminal map has to put it in
  both `blue` and `cyan`. With no bright variants declared either, 8 of 16 ANSI
  slots have nothing to draw on.

Promoting violet to `accent` was deliberately left out of this change: `Emphasis`
is `primary | secondary | tertiary | quiet`, and widening it touches every
accent-to-class map (#48 counts four of them) plus the dead-class lint rule. That
is a different diff with a different blast radius.
