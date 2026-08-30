# Fitting Book of Shapes to the generator system

An evaluation of the 57 reference patterns against the blog's
`components/graphics` generators, as they stand on
[blog#121](https://github.com/rtkelly13/blog/pull/121) (the `sample`/`project` split),
[blog#132](https://github.com/rtkelly13/blog/pull/132) (`lattice.ts`, hex/triangle/ridgeline)
and [blog#136](https://github.com/rtkelly13/blog/pull/136) (the Remotion spike).

Per-pattern verdicts live in `verdicts.json` and render in the contact sheet.
Nothing here proposes copying artwork — see [README.md](./README.md).

## Where to look at them

`python3 contact_sheet.py`, then serve it. The patterns recolour cleanly into the
brutalist accents, which is what makes the judgement possible at all: in the source
site's grey they all read as "nice pattern", and in neon-on-black it becomes obvious
which ones are *structural* and which are *illustrative*.

**This viewer cannot become a deployed `/experiments/` page.** The blog deploys to
Vercel, so shipping the reference art is publishing it — the exact thing the missing
licence forbids. What belongs at `/experiments/graphics` is our own generators; the
reference sheet stays local. That split is the whole shape of this work: look here,
build there.

## The verdicts

| | Count | Meaning |
|---|---|---|
| **port** | 17 | Strong fit — worth building as a generator |
| **adapt** | 18 | Good idea, needs rework (weight, or a missing capability) |
| **covered** | 9 | We already have an equivalent — 4 before this work, 5 built since |
| **skip** | 13 | Aesthetic or technical mismatch |

Four were covered before any of this work — `joy_division` → `ridgeline`, `node_garden`
→ `node-network`, `noise_landscape_1` → `contour`, `triangular_mosaic` →
`triangle-grid`. The overlap being that small was itself the finding: nine generators
against a 57-pattern reference set meant the gap was opportunity, not duplication.

Five more are covered now, built in blog#138 — `radial_spokes`, `interference-mesh`,
`wave-field`, `quarter_circles_grid` and `isometric-cube-grid`. Verdicts are kept current
as things ship, so this file stays a worklist rather than becoming a snapshot.

## The gap that matters most: there is no radial generator

All nine current generators are Cartesian — grids, lattices, hatches, horizontal
bands. The reference set has **18 radial patterns**, and we cover exactly none of them.

That is not a coverage statistic, it is a compositional one. Every background the site
can currently draw is edge-to-edge uniform texture. A radial pattern has a *centre*,
which means it can sit behind a title, focus a hero, or anchor a slide — things no
amount of `dot-grid` achieves. `rect_field_void` makes the point from the other
direction: a dense Cartesian field with a hole punched in it, where the negative space
is the composition.

Cheapest way in, in order: `radial_spokes` (24 KB), `modular_circle` (24 KB),
`radial_harmony` (35 KB), `brockmann_arcs` (2 KB — the lightest of all 57). All four
are simple polar arithmetic, and all four animate by rotation, which is a free seamless
loop under the `cycles()` rule.

## The colour contract needs a third slot

`GraphicParams` carries a single `accent` plus a `background`, and generators fake
depth with `withAlpha(accent, α)`. The reference set separates `--fill-color`,
`--stroke-color` and `--occlusion-color`, and the distribution says why: **exactly 10
of 57 use occlusion, and all 10 are isometric.**

Alpha cannot substitute. Occlusion has to be opaque and match the backdrop, or stacked
solids show through each other and the depth cue collapses. And it cannot be derived
from `background` either, because `background` defaults to `'transparent'` — which is
correct for layering over a surface, and leaves literally no colour to occlude with.

So `iso-grid` draws diamonds rather than cubes, and every isometric idea in the
reference set — `isometric-cube-grid`, `iso_test_noise_field`, `sine-cube`,
`isometric_cubes` — is blocked behind one missing parameter. Adding
`occlusion?: string` to `GraphicParams`, defaulting to the theme's surface colour
rather than to `background`, unblocks all of them at once. It is the single
highest-leverage change here.

`wavy_fabric` is the interesting counter-example: over/under weaving is a genuine
occlusion use that is not isometric at all.

## Animation fit

The `sample`/`project` split rewards a specific shape of pattern: structure drawn once
from the rng, then moved by pure arithmetic. Judged that way the reference set sorts
sharply, and *not* along the lines its own tags suggest.

**Best fits — `project` is pure formula, no sampled structure needed at all:**

- `lissajous_field` — integer frequency ratios close the loop *by construction*.
  `cycles()` is enforcing by hand exactly the property Lissajous figures have natively.
- `interference-mesh` and `ripple_grid` — two-source interference as displaced lines.
  Sample the grid once; project the wave. The sources orbit on whole cycles, the marks
  never re-roll. This is the closest fit to the machinery already built, and
  `contour`'s travelling-wave phase advance is the precedent. **Shipped** as
  `interference` in [blog#138](https://github.com/rtkelly13/blog/pull/138).

**A correction, from building it.** This section originally led with `flow_lines` and
`flow_poles` as the best fits of all, on the reasoning that streamlines through a vector
field are pure arithmetic. Implementing them disproved it, and the failure is worth more
than the recommendation was.

Integrating a streamline feeds each step's position into the next, so an angular nudge at
the seed compounds all the way down the line — and near a separatrix the tail *switches
channel* rather than drifting. It scored a smoothness ratio of **1.0**, the confetti
signature, from a generator that re-rolls nothing at all: one value moved 271px in a
single 1/300 step. Weakening the field only postpones it; a sweep over amplitudes
0.4–1.1 and step counts 4–26 never cleared 5.5, against 45+ for everything else.

Advection and coherence are in genuine tension. The form of the idea that survives is
`wave-field` — the direction field itself, no feedback between marks — and that is what
shipped as `flow-field`. **"Pure arithmetic" was the wrong test; "no term feeds the next"
is the right one**, and it is the property worth checking any future adaptation against.

**Motion ideas the current generators lack:**

- `flow_dots` — a strict grid at one edge coming apart into strands toward the other.
  Current generators wobble every mark by the same amplitude, so they read as uniform
  texture; a *gradient* of disorder across the frame is a composition, not a texture.
  `jittery_squares_grid` and `triangular_mosaic` are the same idea, and the order-to-chaos
  ramp is the half of `triangular_mosaic` that `triangle-grid` does not cover.
- `signal_decay` — decaying oscillation. Matches the site's terminal voice more
  directly than anything currently in the set.
- Truchet tiling (`quarter_circles_grid`, `concentric_arc_truchet_2`) — per-tile
  rotation through whole turns. `lattice.ts` already provides the cell geometry, so
  this is close to free, and it is a genuinely different motion: the tiling stays put
  while the marks inside it turn.

**Poor fits, and worth knowing why:** `deformed_grid_mesh` and `spiral_morph` animate
by driving the *distortion*, which is sampled — the same trap `density` falls into, and
`generators.ts` already documents interpolating between two sampled structures as the
way out. `masked_letter_grid` needs font metrics a pure-string generator cannot get.

## Weight

Reference SVGs are drawn at fixed detail; ours scale with `density`. It shows:

| | median | range |
|---|---|---|
| Reference patterns (57) | **172 KB** | 2 KB – 1.76 MB |
| Our generators at `density 0.5` | **15 KB** | 4 KB – 69 KB |

37 of 57 exceed 100 KB. That matters because `LayoutWrapper.tsx` and
`SpectacleDeck.tsx` consume generators through `graphicDataUri()`, and a data URI is
~1.3× the SVG after `encodeURIComponent` — so a median reference pattern would land
~230 KB inline in the HTML.

Our own outlier is instructive: `iso-grid` is 69 KB at `density 0.5` and **176 KB at
1.0**, far and away the heaviest of the nine — and the reference set's isometric
patterns are its heaviest too (`iso-sphere`, 1.76 MB). Isometric lattices are expensive
because every cell is three filled faces plus strokes. If occlusion gets added and
isometric generators follow, they need a lower `density` ceiling than the others, and
`iso-grid` should probably get one now regardless.

## Suggested order — all five now done

Carried out in [blog#138](https://github.com/rtkelly13/blog/pull/138), which took this
list in order:

1. ✅ **`occlusion` on `GraphicParams`**, defaulting to the theme surface. Unblocked the
   isometric family for one optional field, and `iso-cubes` uses it.
2. ✅ **A radial generator** — `radial-spokes`. Closed the biggest compositional gap for
   the least code, and proved polar arithmetic in `project`.
3. ✅ **`interference`** — reuses `contour`'s travelling-wave phase advance directly.
4. ✅ **A time control**, as `/experiments/backgrounds` rather than a scrubber bolted to
   the still gallery. `AnimatedBackground` samples once and projects per frame, which
   `getGenerator()` existed for and only the tests were doing.
5. ✅ **A disorder gradient**, from `flow_dots`. Cross-cutting as hoped: wired into
   `dot-grid`, `iso-grid` and `truchet-arcs` without moving a single golden, because it
   perturbs from a coordinate hash rather than an rng draw.

Still open, in rough order of value: an isometric height field beyond `iso-cubes`
(`iso_test_noise_field`), the Truchet tile parameterised for the mirrored variant
(`concentric_arc_truchet_3`), and `signal_decay`, which matches the site's terminal voice
more directly than anything currently in the set.
