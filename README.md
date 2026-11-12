# CPE Website

Astro website with Sveltia CMS, deployed to Cloudflare Workers using
`@astrojs/cloudflare`. Pages are prerendered and served as static assets; only
`/api/form` and on-demand image transforms run in the Worker.

## Development

Use Node.js 22.12 or newer and pnpm 12.8.1:

```sh
pnpm install --frozen-lockfile
pnpm dev --background
pnpm astro dev status
pnpm astro dev logs
pnpm astro dev stop
```

## Deploy to Cloudflare Workers

`wrangler.jsonc` defines the `cpe-website` Worker. Either:

- **Workers Builds (Git-connected):** in the Cloudflare dashboard, connect this
  repository to the Worker with build command `pnpm build` and deploy command
  `npx wrangler deploy`. Pushes to the production branch deploy automatically.
- **Manual:** `pnpm deploy` (runs `wrangler login` first if needed).

Attach `cpecollege.com` to the Worker under **Settings → Domains & Routes**
(the zone's DNS is already on Cloudflare). Set the optional build variable
`SITE_URL` to override `https://cpecollege.com` for canonical URLs and social
metadata.

`public/_headers` sets cache headers for built assets and OG images. URLs have
no trailing slash: `/about` serves `about/index.html` and `/about/` redirects.

`robots.txt`, `sitemap.xml`, `llms.txt` and `agents.md` are static files in
`public/`. The sitemap is not generated, so update it (and `llms.txt`) by hand
when public pages, courses or news entries are added or removed.

### Images

Everything here stays within Cloudflare's free allowances:

- **Build time:** images on prerendered pages are resized to WebP during
  `pnpm build` and served from `/_astro/` as immutable static assets. This uses
  no Cloudflare Images transformations and does not invoke the Worker.
- **Edge:** images transformed on demand (`/_image`) use the Cloudflare Images
  binding (`IMAGES`). Each result is stored in the Workers cache with a
  one-year immutable header, so repeat requests are served from cache instead
  of being transformed again. The free plan includes 5,000 unique
  transformations a month. The Workers cache only applies on the custom domain,
  not on `*.workers.dev`.

The CMS keeps uploads in `src/assets/media` in the repository.

The CMS is available at `/admin`. Its GitHub backend is configured in
`public/admin/config.yml`; publishing commits to `main` triggers a rebuild when
Workers Builds is connected to `main`. For an independent deployment branch,
set the CMS backend branch to that same branch before publishing content there.

The contact and admissions endpoint currently **only logs submissions** (visible
in Workers Logs); email delivery and database storage are not configured. No
environment variables or secrets are required.

## Verify locally

```sh
pnpm build
pnpm preview --background
pnpm test:deployment
node scripts/check-seo.mjs
pnpm astro preview stop
```

`pnpm preview` runs the built Worker locally in workerd on port 4321.
`DEPLOY_TEST_URL` and `SEO_TEST_URL` override the test server URL. Run
`pnpm test:cms` to validate CMS configuration and content.

References: [Astro on Cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/),
[Workers static assets](https://developers.cloudflare.com/workers/static-assets/),
[Cloudflare Images binding](https://developers.cloudflare.com/images/transform-images/bindings/).
