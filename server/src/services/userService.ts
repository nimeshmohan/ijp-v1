import type { AppUser, CreateUserInput } from "@ijp/shared";
import { firebaseAuth, firestore } from "../config/firebaseAdmin";
import { AppError } from "../utils/AppError";

const COLLECTION = "users";

function isFirebaseAuthError(err: unknown): err is { code: string } {
  return typeof err === "object" && err !== null && "code" in err;
}

export const userService = {
  async listUsers(): Promise<AppUser[]> {
    const snapshot = await firestore
      .collection(COLLECTION)
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => ({
      ...(doc.data() as Omit<AppUser, "uid">),
      uid: doc.id,
    }));
  },

  async createUser(
    input: CreateUserInput,
    createdBy: string,
  ): Promise<AppUser> {
    let userRecord;
    try {
      userRecord = await firebaseAuth.createUser({
        email: input.email,
        password: input.password,
        displayName: input.displayName,
      });
    } catch (err) {
      if (
        isFirebaseAuthError(err) &&
        err.code === "auth/email-already-exists"
      ) {
        throw new AppError("A user with this email already exists.", 409);
      }
      throw new AppError("Could not create the user account.", 502);
    }

    const appUser: AppUser = {
      uid: userRecord.uid,
      email: input.email,
      displayName: input.displayName,
      role: input.role,
      disabled: false,
      createdAt: new Date().toISOString(),
      createdBy,
    };

    const { uid, ...profile } = appUser;
    await firestore.collection(COLLECTION).doc(uid).set(profile);

    return appUser;
  },

  async setDisabled(uid: string, disabled: boolean): Promise<AppUser> {
    const docRef = firestore.collection(COLLECTION).doc(uid);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new AppError("User not found.", 404);
    }

    await Promise.all([
      firebaseAuth.updateUser(uid, { disabled }),
      docRef.update({ disabled }),
    ]);

    return { ...(doc.data() as Omit<AppUser, "uid">), uid, disabled };
  },

  async deleteUser(uid: string): Promise<void> {
    try {
      await firebaseAuth.deleteUser(uid);
    } catch (err) {
      if (!isFirebaseAuthError(err) || err.code !== "auth/user-not-found") {
        throw new AppError("Could not delete the user account.", 502);
      }
    }
    await firestore.collection(COLLECTION).doc(uid).delete();
  },

  /**
   * Generates a Firebase password reset link for an admin to hand off to
   * the user (copy/paste, Slack, email — whichever channel the org uses).
   * The Admin SDK only generates the link; it does not send email itself.
   */
  async generatePasswordResetLink(email: string): Promise<string> {
    try {
      return await firebaseAuth.generatePasswordResetLink(email);
    } catch {
      throw new AppError(
        "Could not generate a password reset link for this email.",
        502,
      );
    }
  },
};
