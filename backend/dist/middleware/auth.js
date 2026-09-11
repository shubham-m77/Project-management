"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachUser = exports.protect = void 0;
const express_1 = require("@clerk/express");
const User_1 = __importDefault(require("../models/User"));
// Clerk ka middleware - token verify karta hai
exports.protect = (0, express_1.requireAuth)();
// Verified Clerk user ko humare MongoDB User se link/sync karo
const attachUser = async (req, res, next) => {
    try {
        // requireAuth() ne pehle hi confirm kar diya hai ki ye session-based signed-in user hai
        const { userId: clerkId } = req.auth();
        if (!clerkId) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }
        let user = await User_1.default.findOne({ clerkId });
        if (!user) {
            const clerkUser = await express_1.clerkClient.users.getUser(clerkId);
            const email = clerkUser.emailAddresses[0]?.emailAddress?.trim().toLowerCase();
            if (!email) {
                res.status(422).json({ message: "An email address is required to use this application" });
                return;
            }
            // A user may already exist from an earlier Clerk account/session. Re-link
            // by email instead of failing the unique email constraint during sync.
            user = await User_1.default.findOneAndUpdate({ email }, {
                clerkId,
                name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Unnamed",
                avatar: clerkUser.imageUrl || "",
            }, { new: true, upsert: true, setDefaultsOnInsert: true });
            if (!user) {
                res.status(500).json({ message: "Unable to sync user" });
                return;
            }
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("User sync failed", error);
        res.status(500).json({ message: "User sync failed" });
    }
};
exports.attachUser = attachUser;
