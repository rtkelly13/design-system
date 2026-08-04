#!/usr/bin/env node
/**
 * Assembles the screenshot walkthrough contact sheet.
 *
 * Runs after `tests/walkthrough.spec.ts` and derives everything from artifacts
 * already on disk — the theme list comes from the directories the run actually
 * produced, and story metadata from Storybook's own index. Nothing is
 * duplicated from the spec, so the two cannot drift.
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STORYBOOK_INDEX = path.join(REPO_ROOT, 'storybook-static', 'index.json');
const WALKTHROUGH_DIR = path.join(REPO_ROOT, 'walkthrough');
const SHOTS_DIR = path.join(WALKTHROUGH_DIR, 'shots');

/** Preferred display order; anything unrecognised is appended alphabetically. */
const THEME_ORDER = ['dark', 'dim', 'sketch'];

async function readStoryMetadata() {
  try {
    const parsed = JSON.parse(await readFile(STORYBOOK_INDEX, 'utf8'));
    return Object.fromEntries(
      Object.values(parsed.entries)
        .filter((entry) => entry.type === 'story')
        .map((entry) => [entry.id, { title: entry.title, name: entry.name }]),
    );
  } catch {
    // The sheet still works without it — ids just stand in for names.
    return {};
  }
}

async function listThemes() {
  const dirents = await readdir(SHOTS_DIR, { withFileTypes: true }).catch(() => []);
  const found = dirents.filter((d) => d.isDirectory()).map((d) => d.name);
  return found.sort((a, b) => {
    const ai = THEME_ORDER.indexOf(a);
    const bi = THEME_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

async function collectShots(themes) {
  /** @type {Map<string, Set<string>>} storyId -> themes captured */
  const byStory = new Map();

  for (const theme of themes) {
    const files = await readdir(path.join(SHOTS_DIR, theme)).catch(() => []);
    for (const file of files) {
      if (!file.endsWith('.png')) continue;
      const id = file.slice(0, -4);
      if (!byStory.has(id)) byStory.set(id, new Set());
      byStory.get(id).add(theme);
    }
  }

  return byStory;
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

function renderPage({ groups, themes, meta }) {
  const totalShots = groups.reduce(
    (sum, group) => sum + group.stories.reduce((n, s) => n + s.themes.length, 0),
    0,
  );

  const nav = groups
    .map(
      (g) =>
        `<a href="#${escapeHtml(slug(g.title))}">${escapeHtml(g.title)} <span>${g.stories.length}</span></a>`,
    )
    .join('');

  const sections = groups
    .map((group) => {
      const rows = group.stories
        .map((story) => {
          const cells = themes
            .map((theme) => {
              if (!story.themes.includes(theme)) {
                return `<td class="cell missing"><span>not captured</span></td>`;
              }
              const href = `shots/${theme}/${story.id}.png`;
              return `<td class="cell">
                <a href="${escapeHtml(href)}" target="_blank" rel="noopener">
                  <img loading="lazy" src="${escapeHtml(href)}" alt="${escapeHtml(`${story.name} in ${theme} theme`)}">
                </a>
              </td>`;
            })
            .join('');

          return `<tr>
            <th scope="row">
              <span class="story-name">${escapeHtml(story.name)}</span>
              <code>${escapeHtml(story.id)}</code>
            </th>
            ${cells}
          </tr>`;
        })
        .join('');

      return `<section id="${escapeHtml(slug(group.title))}">
        <h2>[ ${escapeHtml(group.title)} ]</h2>
        <table>
          <thead>
            <tr>
              <th scope="col" class="corner">Story</th>
              ${themes.map((t) => `<th scope="col">${escapeHtml(t)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>`;
    })
    .join('');

  return `<!doctype html>
<html lang="en" class="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Design System — Storybook Walkthrough</title>
<style>
  :root {
    --bg: #000; --fg: #fff; --cyan: #22d3ee; --pink: #ec4899;
    --yellow: #facc15; --edge: #fff;
  }
  * { box-sizing: border-box; border-radius: 0 !important; }
  body {
    margin: 0; padding: 0 1.5rem 5rem;
    background: var(--bg); color: var(--fg);
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 14px; line-height: 1.5;
  }
  header {
    position: sticky; top: 0; z-index: 10;
    margin: 0 -1.5rem 2rem; padding: 1.25rem 1.5rem;
    background: var(--bg); border-bottom: 2px solid var(--edge);
  }
  h1 {
    margin: 0 0 .5rem; font-size: 1.4rem; font-weight: 800;
    text-transform: uppercase; letter-spacing: .04em;
  }
  .meta { color: var(--cyan); font-size: .78rem; }
  .meta span { color: var(--yellow); }
  nav { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .9rem; }
  nav a {
    display: inline-flex; align-items: center; gap: .4rem;
    padding: .2rem .55rem; border: 2px solid var(--edge);
    color: var(--fg); text-decoration: none;
    font-size: .68rem; text-transform: uppercase; font-weight: 700;
  }
  nav a:hover { background: var(--cyan); color: #000; }
  nav a span { color: var(--pink); }
  nav a:hover span { color: #000; }
  section { margin-bottom: 3.5rem; scroll-margin-top: 8rem; }
  h2 {
    margin: 0 0 1rem; font-size: 1rem; font-weight: 800;
    text-transform: uppercase; color: var(--yellow); letter-spacing: .08em;
  }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  thead th {
    padding: .45rem .6rem; border: 2px solid var(--edge);
    text-transform: uppercase; font-size: .72rem; color: var(--cyan);
    text-align: left; background: #0a0a0a;
  }
  .corner { width: 15rem; }
  tbody th {
    padding: .6rem; border: 2px solid var(--edge);
    text-align: left; vertical-align: top; font-weight: 400;
  }
  .story-name {
    display: block; font-weight: 800; text-transform: uppercase;
    font-size: .8rem; margin-bottom: .25rem;
  }
  tbody th code { font-size: .65rem; color: #888; word-break: break-all; }
  .cell { padding: .5rem; border: 2px solid var(--edge); vertical-align: top; }
  .cell img {
    display: block; width: 100%; height: auto;
    border: 1px solid #333; background: #111;
  }
  .cell a:hover img { outline: 2px solid var(--cyan); outline-offset: 2px; }
  .missing { text-align: center; color: var(--pink); font-size: .72rem; }
  @media (max-width: 900px) {
    table, thead, tbody, tr, th, td { display: block; width: auto; }
    thead { display: none; }
    .cell::before {
      content: attr(data-theme); display: block;
      color: var(--cyan); font-size: .7rem; text-transform: uppercase;
    }
  }
</style>
</head>
<body>
<header>
  <h1>[ Design System — Storybook Walkthrough ]</h1>
  <p class="meta">
    <span>${groups.reduce((n, g) => n + g.stories.length, 0)}</span> stories &middot;
    <span>${themes.length}</span> themes &middot;
    <span>${totalShots}</span> screenshots
    ${meta.commit ? `&middot; commit <span>${escapeHtml(meta.commit.slice(0, 7))}</span>` : ''}
    ${meta.branch ? `&middot; <span>${escapeHtml(meta.branch)}</span>` : ''}
    ${meta.generated ? `&middot; ${escapeHtml(meta.generated)}` : ''}
  </p>
  <nav>${nav}</nav>
</header>
${sections}
</body>
</html>
`;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  const themes = await listThemes();
  if (themes.length === 0) {
    console.error(
      `No screenshots found under ${SHOTS_DIR}. Run the walkthrough spec first.`,
    );
    process.exit(1);
  }

  const meta = await readStoryMetadata();
  const shots = await collectShots(themes);

  /** @type {Map<string, Array<{id: string, name: string, themes: string[]}>>} */
  const grouped = new Map();

  for (const [id, capturedThemes] of shots) {
    const info = meta[id] ?? { title: 'Unknown', name: id };
    if (!grouped.has(info.title)) grouped.set(info.title, []);
    grouped.get(info.title).push({
      id,
      name: info.name,
      themes: themes.filter((t) => capturedThemes.has(t)),
    });
  }

  const groups = [...grouped.entries()]
    .map(([title, stories]) => ({
      title,
      stories: stories.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const html = renderPage({
    groups,
    themes,
    meta: {
      commit: process.env.GITHUB_SHA ?? '',
      branch: process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || '',
      // Sourced from CI rather than `new Date()` so reruns of the same commit
      // produce an identical sheet.
      generated: process.env.WALKTHROUGH_TIMESTAMP ?? '',
    },
  });

  await writeFile(path.join(WALKTHROUGH_DIR, 'index.html'), html, 'utf8');

  const missing = groups.flatMap((g) =>
    g.stories.filter((s) => s.themes.length !== themes.length).map((s) => s.id),
  );

  console.log(
    `Walkthrough: ${shots.size} stories × ${themes.length} themes -> walkthrough/index.html`,
  );
  if (missing.length > 0) {
    console.warn(`Incomplete captures for: ${missing.join(', ')}`);
  }
}

await main();

// Reported for convenience when inspecting the artifact locally.
await stat(path.join(WALKTHROUGH_DIR, 'index.html')).then((s) =>
  console.log(`Contact sheet: ${(s.size / 1024).toFixed(1)} KB`),
);
