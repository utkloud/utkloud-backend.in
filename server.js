import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import ourSectionRoutes from './routes/ourSectionRoutes.js';
import sessionMiddleware from './middleware/sessionMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware for API routes only
app.use('/api', sessionMiddleware);

// General middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - Must be before static file serving
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/our-section', ourSectionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Backend server is running!' });
});

// 404 handler for API routes (must be before static file serving)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path
  });
});

// Serve static files from the backend directory (after API routes)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// Redirect root to login page
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;