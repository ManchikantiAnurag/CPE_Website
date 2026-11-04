# CPE Website

Astro website with Sveltia CMS, deployed to AWS Amplify Hosting using
`astro-aws-amplify`. Pages and `/api/form` run on Node.js 22; assets are served
from Amplify's static hosting.

## Development

Use Node.js 22.12 or newer and pnpm 12.8.1:

```sh
pnpm install --frozen-lockfile
pnpm dev --background
pnpm astro dev status
pnpm astro dev logs
pnpm astro dev stop
```

## Deploy to AWS Amplify

1. Connect this repository and your deployment branch in Amplify Hosting.
2. Use the Amazon Linux 2023 build image and enable SSR hosting
   (`WEB_COMPUTE` if configuring the app through the AWS CLI).
3. Use the checked-in `amplify.yml`. It selects Node.js 22, installs from the
   pnpm lockfile, builds, and copies dependencies into the compute bundle.
   pnpm's relative symlinks remain within the copied `node_modules` tree.
4. Remove any default SPA rewrite to `/index.html`; Astro handles page routing.
5. Deploy. The artifact directory is `.amplify-hosting`, not `dist`.

`customHttp.yml` configures cache headers for built assets and OG images.
Set the optional build variable `SITE_URL` to override `https://cpecollege.com`
for canonical URLs and social metadata.
The SSR host allowlist accepts that domain, Amplify's `*.amplifyapp.com`
deployment URLs, and `http://localhost:3000` for local checks.

The CMS is available at `/admin` (redirecting to `/admin/index.html`). Its GitHub
backend remains configured in `public/admin/config.yml`; publishing commits to
`main` triggers Amplify rebuilds when `main` is connected. For an independent
deployment branch, set the CMS backend branch to that same branch before
publishing content there.

The contact and admissions endpoint currently **only logs submissions**. This
migration preserves that behavior; email delivery and database storage are not
configured. No environment variables are currently required.

## Verify locally

```sh
pnpm build
node .amplify-hosting/compute/default/entry.mjs
```

In another terminal, run `pnpm test:deployment`. The production server listens
on port 3000. Stop it with Ctrl+C after checking. The Amplify adapter does not
support `astro preview`.

Run `node scripts/check-seo.mjs` against that server to check the sitemap,
canonical URLs, headings, structured data, and social images. `SEO_TEST_URL`
overrides the test server URL. If Amplify has a `SITE_URL` override, set it to
`https://cpecollege.com` for production.

References: [Astro on AWS](https://docs.astro.build/en/guides/deploy/aws/),
[Amplify deployment specification](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-deployment-specification.html).
