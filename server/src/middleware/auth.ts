import type { RequestHandler } from "express";
import type { AppUser, UserRole } from "@ijp/shared";
import { firebaseAuth, firestore } from "../config/firebaseAdmin";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * Verifies the Firebase ID token sent as `Authorization: Bearer <token>`,
 * loads the matching profile from Firestore's `users` collection, and
 * rejects disabled accounts. On success, `req.user` is populated for
 * downstream route handlers and `requireRole`.
 */
export const verifyAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Missing or invalid Authorization header.", 401);
  }

  const idToken = header.slice("Bearer ".length).trim();
  if (!idToken) {
    throw new AppError("Missing or invalid Authorization header.", 401);
  }

  let decoded;
  try {
    decoded = await firebaseAuth.verifyIdToken(idToken, true);
  } catch {
    throw new AppError("Invalid or expired session. Please log in again.", 401);
  }

  const userDoc = await firestore.collection("users").doc(decoded.uid).get();
  if (!userDoc.exists) {
    throw new AppError("No account found for this user.", 403);
  }

  const userData = userDoc.data() as Omit<AppUser, "uid">;
  if (userData.disabled) {
    throw new AppError(
      "This account has been disabled. Contact an administrator.",
      403,
    );
  }

  req.user = { ...userData, uid: decoded.uid };
  next();
});

/** Restricts a route to one or more roles. Must run after `verifyAuth`. */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError("Authentication required.", 401));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(
        new AppError("You do not have permission to perform this action.", 403),
      );
      return;
    }
    next();
  };
}
