import type { AppUser } from "@ijp/shared";

declare global {
  namespace Express {
    interface Request {
      /** Populated by the `verifyAuth` middleware after the ID token is verified. */
      user?: AppUser;
    }
  }
}

export {};
