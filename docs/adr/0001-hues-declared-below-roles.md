---
status: proposed
---

# Hues are declared below Roles, not derived from them

Sits under [`0002`](./0002-one-source-many-emitted-surfaces.md), which is the root decision and
logically prior to this one: two of that ADR's four surface classes address colour by
appearance, so the vocabulary below is a precondition of it rather than an enhancement to it.

The system's whole thesis is that a colour is addressed by its job and not its appearance —
`accent.primary`, not `cyan` — and #90, #91 and #96 are the migration onto that. But Targets
exist that have no notion of jobs: a terminal has sixteen positions named by colour, and no
concept of a keyword. So we are adding a Hue vocabulary (#79) *underneath* the Role
vocabulary: `palette` holds the Declared literals, and `accent`, `intent` and `syntax`
reference its entries by name. Components address only Roles, and never a Hue.

## Considered options

**Roles only.** Keep the current shape and accept that terminals, ANSI schemes and roughly
half of a JetBrains scheme cannot be emitted at all. Rejected because it forecloses a Target
that is otherwise the cheapest one on the list — sixteen Slots, a foreground, a background, a
cursor, no chrome and no scopes.

**Hues only.** Let components address `cyan` directly, as they did before the semantic layer.
Rejected: this is the state #90/#91/#96 are undoing, and it is what makes a retheme a
find-and-replace instead of a token change.

**Both, independently declared.** Each Group holds its own literals; the ANSI map gets its own
sixteen values per Level. Rejected because the two sets then drift silently, and there is no
arithmetic that can catch a `palette.cyan` that no longer matches the `accent.primary` it is
supposed to be.

**Roles hold the literals, Hues Derived from them.** Rejected on a concrete failure: an
Emitter targeting ANSI would have to answer "which of the sixteen is `#22d3ee`?" by inspecting
a hex. That is ambiguous when two Roles share a value, and lossy when no Role sits near a
named hue — the system has no violet on any Level today, so `magenta` would resolve to
whatever happened to be closest. Hue → Role is a declared lookup; Role → Hue is a guess.

## Consequences

- **`LegacyAccent` must retire before `palette` is addressable by consumers.** Its members are
  `'cyan' | 'pink' | 'yellow' | 'green'` — the same words `palette` now claims. Leaving both
  alive means a hue name with two meanings in one repo, one foundational and one deprecated,
  which is how a component ends up addressing the wrong one.

  **This did not happen in 0.5.0, and the ADR said it would.** Recorded rather than quietly
  amended, because the reason matters: the retirement is 49 call sites across component
  source, and it belongs to #90 and #91, whose pull requests (#97, #98) sat unrebased under a
  seven-deep stack while the Level collapse and the palette landed. `palette` shipped first
  because it is additive and the retirement is not.

  The overlap is real but narrow while it lasts: `LegacyAccent` is a *Role* argument
  (`<Avatar accent="cyan">`), `palette` is a *token namespace* (`--ds-palette-cyan`), and no
  component reads the latter. The hazard is a reader assuming the two are connected, not a
  wrong colour rendering. It should still be closed in `0.6.0`.
- **A Hue in component code is a defect**, of exactly the kind #96 describes. `token-rules.mjs`
  already reports colour literals at the site that wrote them; it is the natural place for the
  rule, and the rule is what keeps this decision from decaying into the previous state.
- **Slot maps are Derived, and their fan-out lives in the Emitter.** Sixteen ANSI Slots resolve
  from fewer Hues by a map that is data, so adding a Target can never change a colour. This
  needs two Gates the repo does not have — slot coverage, and a committed fixture diff — because
  a wrong fan-out emits confidently rather than failing.
- **`palette` must be gated once per Hue** rather than once per Role that uses it, which makes
  `check:separation` cheaper to reason about: separate the palette, not each of its consumers.
