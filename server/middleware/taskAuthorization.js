import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { asyncHandler } from './asyncHandler.js';

export const isTaskTeamMember = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  const project = await Project.findById(task.project);
  if (!project) {
    res.status(404);
    throw new Error('Project associated with this task not found');
  }

  // --- NEW: Admin Override ---
  if (req.user.role === 'admin') {
      req.task = task;
      req.project = project;
      return next();
  }
  // ---------------------------

  const creatorId = project.projectCreator.toString();
  const isMember = project.teamMembers.some(
    (memberId) => memberId.toString() === userId
  );

  if (creatorId === userId || isMember) {
    req.task = task;
    req.project = project;
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized: You are not a member of this project.');
  }
});

export const isTaskProjectCreator = asyncHandler(async (req, res, next) => {
  let project = req.project;
  // If middleware chain didn't set project yet, fetch it
  if (!project) {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    project = await Project.findById(task.project);
    if (!project) {
      res.status(404);
      throw new Error('Project associated with this task not found');
    }
    req.task = task;
    req.project = project;
  }

  // --- NEW: Admin Override ---
  if (req.user.role === 'admin') {
      return next();
  }
  // ---------------------------

  const creatorId = project.projectCreator.toString();
  if (creatorId !== req.user.id) {
    res.status(403); 
    throw new Error('Not authorized: Only the project creator can perform this action.');
  }
  next();
});