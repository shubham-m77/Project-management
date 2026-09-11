import { Router } from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
} from "../controllers/projectController";
import { protect, attachUser } from "../middleware/auth";

const router = Router();

router.use(protect, attachUser);

router.route("/").get(getProjects).post(createProject);
router.route("/:id").get(getProjectById).put(updateProject).delete(deleteProject);
router.post("/:id/members", addMember);

export default router;