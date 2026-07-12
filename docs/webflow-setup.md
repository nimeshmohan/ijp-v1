# Webflow CMS Setup

This app talks to exactly one Webflow CMS collection, identified by
`WEBFLOW_COLLECTION_ID=6a533add938a981683bbfe8b`. No other collection is
ever addressed by the backend.

## Required collection fields

| App field      | Webflow field type | Default assumed slug              |
| -------------- | ------------------ | --------------------------------- |
| Job Title      | Plain text         | `name` (Webflow's built-in field) |
| Slug           | Slug               | `slug` (Webflow's built-in field) |
| Location       | Plain text         | `location`                        |
| Vacancies      | Number             | `vacancies`                       |
| About the Role | Rich text          | `about-the-role`                  |

`name` and `slug` are built into every Webflow collection and cannot be
renamed. The other three are custom fields — Webflow generates their API
slug from the field's display name when you create it in the Designer.

## If your field slugs differ

Open your collection in the Webflow Designer, click each custom field, and
check the "Slug" shown in the field settings (or call
`GET /v2/collections/{collection_id}` with your API token and inspect
`fields[].slug` in the response).

If any slug differs from the table above, update the single source of
truth at [`server/src/config/webflowFields.ts`](../server/src/config/webflowFields.ts) — nothing else in the
codebase references raw Webflow field slugs.

## Required API token scopes

The Webflow API token used in `WEBFLOW_API_TOKEN` needs:

- `CMS:read`
- `CMS:write`

Scope the token to this site only.

## How publishing works

Webflow separates "saving" content from "publishing" it live:

1. Creating/updating an item with `isDraft: false` marks it as ready, but
   does **not** push it to the live site by itself.
2. A separate call to the `items/publish` endpoint is required to actually
   make it live. This app makes that second call automatically whenever
   you use the "Publish" action (as opposed to "Save Draft").
3. Setting `isDraft: true` (Save Draft) on an item that was previously
   published does **not** retroactively remove it from the live site —
   Webflow has no single-item "unpublish" endpoint. To fully remove
   already-live content, delete or archive the item.
