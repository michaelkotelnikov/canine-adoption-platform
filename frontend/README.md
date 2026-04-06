This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Standalone preview (no API)

Browse dog cards with **mock data** only (no FastAPI/Postgres):

```bash
npm run dev:standalone
```

Or from the monorepo root: `make up-frontend-standalone` (Docker). See the root [README](../README.md#standalone-frontend-no-backend).

## Against the real API (monorepo)

With Postgres + FastAPI running (e.g. `make up` from the repo root), set `NEXT_PUBLIC_API_URL=http://localhost:8000` in the environment or in `.env.local`, then `npm run dev`. If the Docker frontend is still bound to port 3000, stop that service or use `PORT=3001 npm run dev`. Full steps: [Local frontend development](../README.md#local-frontend-development-host-npm-run-dev) in the root README.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
