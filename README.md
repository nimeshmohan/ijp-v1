# IJP HR CMS Manager

An internal HR dashboard that lets the HR team manage **one** Webflow CMS
collection (Job Postings) without ever touching the Webflow Designer or
Editor. Webflow remains the single source of truth for job content;
Firebase/Firestore is used only for authentication, user accounts, and an
activity audit log.

## Features

- Email/password login with Remember Me, session persistence, and
  self-service Forgot Password (Firebase Auth)
- Role-based access: **Admin** manages users and views the audit log; **HR**
  manages jobs. Both roles share full job CRUD.
- Jobs table with search, sortable columns, and pagination
- Create/Edit Job form with a rich text editor for "About the Role", a live
  slug preview, and Save Draft / Publish / Cancel actions
- Every create/update/delete/publish and every user-management action is
  recorded to an audit log with before/after data
- Dashboard with job counts and recent activity
- Dark/light mode, responsive layout (desktop sidebar, mobile drawer),
  skeleton loading states, toast notifications, confirmation dialogs

## Architecture

```
Browser (React SPA)
   │  Firebase ID token (Authorization: Bearer <token>)
   ▼
Express API (server/)
   │  verifies ID token, checks role (admin | hr)
   │  validates request body against shared Zod schemas
   ▼
Webflow Data API (Collection 6a533add938a981683bbfe8b only)

Firestore is used only for: users, activityLogs.
No job content is ever written to Firestore.
```

## Tech stack

**Frontend** — React, Vite, TypeScript, Tailwind CSS, shadcn/ui (Radix),
React Hook Form, TanStack Query, Zod, React Router, Tiptap (rich text)

**Backend** — Node.js, Express, Firebase Admin SDK, Webflow Data API v2

**Auth & data** — Firebase Authentication, Firestore (users + activity logs
only)

**Hosting** — Render (two services: Node web service + static site)

## Monorepo layout

```
IJP/
  client/    React + Vite + TypeScript dashboard (Tailwind, shadcn/ui)
  server/    Express + TypeScript API (Firebase Admin, Webflow Data API)
  shared/    Zod schemas & TypeScript types used by both client and server
  docs/      Architecture, deployment, and setup documentation
  scripts/   Pointer to server/src/scripts (see below)
```

Validation rules for the Job form (title, location, vacancies, about the
role) live in [`shared/src/types/job.ts`](shared/src/types/job.ts) and are
imported by both the React form and the Express route — the two can never
drift out of sync.

## Security

- Firebase ID tokens verified server-side on every request; disabled users
  are rejected even mid-session
- Role checks enforced on the backend, not just hidden in the UI
- Helmet, CORS locked to a single configured origin, and rate limiting on
  all `/api` routes (with a stricter limit on user-creation/password-reset)
- All input validated with Zod on both client and server; rich text is
  sanitized (allowlisted tags only) before it ever reaches Webflow
- No secrets or service account files are ever committed — everything comes
  from environment variables, validated at startup

## Prerequisites

- Node.js 18+
- npm 9+
- A Firebase project with Email/Password auth enabled and a service account
- A Webflow site with API access to collection `6a533add938a981683bbfe8b`

## Getting started (development)

```bash
npm install
cp server/.env.example server/.env   # fill in Webflow + Firebase Admin values
cp client/.env.example client/.env   # already has the Firebase client config
npm run dev
```

`npm run dev` runs `shared` in watch mode, the API on `:4000`, and the
Vite dev server on `:5173` concurrently.

Once you have real Firebase Admin credentials in `server/.env`, create your
first admin account:

```bash
npm run create-admin -w server -- you@example.com "a-strong-temporary-password" "Your Name"
```

## Scripts

| Command                | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Run shared/server/client together in watch mode       |
| `npm run build`        | Build shared, then server, then client for production |
| `npm start`            | Start the built server (production)                   |
| `npm run lint`         | Lint server and client                                |
| `npm run format`       | Format the repo with Prettier                         |
| `npm run format:check` | Check formatting without writing changes              |

## Deployment

This repo ships with a [`render.yaml`](render.yaml) Blueprint that deploys
two Render services: `ijp-cms-server` (Node web service) and
`ijp-cms-client` (static site). See:

- [`docs/deployment.md`](docs/deployment.md) — full step-by-step deployment guide
- [`docs/environment-variables.md`](docs/environment-variables.md) — every env var, what it's for, and where to get it
- [`docs/webflow-setup.md`](docs/webflow-setup.md) — Webflow collection field slugs and how publishing works
