import type { Page } from '@playwright/test';

/**
 * Cut the screenshot suites off from remote font CDNs.
 *
 * `src/styles.css` imports its four families from `fonts.googleapis.com`, and
 * that `@import` survives into the built Storybook — verified: it is present in
 * both `iframe.html` and the compiled `iframe-*.css`. So every screenshot fires
 * a cross-origin request whose success is a property of the *runner*, not of
 * this repository.
 *
 * That makes the baselines' font metrics an accident of the network. A run that
 * reaches Google records webfont metrics; a run that does not records fallback
 * metrics; and the two are not close — unifying the fallback chains once
 * reflowed a blog post by 60px. Today the request appears to fail in CI, which
 * is why the committed baselines agree with a sandbox that also cannot reach it.
 * That is an inference from pixel agreement, not a guarantee, and the failure
 * mode when it changes is every baseline breaking at once for a reason nobody
 * will connect to a network.
 *
 * Aborting the request makes the fallback stack the *decision* rather than the
 * default-by-accident, and makes it hold whatever the runner can reach.
 *
 * Aborted rather than left to time out on purpose: `story-ready.ts` awaits
 * `document.fonts.ready`, which settles as soon as the request fails but would
 * otherwise wait on a dead socket.
 *
 * This pins the *test* environment only — consumers still get the webfonts.
 * Self-hosting them via `@fontsource`, which the blog already does, is the real
 * fix and would make this helper redundant while also removing a
 * render-blocking third-party request from every consumer's first paint. See
 * `docs/visual-regression.md`.
 */
const REMOTE_FONTS = /^https?:\/\/fonts\.(googleapis|gstatic)\.com\//;

export async function pinFonts(page: Page): Promise<void> {
  await page.route(REMOTE_FONTS, (route) => route.abort());
}
