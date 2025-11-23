import jwt from 'jsonwebtoken'
import User from '../models/user.model.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      // --- ADD THIS CHECK ---
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      // ----------------------

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      // Simplify error message to ensure client logs out
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

export default protect;