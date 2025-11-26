import express from 'express';
const router = express.Router();
import protect from '../middleware/auth.middleware.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, (req, res) => { 
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export default router;