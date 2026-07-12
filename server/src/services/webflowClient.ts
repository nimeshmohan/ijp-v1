import { env } from "../config/env";
import { AppError } from "../utils/AppError";

const BASE_URL = "https://api.webflow.com/v2";

type QueryValue = string | number | boolean | undefined;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, QueryValue>;
  body?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function request<T>({
  method = "GET",
  path,
  query,
  body,
}: RequestOptions): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${env.webflow.apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AppError(
      "Could not reach the Webflow API. Please try again.",
      502,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.message === "string"
        ? data.message
        : `Webflow API request failed with status ${response.status}.`;
    throw new AppError(
      message,
      response.status >= 500 ? 502 : response.status,
      data,
    );
  }

  return data as T;
}

/** Thin, typed wrapper around the Webflow Data API v2 (https://api.webflow.com/v2). */
export const webflowClient = {
  get: <T>(path: string, query?: Record<string, QueryValue>) =>
    request<T>({ method: "GET", path, query }),
  post: <T>(path: string, body?: unknown) =>
    request<T>({ method: "POST", path, body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>({ method: "PATCH", path, body }),
  del: <T>(path: string) => request<T>({ method: "DELETE", path }),
};
