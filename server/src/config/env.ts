import dotenv from "dotenv";
import { z } from "zod";
import { WEBFLOW_COLLECTION_ID } from "@ijp/shared";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().min(1, "CLIENT_ORIGIN is required"),
  WEBFLOW_API_TOKEN: z.string().min(1, "WEBFLOW_API_TOKEN is required"),
  WEBFLOW_SITE_ID: z.string().min(1, "WEBFLOW_SITE_ID is required"),
  // Fixed by product requirements, but still sourced from env rather than hardcoded inline.
  WEBFLOW_COLLECTION_ID: z.string().min(1).default(WEBFLOW_COLLECTION_ID),
  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID is required"),
  FIREBASE_CLIENT_EMAIL: z
    .string()
    .email("FIREBASE_CLIENT_EMAIL must be a valid email"),
  FIREBASE_PRIVATE_KEY: z.string().min(1, "FIREBASE_PRIVATE_KEY is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast and loud at boot rather than surfacing cryptic errors mid-request later.
  console.error(
    "Invalid or missing environment variables:\n" +
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
  );
  throw new Error(
    "Server cannot start: invalid environment configuration. Check server/.env against server/.env.example.",
  );
}

const data = parsed.data;

export const env = {
  nodeEnv: data.NODE_ENV,
  isProduction: data.NODE_ENV === "production",
  port: data.PORT,
  clientOrigin: data.CLIENT_ORIGIN,
  webflow: {
    apiToken: data.WEBFLOW_API_TOKEN,
    siteId: data.WEBFLOW_SITE_ID,
    collectionId: data.WEBFLOW_COLLECTION_ID,
  },
  firebase: {
    projectId: data.FIREBASE_PROJECT_ID,
    clientEmail: data.FIREBASE_CLIENT_EMAIL,
    // .env files store the PEM key with literal "\n" sequences; convert to real newlines.
    privateKey: data.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  jwtSecret: data.JWT_SECRET,
} as const;
