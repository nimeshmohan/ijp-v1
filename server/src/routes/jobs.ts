import { Router } from "express";
import { z } from "zod";
import { createJobSchema, updateJobSchema } from "@ijp/shared";
import { requireRole, verifyAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { activityLogService } from "../services/activityLogService";
import { webflowService } from "../services/webflowService";

export const jobsRouter = Router();

// Both roles can fully manage jobs — only user management is admin-only.
jobsRouter.use(verifyAuth, requireRole("admin", "hr"));

const idParamSchema = z.object({ id: z.string().min(1) });

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  sortBy: z
    .enum(["title", "location", "vacancies", "lastUpdated", "createdOn"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

jobsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = listQuerySchema.parse(req.query);
    const result = await webflowService.listJobs(query);
    res.json(result);
  }),
);

jobsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const job = await webflowService.getJob(id);
    res.json(job);
  }),
);

jobsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createJobSchema.parse(req.body);
    const job = await webflowService.createJob(input);

    await activityLogService.record({
      userId: req.user!.uid,
      userEmail: req.user!.email,
      action: "CREATE_JOB",
      cmsItemId: job.id,
      previousData: null,
      newData: { ...job },
    });

    res.status(201).json(job);
  }),
);

jobsRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateJobSchema.parse(req.body);
    const previous = await webflowService.getJob(id);
    const job = await webflowService.updateJob(id, input);

    await activityLogService.record({
      userId: req.user!.uid,
      userEmail: req.user!.email,
      action: "UPDATE_JOB",
      cmsItemId: job.id,
      previousData: { ...previous },
      newData: { ...job },
    });

    res.json(job);
  }),
);

jobsRouter.post(
  "/:id/publish",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const previous = await webflowService.getJob(id);
    const job = await webflowService.publishJob(id);

    await activityLogService.record({
      userId: req.user!.uid,
      userEmail: req.user!.email,
      action: "PUBLISH_JOB",
      cmsItemId: job.id,
      previousData: { ...previous },
      newData: { ...job },
    });

    res.json(job);
  }),
);

jobsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const previous = await webflowService.getJob(id);
    await webflowService.deleteJob(id);

    await activityLogService.record({
      userId: req.user!.uid,
      userEmail: req.user!.email,
      action: "DELETE_JOB",
      cmsItemId: id,
      previousData: { ...previous },
      newData: null,
    });

    res.status(204).send();
  }),
);
