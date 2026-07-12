# Environment Variables Reference

Each workspace loads its own `.env` file — there is no shared root `.env`.
Copy the matching `.env.example` in each workspace and fill in real values.

## `server/.env`

| Variable                | Required                                    | Description                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WEBFLOW_API_TOKEN`     | Yes                                         | Webflow API token scoped to `CMS:read` + `CMS:write` on the site owning the collection below. Get it from Webflow → Site Settings → Apps & Integrations → API access, or a Workspace-level API token.   |
| `WEBFLOW_SITE_ID`       | Yes                                         | The Webflow site ID that owns the collection. Found in Site Settings → General, or via `GET /v2/sites` with your token.                                                                                 |
| `WEBFLOW_COLLECTION_ID` | No (defaults to `6a533add938a981683bbfe8b`) | The single collection this app is allowed to touch. Only override this if you're pointing the app at a different collection entirely.                                                                   |
| `FIREBASE_PROJECT_ID`   | Yes                                         | `project_id` from your Firebase service account JSON (Firebase Console → Project Settings → Service Accounts).                                                                                          |
| `FIREBASE_CLIENT_EMAIL` | Yes                                         | `client_email` from the same service account JSON.                                                                                                                                                      |
| `FIREBASE_PRIVATE_KEY`  | Yes                                         | `private_key` from the same service account JSON, including the `-----BEGIN/END PRIVATE KEY-----` lines. Keep the `\n` sequences literal in `.env` — the app converts them to real newlines at startup. |
| `JWT_SECRET`            | Yes (min 16 chars)                          | Reserved for future internal token-signing needs; not currently used by any route. Render auto-generates this in `render.yaml`.                                                                         |
| `PORT`                  | No (default `4000`)                         | Port the Express server listens on. Render sets this automatically in production.                                                                                                                       |
| `NODE_ENV`              | No (default `development`)                  | `production` on Render; controls error detail exposure and log format.                                                                                                                                  |
| `CLIENT_ORIGIN`         | Yes                                         | The deployed client's exact origin (e.g. `https://ijp-cms-client.onrender.com`), used for the CORS allowlist. Must match exactly — no trailing slash.                                                   |

## `client/.env`

| Variable                            | Required | Description                                                                                           |
| ----------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Yes      | Firebase client SDK config. Safe to expose in the browser bundle — not a secret.                      |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Yes      | Same.                                                                                                 |
| `VITE_FIREBASE_PROJECT_ID`          | Yes      | Same.                                                                                                 |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Yes      | Same.                                                                                                 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes      | Same.                                                                                                 |
| `VITE_FIREBASE_APP_ID`              | Yes      | Same.                                                                                                 |
| `VITE_API_BASE_URL`                 | Yes      | Base URL of the deployed backend API (e.g. `https://ijp-cms-server.onrender.com`). No trailing slash. |

Both the server and client validate their required env vars at startup and
fail immediately with a clear error if anything is missing — you won't hit a
cryptic runtime failure later.
