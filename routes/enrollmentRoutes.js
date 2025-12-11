import express from 'express';
import { handleEnrollment, getEnrollments } from '../controllers/enrollmentController.js';
import authenticateAdmin from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/enrollment/submit - Handle new enrollment submission (no auth required for public form submissions)
router.post('/submit', handleEnrollment);

// GET /api/enrollment/all - Get all enrollments (for admin dashboard) - PROTECTED
router.get('/all', authenticateAdmin, getEnrollments);

export default router;