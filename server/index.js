import 'dotenv/config';
import express from 'express';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import session from 'express-session';
import passport from 'passport';
import configurePassport from './config/passport.js';
import connectDB from './config/db.js';
import cors from 'cors'; // Import CORS

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/task.routes.js';

connectDB();
configurePassport(passport);

const app = express();

// --- CRITICAL DEPLOYMENT SETTINGS ---

// 1. Trust Proxy: Required for OAuth on Render/Heroku to work over HTTPS
app.set('trust proxy', 1);

// 2. CORS: Allow the frontend to talk to this backend
// We use an environment variable so it works for Localhost AND Production automatically
const allowedOrigins = [
  'http://localhost:5173',                  // Local Development
  process.env.FRONTEND_URL                  // Production (Vercel)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // Important for sessions/cookies if we used them (we use tokens, but good practice)
}));

// ------------------------------------

app.use(express.json());

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Cross-site cookie fix
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});