import express from 'express';
import passport from 'passport';
import generateToken from '../utils/generateToken.js'; 
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const token = generateToken(req.user.id);

    // --- DEPLOYMENT FIX ---
    // Use the environment variable, fallback to localhost only if missing
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    res.redirect(`${frontendUrl}/login/success?token=${token}`);
  }
);

export default router;