import { Request, Response } from "express";
import { isValidObjectId, Types } from "mongoose";
import Project from "../models/Project";
import Task from "../models/Task";
import User from "../models/User";

const isMember = (project: InstanceType<typeof Project>, userId: Types.ObjectId): boolean =>
  project.owner.equals(userId) || project.members.some((member) => member.user.equals(userId));

const isAdmin = (project: InstanceType<typeof Project>, userId: Types.ObjectId): boolean =>
  project.owner.equals(userId) || project.members.some(
    (member) => member.user.equals(userId) && member.role === "admin"
  );

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user!._id }, { "members.user": req.user!._id }],
    })
      .populate("owner", "name email clerkId")
      .populate("members.user", "name email clerkId");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid project ID" });
      return;
    }
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email clerkId")
      .populate("members.user", "name email clerkId");
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    if (!isMember(project, req.user!._id)) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
    const status = req.body.status;
    if (!name) {
      res.status(400).json({ message: "Project name is required" });
      return;
    }
    if (status !== undefined && !["planning", "active", "on-hold", "completed"].includes(status)) {
      res.status(400).json({ message: "Invalid project status" });
      return;
    }
    const project = await Project.create({
      name,
      description,
      status,
      owner: req.user!._id,
      members: [{ user: req.user!._id, role: "admin" }],
    });
    res.status(201).json(project);
  } catch (error) {
    console.error("createProject failed", error);
    res.status(500).json({ message: "Unable to create project" });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid project ID" });
      return;
    }
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    if (!isAdmin(project, req.user!._id)) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }
    const name = req.body.name === undefined
      ? project.name
      : typeof req.body.name === "string"
        ? req.body.name.trim()
        : "";
    const description = req.body.description === undefined
      ? project.description
      : typeof req.body.description === "string"
        ? req.body.description.trim()
        : "";
    const status = req.body.status;
    if (!name) {
      res.status(400).json({ message: "Project name is required" });
      return;
    }
    if (status !== undefined && !["planning", "active", "on-hold", "completed"].includes(status)) {
      res.status(400).json({ message: "Invalid project status" });
      return;
    }
    project.name = name;
    project.description = description;
    if (status !== undefined) project.status = status;
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid project ID" });
      return;
    }
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    if (!isAdmin(project, req.user!._id)) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: "Project removed" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const addMember = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid project ID" });
      return;
    }
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    if (!isAdmin(project, req.user!._id)) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!email) {
      res.status(400).json({ message: "A member email is required" });
      return;
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      res.status(404).json({ message: "User not found (must have logged in once)" });
      return;
    }

    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      res.status(400).json({ message: "User already a member" });
      return;
    }

    project.members.push({ user: userToAdd._id, role: "member" });
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
