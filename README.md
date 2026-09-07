# CPE Website

Astro website with Sveltia CMS, deployed to AWS Amplify Hosting using
`astro-aws-amplify`. Pages and `/api/form` run on Node.js 22; assets are served
from Amplify's static hosting.

## Development

Use Node.js 22.12 or newer and npm:

```sh
npm ci
npm run dev -- --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

## Deploy to AWS Amplify

1. Connect this repository and your deployment branch in Amplify Hosting.
2. Use the Amazon Linux 2023 build image and enable SSR hosting
   (`WEB_COMPUTE` if configuring the app through the AWS CLI).
3. Use the checked-in `amplify.yml`. It selects Node.js 22, installs from the
   lockfile, builds, and packages dependencies into the compute bundle.
4. Remove any default SPA rewrite to `/index.html`; Astro handles page routing.
5. Deploy. The artifact directory is `.amplify-hosting`, not `dist`.

The CMS is available at `/admin` (redirecting to `/admin/index.html`). Its GitHub
backend remains configured in `public/admin/config.yml`; publishing commits to
the connected branch triggers Amplify rebuilds.

The contact and admissions endpoint currently **only logs submissions**. This
migration preserves that behavior; email delivery and database storage are not
configured. No environment variables are currently required.

## Verify locally

```sh
npm run build
node .amplify-hosting/compute/default/entry.mjs
```

In another terminal, run `npm run test:deployment`. The production server listens
on port 3000. Stop it with Ctrl+C after checking. The Amplify adapter does not
support `astro preview`.

References: [Astro on AWS](https://docs.astro.build/en/guides/deploy/aws/),
[Amplify deployment specification](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-deployment-specification.html).
