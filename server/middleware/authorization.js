import Project from '../models/Project.js';
import { asyncHandler } from './asyncHandler.js';

export const isTeamMember = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user.id;
    const project = await Project.findById(projectId);
    
    if (!project) {
        res.status(404);
        throw new Error("Project not found");
    }

    // --- NEW: Admin Override ---
    if (req.user.role === 'admin') {
        req.project = project;
        return next();
    }
    // ---------------------------

    const creatorId = project.projectCreator.toString();
    if (creatorId === userId) {
        req.project = project;
        return next();
    }
    const isMember = project.teamMembers.some(
        (memberId) => memberId.toString() === userId
    );
    if (isMember) {
        req.project = project;
        return next();
    }
    res.status(403);
    throw new Error("Not authorized: You are not a member of this project")
});

export const isProjectCreator = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const userId = req.user.id;
    const project = req.project || (await Project.findById(projectId));
    
    if (!project) {
        res.status(404);
        throw new Error("Project not found");
    }

    // --- NEW: Admin Override ---
    if (req.user.role === 'admin') {
        if (!req.project) req.project = project;
        return next();
    }
    // ---------------------------

    const creatorId = project.projectCreator.toString();
    if (creatorId != userId) {
        res.status(403);
        throw new Error("Not Authorized: Only project creator can perform this action");
    }
    if (!req.project) {
        req.project = project;
    }
    next();
});