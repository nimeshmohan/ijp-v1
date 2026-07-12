# Deployment Guide (Render)

This app deploys as two Render services from a single `render.yaml` Blueprint:

- **`ijp-cms-server`** — the Express API (Node web service)
- **`ijp-cms-client`** — the React dashboard (static site)

Follow these steps in order — the two services need each other's URLs, so there's a
"deploy once, fill in URLs, redeploy" step you can't skip.

## Prerequisites

- Code pushed to a GitHub repository
- A [Render](https://render.com) account
- The Firebase project already created (`ijp-project-b2e50`), with **Email/Password**
  sign-in enabled under Authentication → Sign-in method
- A Firebase **service account** for the Admin SDK: Firebase Console → Project
  Settings → Service Accounts → Generate new private key. This downloads a JSON
  file containing `project_id`, `client_email`, and `private_key` — you'll need
  these three values, not the file itself.
- A Webflow **API token** scoped to `CMS:read` and `CMS:write` on the site that owns
  collection `6a533add938a981683bbfe8b`, and that site's Webflow **Site ID**

## 1. Create the Blueprint

In the Render dashboard: **New +** → **Blueprint** → connect your GitHub repo.
Render detects `render.yaml` automatically and shows both services.

## 2. Fill in the secret environment variables

Render will prompt for every `sync: false` variable during Blueprint creation.
Have these ready:

**`ijp-cms-server`**

| Variable                | Value                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| `CLIENT_ORIGIN`         | Leave a placeholder for now (e.g. `https://placeholder.onrender.com`) — you'll fix this in step 4  |
| `WEBFLOW_API_TOKEN`     | Your Webflow API token                                                                             |
| `WEBFLOW_SITE_ID`       | Your Webflow site ID                                                                               |
| `FIREBASE_PROJECT_ID`   | `project_id` from the service account JSON                                                         |
| `FIREBASE_CLIENT_EMAIL` | `client_email` from the service account JSON                                                       |
| `FIREBASE_PRIVATE_KEY`  | `private_key` from the service account JSON, including the `-----BEGIN/END PRIVATE KEY-----` lines |

`WEBFLOW_COLLECTION_ID` and `JWT_SECRET` are already handled by `render.yaml`
(a fixed value and an auto-generated secret, respectively) — you won't be
prompted for these.

**`ijp-cms-client`**

| Variable                            | Value                                                   |
| ----------------------------------- | ------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | `AIzaSyBRI8u9NzNv12RbEzIT-5-6ONHJN4ZVG3c`               |
| `VITE_FIREBASE_AUTH_DOMAIN`         | `ijp-project-b2e50.firebaseapp.com`                     |
| `VITE_FIREBASE_PROJECT_ID`          | `ijp-project-b2e50`                                     |
| `VITE_FIREBASE_STORAGE_BUCKET`      | `ijp-project-b2e50.firebasestorage.app`                 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `74633410710`                                           |
| `VITE_FIREBASE_APP_ID`              | `1:74633410710:web:56ddc1783cd2ae2ba6eab7`              |
| `VITE_API_BASE_URL`                 | Leave a placeholder for now — you'll fix this in step 4 |

These Firebase client values are safe to expose (they're not secrets), but
they're still marked `sync: false` in the Blueprint so they aren't hardcoded
into version control.

## 3. Wait for the first deploy

Render builds and deploys both services. This first deploy will be partially
broken — the server's CORS is pointed at a placeholder, and the client is
pointed at a placeholder API — but it gets you real URLs. Note both:

- `https://ijp-cms-server-xxxx.onrender.com`
- `https://ijp-cms-client-xxxx.onrender.com`

## 4. Fix the cross-service URLs and redeploy

Back in the Render dashboard:

1. Open `ijp-cms-server` → Environment → set `CLIENT_ORIGIN` to the real client
   URL from step 3.
2. Open `ijp-cms-client` → Environment → set `VITE_API_BASE_URL` to the real
   server URL from step 3.
3. Manually redeploy both services (Environment changes trigger this
   automatically on Render, but confirm both show a fresh deploy).

## 5. Bootstrap your first admin account

The create-admin script talks directly to Firebase (Auth + Firestore), not to
the Render-hosted server, so it's run from your own machine against the same
production Firebase project — it doesn't matter that the server itself is
hosted elsewhere:

```bash
# server/.env must have the SAME Firebase Admin credentials you gave Render
npm run create-admin -w server -- you@example.com "a-strong-temporary-password" "Your Name"
```

## 6. Verify

Visit the client URL, sign in with the admin account you just created, and
confirm the dashboard loads. Then check `https://<server-url>/api/health`
returns `{"status":"ok"}`.

## Troubleshooting

| Symptom                                                   | Likely cause                                                                                                                                         |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login succeeds but the app immediately signs you back out | `CLIENT_ORIGIN` on the server doesn't match the client's real URL exactly (CORS rejects the request to `/api/me`)                                    |
| Every API call fails with a network error                 | `VITE_API_BASE_URL` on the client is wrong, or the server service is still deploying/crashed — check its logs                                        |
| 401 on every request even with a valid session            | Firebase Admin credentials on the server are wrong — `FIREBASE_PRIVATE_KEY` is the usual culprit (must include the full `-----BEGIN/END-----` block) |
| Webflow calls fail with 401/403                           | `WEBFLOW_API_TOKEN` is missing the `CMS:write` scope, or is scoped to the wrong site                                                                 |
| Creating/editing a job fails with a Webflow field error   | Your collection's custom field slugs don't match the defaults — see [`webflow-setup.md`](webflow-setup.md)                                           |
