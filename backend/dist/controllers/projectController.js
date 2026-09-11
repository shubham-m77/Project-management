"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMember = exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectById = exports.getProjects = void 0;
const mongoose_1 = require("mongoose");
const Project_1 = __importDefault(require("../models/Project"));
const Task_1 = __importDefault(require("../models/Task"));
const User_1 = __importDefault(require("../models/User"));
const isMember = (project, userId) => project.owner.equals(userId) || project.members.some((member) => member.user.equals(userId));
const isAdmin = (project, userId) => project.owner.equals(userId) || project.members.some((member) => member.user.equals(userId) && member.role === "admin");
const getProjects = async (req, res) => {
    try {
        const projects = await Project_1.default.find({
            $or: [{ owner: req.user._id }, { "members.user": req.user._id }],
        })
            .populate("owner", "name email clerkId")
            .populate("members.user", "name email clerkId");
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProjects = getProjects;
const getProjectById = async (req, res) => {
    try {
        if (!(0, mongoose_1.isValidObjectId)(req.params.id)) {
            res.status(400).json({ message: "Invalid project ID" });
            return;
        }
        const project = await Project_1.default.findById(req.params.id)
            .populate("owner", "name email clerkId")
            .populate("members.user", "name email clerkId");
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        if (!isMember(project, req.user._id)) {
            res.status(403).json({ message: "Not authorized" });
            return;
        }
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProjectById = getProjectById;
const createProject = async (req, res) => {
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
        const project = await Project_1.default.create({
            name,
            description,
            status,
            owner: req.user._id,
            members: [{ user: req.user._id, role: "admin" }],
        });
        res.status(201).json(project);
    }
    catch (error) {
        console.error("createProject failed", error);
        res.status(500).json({ message: "Unable to create project" });
    }
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
    try {
        if (!(0, mongoose_1.isValidObjectId)(req.params.id)) {
            res.status(400).json({ message: "Invalid project ID" });
            return;
        }
        const project = await Project_1.default.findById(req.params.id);
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        if (!isAdmin(project, req.user._id)) {
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
        if (status !== undefined)
            project.status = status;
        await project.save();
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        if (!(0, mongoose_1.isValidObjectId)(req.params.id)) {
            res.status(400).json({ message: "Invalid project ID" });
            return;
        }
        const project = await Project_1.default.findById(req.params.id);
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        if (!isAdmin(project, req.user._id)) {
            res.status(403).json({ message: "Not authorized" });
            return;
        }
        await Task_1.default.deleteMany({ project: project._id });
        await project.deleteOne();
        res.json({ message: "Project removed" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteProject = deleteProject;
const addMember = async (req, res) => {
    try {
        if (!(0, mongoose_1.isValidObjectId)(req.params.id)) {
            res.status(400).json({ message: "Invalid project ID" });
            return;
        }
        const project = await Project_1.default.findById(req.params.id);
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        if (!isAdmin(project, req.user._id)) {
            res.status(403).json({ message: "Not authorized" });
            return;
        }
        const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
        if (!email) {
            res.status(400).json({ message: "A member email is required" });
            return;
        }
        const userToAdd = await User_1.default.findOne({ email });
        if (!userToAdd) {
            res.status(404).json({ message: "User not found (must have logged in once)" });
            return;
        }
        const alreadyMember = project.members.some((m) => m.user.toString() === userToAdd._id.toString());
        if (alreadyMember) {
            res.status(400).json({ message: "User already a member" });
            return;
        }
        project.members.push({ user: userToAdd._id, role: "member" });
        await project.save();
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addMember = addMember;
