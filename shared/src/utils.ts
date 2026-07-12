/**
 * Strips HTML tags to test whether rich text content has any real
 * text/content in it. A rich text editor can produce markup like
 * "<p><br></p>" which is visually empty but not an empty string.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Converts a job title into a URL-safe slug. Used for the live slug
 * preview on the frontend; the backend re-runs this same function
 * and is the final authority on uniqueness against Webflow.
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
