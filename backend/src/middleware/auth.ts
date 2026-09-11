import { Request, Response, NextFunction } from "express";
import { requireAuth, clerkClient } from "@clerk/express";
import User from "../models/User";

// Clerk ka middleware - token verify karta hai
export const protect = requireAuth();

// Verified Clerk user ko humare MongoDB User se link/sync karo
export const attachUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // requireAuth() ne pehle hi confirm kar diya hai ki ye session-based signed-in user hai
    const { userId: clerkId } = req.auth() as { userId: string | null };

    if (!clerkId) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    let user = await User.findOne({ clerkId });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress?.trim().toLowerCase();
      if (!email) {
        res.status(422).json({ message: "An email address is required to use this application" });
        return;
      }

      // A user may already exist from an earlier Clerk account/session. Re-link
      // by email instead of failing the unique email constraint during sync.
      user = await User.findOneAndUpdate(
        { email },
        {
          clerkId,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Unnamed",
          avatar: clerkUser.imageUrl || "",
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      if (!user) {
        res.status(500).json({ message: "Unable to sync user" });
        return;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("User sync failed", error);
    res.status(500).json({ message: "User sync failed" });
  }
};
