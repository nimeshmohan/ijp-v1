import { Router } from "express";
import { requireRole, verifyAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { activityLogService } from "../services/activityLogService";
import { webflowService } from "../services/webflowService";

export const dashboardRouter = Router();

dashboardRouter.use(verifyAuth, requireRole("admin", "hr"));

dashboardRouter.get(
  "/summary",
  asyncHandler(async (_req, res) => {
    const [stats, recentActivity] = await Promise.all([
      webflowService.getJobStats(),
      activityLogService.listRecent(5),
    ]);

    res.json({
      totalJobs: stats.total,
      publishedJobs: stats.published,
      draftJobs: stats.draft,
      recentActivity,
    });
  }),
);
