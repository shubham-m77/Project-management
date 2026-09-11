import { Request, Response } from "express";
import { isValidObjectId, Types } from "mongoose";
import Task from "../models/Task";
import Project from "../models/Project";

const getAccessibleProject = async (projectId: string, userId: Types.ObjectId) => {
  if (!isValidObjectId(projectId)) return null;

  return Project.findOne({
    _id: projectId,
    $or: [{ owner: userId }, { "members.user": userId }],
  });
};

const canManageTasks = (project: InstanceType<typeof Project>, userId: Types.ObjectId): boolean =>
  project.owner.equals(userId) || project.members.some(
    (member) => member.user.equals(userId) && member.role === "admin"
  );

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = typeof req.query.project === "string" ? req.query.project : undefined;
    const projects = projectId
      ? await getAccessibleProject(projectId, req.user!._id)
      : await Project.find({
          $or: [{ owner: req.user!._id }, { "members.user": req.user!._id }],
        }).select("_id");

    if (!projects || (Array.isArray(projects) && projects.length === 0)) {
      res.json([]);
      return;
    }

    const projectIds = Array.isArray(projects) ? projects.map((project) => project._id) : [projects._id];
    const filter = { project: { $in: projectIds } };

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email clerkId")
      .populate("createdBy", "name email clerkId")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const { description, project, assignedTo, status, priority, dueDate } = req.body;
    if (!title || typeof project !== "string") {
      res.status(400).json({ message: "Title and project are required" });
      return;
    }
    if (status !== undefined && !["todo", "in-progress", "review", "done"].includes(status)) {
      res.status(400).json({ message: "Invalid task status" });
      return;
    }
    if (priority !== undefined && !["low", "medium", "high"].includes(priority)) {
      res.status(400).json({ message: "Invalid task priority" });
      return;
    }
    const targetProject = await getAccessibleProject(project, req.user!._id);
    if (!targetProject) {
      res.status(403).json({ message: "Not authorized to create tasks in this project" });
      return;
    }
    if (!canManageTasks(targetProject, req.user!._id)) {
      res.status(403).json({ message: "Only project admins can create tasks" });
      return;
    }
    if (assignedTo && !targetProject.members.some((member) => member.user.equals(assignedTo))) {
      res.status(400).json({ message: "Assignee must be a project member" });
      return;
    }
    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      status,
      priority,
      dueDate,
      createdBy: req.user!._id,
    });
    await task.populate("assignedTo", "name email clerkId");
    await task.populate("createdBy", "name email clerkId");
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid task ID" });
      return;
    }
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    const project = await getAccessibleProject(task.project.toString(), req.user!._id);
    const isAdmin = project ? canManageTasks(project, req.user!._id) : false;
    const isAssignee = Boolean(task.assignedTo?.equals(req.user!._id));
    if (!project || (!isAdmin && !isAssignee)) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const { title, description, assignedTo, status, priority, dueDate } = req.body;
    const hasAdminOnlyChanges = [title, description, assignedTo, priority, dueDate]
      .some((value) => value !== undefined);
    if (!isAdmin && hasAdminOnlyChanges) {
      res.status(403).json({ message: "Only project admins can edit task details" });
      return;
    }
    if (title !== undefined && (typeof title !== "string" || !title.trim())) {
      res.status(400).json({ message: "Task title cannot be empty" });
      return;
    }
    if (status !== undefined && !["todo", "in-progress", "review", "done"].includes(status)) {
      res.status(400).json({ message: "Invalid task status" });
      return;
    }
    if (priority !== undefined && !["low", "medium", "high"].includes(priority)) {
      res.status(400).json({ message: "Invalid task priority" });
      return;
    }
    if (assignedTo !== undefined && assignedTo !== null && !project.members.some((member) => member.user.equals(assignedTo))) {
      res.status(400).json({ message: "Assignee must be a project member" });
      return;
    }
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || undefined;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || undefined;
    await task.save();
    await task.populate("assignedTo", "name email clerkId");
    await task.populate("createdBy", "name email clerkId");
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid task ID" });
      return;
    }
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    const project = await getAccessibleProject(task.project.toString(), req.user!._id);
    if (!project || !canManageTasks(project, req.user!._id)) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }
    await task.deleteOne();
    res.json({ message: "Task removed" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
