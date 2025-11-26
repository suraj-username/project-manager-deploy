import Project from '../models/Project.js';
import User from '../models/user.model.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createTaskState } from '../services/taskState/TaskStateFactory.js';

// @desc Creating a new task or subtask
// @route POST /api/projects/:projectId/tasks
// @access Private (Team Member) - We add this protection in routes later
export const createTask = asyncHandler(async (req, res) => {
  const { name, description, parentId } = req.body; // parentId might be null
  const { projectId } = req.params;

  if (!name) {
    res.status(400);
    throw new Error('Task name is required');
  }

  // Ensure project exists
  const project = req.project;
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const taskData = {
    name,
    description: description || '',
    project: projectId,
    createdBy: req.user._id,
    status: 'Pending Approval', 
    priority: 'Low', 
    parentId: parentId || null,
  };

  if (parentId) {
    const parentTask = await Task.findById(parentId);
    if (!parentTask) {
      res.status(404);
      throw new Error('Parent task not found.');
    }
    
    if (parentTask.parentId) {
       res.status(400);
       throw new Error('Cannot create a subtask under another subtask.');
    }
    taskData.priority = parentTask.priority;
    taskData.status = parentTask.status;
  }

  const task = await Task.create(taskData);
  res.status(201).json(task);
});

// @desc Get all tasks for a specific project
// @route GET /api/projects/:projectId/tasks
// @access Private (Team Member)
export const getProjectTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const tasks = await Task.find({ project: projectId })
    .populate('createdBy', 'name email') 
    .populate('assignees', 'name email'); 

  const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };

  tasks.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return 0;
  });

  const rootTasks = [];
  const subtasksMap = {}; 

  tasks.forEach(task => {
    if (task.parentId) {
      const parentIdStr = task.parentId.toString();
      if (!subtasksMap[parentIdStr]) {
        subtasksMap[parentIdStr] = [];
      }
      subtasksMap[parentIdStr].push(task);
    } else {
      rootTasks.push(task);
    }
  });

   for (const parentId in subtasksMap) {
       subtasksMap[parentId].sort((a, b) => {
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
   }


  res.status(200).json({ root: rootTasks, subtasks: subtasksMap });
});


// @desc Delete a task and its subtasks
// @route DELETE /api/tasks/:taskId
// @access Private (Project Creator)
export const deleteTask = asyncHandler(async (req, res) => {
  const task = req.task;
  await Task.deleteMany({ parentId: task._id });
  await Task.deleteOne({ _id: task._id });

  res.status(200).json({ message: 'Task and its subtasks deleted successfully.' });
});

// @desc Update task status based on action
// @route PUT /api/tasks/:taskId/status
// @access Private (Team Member, with specific actions restricted by state/role)
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { action, assignees } = req.body;
  const task = req.task;
  const project = req.project;
  const user = req.user;

  if (task.parentId) {
      res.status(400);
      throw new Error('Cannot change status of a subtask directly.');
  }

  const state = createTaskState(task, project);

  switch (action) {
    case 'approve':
      state.approve(user);
      break;
    case 'moveToInProgress':
      if (!assignees || !Array.isArray(assignees) || assignees.length === 0) {
         res.status(400);
         throw new Error('Assignees array is required to move task to In Progress.');
      }
      state.moveToInProgress(user, assignees);
      break;
    case 'moveToDone':
      state.moveToDone(user);
      break;
    case 'moveBackToToDo':
        state.moveBackToToDo(user);
        break;
    case 'moveBackToInProgress':
       state.moveBackToInProgress(user);
       break;
    default:
      res.status(400);
      throw new Error(`Invalid action: ${action}`);
  }

  const updatedTask = await task.save();
  await updatedTask.populate('createdBy', 'name email');
  await updatedTask.populate('assignees', 'name email');

  res.status(200).json(updatedTask);
});

// @desc Change task priority
// @route PUT /api/tasks/:taskId/priority
// @access Private (Project Creator)
export const changeTaskPriority = asyncHandler(async (req, res) => {
  const { priority } = req.body;
  const task = req.task;
  const project = req.project;
  const user = req.user;
   if (task.parentId) {
        res.status(400);
        throw new Error('Cannot change priority of a subtask directly.');
    }


  if (!['Low', 'Medium', 'High'].includes(priority)) {
    res.status(400);
    throw new Error('Invalid priority value.');
  }

  const state = createTaskState(task, project);
  state.changePriority(user, priority);

  const updatedTask = await task.save();
  await updatedTask.populate('createdBy', 'name email');
  await updatedTask.populate('assignees', 'name email');

  res.status(200).json(updatedTask);
});

// @desc    Update a task's details (name, description)
// @route   PUT /api/tasks/:taskId
// @access  Private (Team Member)
export const updateTask = asyncHandler(async (req, res) => {
  const { name, description, assignees } = req.body;
  const task = req.task;
  const project = req.project; 

  // 1. Handle Basic Fields
  if (name !== undefined) {
    if (!name.trim()) {
      res.status(400);
      throw new Error('Task name cannot be empty.');
    }
    task.name = name.trim();
  }
  if (description !== undefined) {
    task.description = description.trim();
  }

  // 2. Handle Assignees (Admin/Creator Only)
  if (assignees !== undefined) {
    const isCreator = project.projectCreator.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isCreator && !isAdmin) {
       res.status(403);
       throw new Error("Not authorized: Only Project Creator or Admin can manually edit assignees.");
    }

    if (!Array.isArray(assignees)) {
        res.status(400);
        throw new Error("Assignees must be an array of User IDs.");
    }
    
    task.assignees = assignees;
  }

  const updatedTask = await task.save();
  await updatedTask.populate('createdBy', 'name email');
  await updatedTask.populate('assignees', 'name email');

  res.status(200).json(updatedTask);
});