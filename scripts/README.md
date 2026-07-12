# Scripts Index

Operational scripts live inside `server/src/scripts/` (not here) so they can
directly reuse the server's Firebase Admin config, env loading, and shared
types instead of duplicating that setup in a standalone top-level script.

- **`server/src/scripts/create-admin.ts`** — bootstrap the first admin user.

  ```bash
  npm run create-admin -w server -- <email> <password> "<display name>"
  ```

  Requires `server/.env` to be filled in with real Firebase Admin
  credentials first.
