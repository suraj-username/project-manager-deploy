import express from 'express';
const router = express.Router();
import {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/projectController.js';

import {
  createTask,
  getProjectTasks,
} from '../controllers/task.controller.js';

import protect from '../middleware/auth.middleware.js';
import {
  isTeamMember,
  isProjectCreator,
} from '../middleware/authorization.js';


router.route('/').post(protect, createProject).get(protect, getMyProjects);

router
  .route('/:projectId')
  .get(protect, isTeamMember, getProjectById)
  .put(protect, isProjectCreator, updateProject)
  .delete(protect, isProjectCreator, deleteProject);


router.route('/:projectId/team').post(protect, isProjectCreator, addMember);

router
  .route('/:projectId/team/:userId')
  .delete(protect, isProjectCreator, removeMember);



// @route   POST /api/projects/:projectId/tasks
// @access  Private (Team Member)
router.route('/:projectId/tasks').post(protect, isTeamMember, createTask);

// @route   GET /api/projects/:projectId/tasks
// @access  Private (Team Member)
router.route('/:projectId/tasks').get(protect, isTeamMember, getProjectTasks);

export default router;
