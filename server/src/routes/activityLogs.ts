import { Router } from "express";
import { z } from "zod";
import { requireRole, verifyAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { activityLogService } from "../services/activityLogService";

export const activityLogsRouter = Router();

// Viewing the audit trail is an admin-only capability.
activityLogsRouter.use(verifyAuth, requireRole("admin"));

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

activityLogsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = listQuerySchema.parse(req.query);
    const result = await activityLogService.list(query);
    res.json(result);
  }),
);
