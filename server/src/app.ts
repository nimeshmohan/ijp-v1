import express, { type Express } from "express";
import morgan from "morgan";
import { env } from "./config/env";
import {
  apiRateLimiter,
  corsMiddleware,
  helmetMiddleware,
} from "./middleware/security";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import { healthRouter } from "./routes/health";
import { jobsRouter } from "./routes/jobs";
import { usersRouter } from "./routes/users";
import { activityLogsRouter } from "./routes/activityLogs";
import { dashboardRouter } from "./routes/dashboard";
import { meRouter } from "./routes/me";

export function createApp(): Express {
  const app = express();

  // Render (and most PaaS hosts) sit behind a reverse proxy; trusting it is
  // required for req.ip / X-Forwarded-For to be correct in the rate limiter.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.isProduction ? "combined" : "dev"));

  // Health check is registered before the rate limiter so uptime monitors
  // and Render's own health probe are never throttled.
  app.use("/api/health", healthRouter);

  app.use("/api", apiRateLimiter);

  app.use("/api/me", meRouter);
  app.use("/api/jobs", jobsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/activity-logs", activityLogsRouter);
  app.use("/api/dashboard", dashboardRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
