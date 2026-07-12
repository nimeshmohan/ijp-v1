import { Router } from "express";
import { verifyAuth } from "../middleware/auth";

export const meRouter = Router();

meRouter.use(verifyAuth);

/** Returns the logged-in user's own profile — any authenticated role, not just admin. */
meRouter.get("/", (req, res) => {
  res.json(req.user);
});
