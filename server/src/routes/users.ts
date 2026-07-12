import { Router } from "express";
import { z } from "zod";
import { createUserSchema } from "@ijp/shared";
import { requireRole, verifyAuth } from "../middleware/auth";
import { sensitiveActionRateLimiter } from "../middleware/security";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { activityLogService } from "../services/activityLogService";
import { userService } from "../services/userService";

export const usersRouter = Router();

// User management is strictly admin-only.
usersRouter.use(verifyAuth, requireRole("admin"));

const uidParamSchema = z.object({ uid: z.string().min(1) });

usersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await userService.listUsers();
    res.json({ items });
  }),
);

usersRouter.post(
  "/",
  sensitiveActionRateLimiter,
  asyncHandler(async (req, res) => {
    const input = createUserSchema.parse(req.body);
    const user = await userService.createUser(input, req.user!.uid);

    await activityLogService.record({
      userId: req.user!.uid,
      userEmail: req.user!.email,
      action: "CREATE_USER",
      cmsItemId: null,
      previousData: null,
      newData: { uid: user.uid, email: user.email, role: user.role },
    });

    res.status(201).json(user);
  }),
);

const setStatusSchema = z.object({ disabled: z.boolean() });

usersRouter.patch(
  "/:uid/status",
  asyncHandler(async (req, res) => {
    const { uid } = uidParamSchema.parse(req.params);
    const { disabled } = setStatusSchema.parse(req.body);

    if (disabled && req.user!.uid === uid) {
      throw new AppError("You cannot disable your own account.", 400);
    }

    const user = await userService.setDisabled(uid, disabled);

    await activityLogService.record({
      userId: req.user!.uid,
      userEmail: req.user!.email,
      action: disabled ? "DISABLE_USER" : "ENABLE_USER",
      cmsItemId: null,
      previousData: null,
      newData: { uid: user.uid, disabled: user.disabled },
    });

    res.json(user);
  }),
);

usersRouter.delete(
  "/:uid",
  asyncHandler(async (req, res) => {
    const { uid } = uidParamSchema.parse(req.params);

    if (req.user!.uid === uid) {
      throw new AppError("You cannot delete your own account.", 400);
    }

    await userService.deleteUser(uid);

    await activityLogService.record({
      userId: req.user!.uid,
      userEmail: req.user!.email,
      action: "DELETE_USER",
      cmsItemId: null,
      previousData: null,
      newData: { uid },
    });

    res.status(204).send();
  }),
);

const resetPasswordSchema = z.object({ email: z.string().trim().email() });

usersRouter.post(
  "/reset-password",
  sensitiveActionRateLimiter,
  asyncHandler(async (req, res) => {
    const { email } = resetPasswordSchema.parse(req.body);
    const resetLink = await userService.generatePasswordResetLink(email);

    await activityLogService.record({
      userId: req.user!.uid,
      userEmail: req.user!.email,
      action: "RESET_PASSWORD",
      cmsItemId: null,
      previousData: null,
      newData: { targetEmail: email },
    });

    res.json({ resetLink });
  }),
);
