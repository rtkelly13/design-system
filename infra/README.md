# infra — Pulumi (Vercel)

Infrastructure-as-code for hosting this repo's Storybook, using the
[`@pulumiverse/vercel`](https://www.pulumi.com/registry/packages/vercel/) provider.
It is **isolated** from the package (its own `package.json`/`tsconfig.json`) and is
optional — nothing in `src/` imports from it, and the Storybook builds fine without it.

It declares:

| Resource | What it is |
| --- | --- |
| `vercel.Project` `storybook` | Builds the static Storybook from this repo |
| `vercel.ProjectDomain` `storybook-production` | `design-system.ryankelly.dev` → `main` |
| `vercel.ProjectDomain` `storybook-preview` | `preview.design-system.ryankelly.dev` → the `preview` branch |
| `vercel.Project` `blog-storybook` | Builds the blog's Storybook, composed into the sidebar (opt-out) |

## Build settings live in `vercel.json`, not here

Vercel reads `vercel.json` from the repo at build time and it **takes precedence over
project settings**. Declaring `buildCommand` / `outputDirectory` / `framework` in both
places would leave two sources of truth with a silent winner, so this program declares
neither — only the things `vercel.json` cannot express (identity, domains, env vars).

`vercel.json` sets `"cleanUrls": false` deliberately. Clean URLs rewrite `/iframe.html`
to `/iframe`, which breaks Storybook's asset preloading and yields an empty preview
pane — the same trap `serve.json` documents for the Playwright suites (see AGENTS.md,
"`serve.json` is load-bearing"). Storybook is one of the few static sites where clean
URLs are actively wrong.

## Prerequisites

- [Pulumi CLI](https://www.pulumi.com/docs/install/). State can live on the free
  Pulumi Cloud individual tier, or locally with `pulumi login --local`.
- A Vercel API token: <https://vercel.com/account/tokens>.
- `ryankelly.dev` already added to the Vercel account that owns the token. Subdomains
  of a domain Vercel already controls need no DNS work; if the apex is hosted
  elsewhere, add the CNAME Vercel shows for each subdomain after `pulumi up`.

## Usage

```bash
cd infra
pnpm install

pulumi stack init prod           # first time only

# Auth + inputs
export VERCEL_API_TOKEN=…        # or: pulumi config set vercel:apiToken … --secret
pulumi config set projectName design-system-storybook
pulumi config set blogStorybookUrl https://blog-storybook.vercel.app

pulumi preview                   # review
pulumi up                        # apply
```

### Configuration

| Key | Default | Notes |
| --- | --- | --- |
| `teamId` | *(unset)* | Required only on a Vercel team account |
| `projectName` | `design-system-storybook` | |
| `gitRepository` | `rtkelly13/design-system` | |
| `productionBranch` | `main` | |
| `productionDomain` | `design-system.ryankelly.dev` | |
| `previewDomain` | `preview.design-system.ryankelly.dev` | |
| `previewBranch` | `preview` | Must exist and have deployed once before the domain resolves |
| `manageBlogStorybook` | `true` | Set false to scope this stack to the design system alone |
| `blogStorybookProjectName` | `blog-storybook` | |
| `blogGitRepository` | `rtkelly13/blog` | |
| `blogStorybookUrl` | *(unset)* | Sets `STORYBOOK_REF_BLOG_URL`; unset composes nothing |

## The two domains

`design-system.ryankelly.dev` is the production domain and follows `main`.

`preview.design-system.ryankelly.dev` is a **branch domain**: `gitBranch: 'preview'` is
what distinguishes it from a second production alias. Push to `preview` and that URL
serves the branch's newest deployment. It maps to exactly one branch by design — a
single custom domain cannot follow "whichever PR deployed last"; individual PRs still
get their own generated `*.vercel.app` URLs.

Create the branch and deploy it once, or the domain has nothing to resolve to:

```bash
git switch -c preview main && git push -u origin preview
```

## Manual step Pulumi cannot cover

The `blog-storybook` project needs **"Include source files outside of the Root
Directory in the Build Step"** enabled (Vercel dashboard → project → Settings →
Build & Deployment). Its root directory is `storybook-site/`, but the Storybook build
needs the whole blog repo. The Vercel provider does not expose that toggle, so it
cannot be declared here.

## Removing IaC

This whole directory is self-contained. To drop Pulumi, `pulumi stack rm` and delete
`infra/` — nothing in the package imports from it.
