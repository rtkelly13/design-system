import * as pulumi from '@pulumi/pulumi';
import * as vercel from '@pulumiverse/vercel';

/**
 * Pulumi program managing the Vercel hosting for this repo's Storybook.
 *
 * It declares three things:
 *
 *   1. A Vercel project that builds the static Storybook from this repo.
 *   2. `design-system.ryankelly.dev` — the production domain, following `main`.
 *   3. `preview.design-system.ryankelly.dev` — a *branch domain* pinned to the
 *      long-lived `preview` branch, giving unreleased work a stable, shareable
 *      URL. Per-PR deployments still get their own generated `*.vercel.app`
 *      URLs; a branch domain maps to exactly one branch, so it cannot follow
 *      "whichever PR deployed last".
 *
 * Optionally it also declares a second project that builds the *blog's*
 * Storybook, which this repo's Storybook composes into its sidebar. See
 * `manageBlogStorybook` below.
 *
 * Build settings deliberately live in `vercel.json`, not here. Vercel reads
 * `vercel.json` from the repo at build time and it takes precedence over
 * project settings, so declaring `buildCommand`/`outputDirectory` in both
 * places would leave two sources of truth with a silent winner.
 *
 * Auth: `pulumi config set vercel:apiToken <tok> --secret`, or `VERCEL_API_TOKEN`.
 */
const config = new pulumi.Config();

/** Vercel team (personal accounts can leave this unset). */
const teamId = config.get('teamId');

const projectName = config.get('projectName') ?? 'design-system-storybook';
const gitRepo = config.get('gitRepository') ?? 'rtkelly13/design-system';
const productionBranch = config.get('productionBranch') ?? 'main';

const productionDomain = config.get('productionDomain') ?? 'design-system.ryankelly.dev';
const previewDomain = config.get('previewDomain') ?? 'preview.design-system.ryankelly.dev';

/**
 * The branch the preview domain follows. It must exist and have been deployed
 * at least once before the domain resolves — Vercel points a branch domain at
 * that branch's most recent deployment, and there is nothing to point at until
 * the first push.
 */
const previewBranch = config.get('previewBranch') ?? 'preview';

const project = new vercel.Project('storybook', {
  name: projectName,
  teamId,
  // Left unset on purpose: `vercel.json` declares `"framework": null` (a plain
  // static output) and that takes precedence anyway.
  framework: undefined,
  nodeVersion: '22.x',
  gitRepository: {
    type: 'github',
    repo: gitRepo,
    productionBranch,
  },
});

const productionProjectDomain = new vercel.ProjectDomain('storybook-production', {
  projectId: project.id,
  teamId,
  domain: productionDomain,
});

const previewProjectDomain = new vercel.ProjectDomain('storybook-preview', {
  projectId: project.id,
  teamId,
  domain: previewDomain,
  // Presence of `gitBranch` is what makes this a branch domain rather than a
  // second production alias. Without it both domains would serve `main`.
  gitBranch: previewBranch,
});

/* -------------------------------------------------------------------------
 * Composed blog Storybook
 * ---------------------------------------------------------------------- */

/**
 * The blog's Storybook is a separate static site that this one composes via
 * `refs` in `.storybook/main.ts`. Composition needs a URL, so it needs its own
 * deployment; Storybook cannot bundle another repo's stories at build time.
 *
 * Set `manageBlogStorybook` to false to keep this stack scoped to the design
 * system alone and point the ref at something you host elsewhere.
 */
const manageBlogStorybook = config.getBoolean('manageBlogStorybook') ?? true;

const blogStorybookProjectName = config.get('blogStorybookProjectName') ?? 'blog-storybook';
const blogGitRepo = config.get('blogGitRepository') ?? 'rtkelly13/blog';

let blogStorybookProject: vercel.Project | undefined;
if (manageBlogStorybook) {
  blogStorybookProject = new vercel.Project('blog-storybook', {
    name: blogStorybookProjectName,
    teamId,
    framework: undefined,
    nodeVersion: '22.x',
    gitRepository: {
      type: 'github',
      repo: blogGitRepo,
      productionBranch: 'main',
    },
    // The blog repo's root `vercel.json` configures the Next.js site. Pointing
    // this project at `storybook-site/` makes Vercel read that directory's
    // `vercel.json` instead, so one repo can back two projects with different
    // builds.
    //
    // MANUAL STEP: this project also needs "Include source files outside of
    // the Root Directory in the Build Step" enabled in the Vercel dashboard —
    // the Storybook build needs the whole repo, not just `storybook-site/`.
    // The Vercel provider does not expose that toggle, so Pulumi cannot set it.
    rootDirectory: 'storybook-site',
  });
}

/**
 * The composition ref URL, injected at Storybook *build* time (the manager
 * bundle bakes `refs` in). Both Vercel environments get a value so the preview
 * domain composes a blog Storybook too rather than silently dropping the ref.
 */
const blogStorybookUrl = config.get('blogStorybookUrl');

if (blogStorybookUrl) {
  new vercel.ProjectEnvironmentVariable('storybook-ref-blog', {
    projectId: project.id,
    teamId,
    key: 'STORYBOOK_REF_BLOG_URL',
    value: blogStorybookUrl,
    targets: ['production', 'preview', 'development'],
  });
}

export const vercelProjectId = project.id;
export const storybookProductionUrl = productionProjectDomain.domain.apply((d) => `https://${d}`);
export const storybookPreviewUrl = previewProjectDomain.domain.apply((d) => `https://${d}`);
export const storybookPreviewBranch = previewBranch;
export const blogStorybookProjectId = blogStorybookProject?.id;
