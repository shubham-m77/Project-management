import { Router } from "express";
import { getMe } from "../controllers/userController";
import { protect, attachUser } from "../middleware/auth";

const router = Router();

router.get("/me", protect, attachUser, getMe);

export default router;