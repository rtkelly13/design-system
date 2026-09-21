# Third-party reference material

**Parent:** [`AGENTS.md`](../AGENTS.md)

Licensing constraints on the local reference copies. Read before using any of it.

---

## 🖼️ Third-Party Reference Material

`reference/bookofshapes/` holds a local, **gitignored** copy of the 57 SVG patterns from
[bookofshapes.com](https://bookofshapes.com/) (Nikolaj Sokolowski), kept as inspiration
for background and geometric-pattern work.

1. **Reference only — not shippable.** The source site publishes **no licence**, so the
   artwork is all rights reserved. Nothing in `reference/bookofshapes/svg/` may be
   committed, bundled, or shipped in `src/`, and attribution alone does not make it
   permissible. Ask the author first (`nikolaj@creasurf.net`).
2. **Keep the ignore rule.** `.gitignore` excludes `reference/bookofshapes/svg/`; never
   remove it. `manifest.json` and `ATTRIBUTION.md` are the committed catalogue, and stay
   browsable without the artwork present.
3. **`pnpm check:reference-material` enforces 1 and 2.** `check:deps` and `check:licences`
   read `package.json` and the installed tree; this artwork is not a package, so neither
   can see it — the gap this paragraph used to predict. The gate reads the *tree*: it fails
   if anything under `reference/bookofshapes/svg/` is tracked, if the contact sheet is
   tracked, or if `.gitignore` stops listing either. It fails in the other direction too, so
   the catalogue below cannot be deleted to silence it.

   It exists because the ignore rule alone was not enough. `.gitignore` is advice to
   `git add`, silent under `git add -f`, under a tool with its own index, and under a
   branch cut before the rule — and one branch on this remote carries all 57 SVGs and the
   contact sheet for exactly that reason. Merging it would publish all-rights-reserved
   artwork from a public repository with nothing in CI objecting.
4. **Repopulate with `python3 reference/bookofshapes/fetch.py`** — stdlib only, rate
   limited, and it must never touch the site's `/api/` path (robots-disallowed).
5. **Read `reference/bookofshapes/README.md` before using any of it.** It covers the
   licensing position and the `--fill-color` / `--stroke-color` / `--background-color` /
   `--occlusion-color` theming contract worth adopting for our own generated patterns.


