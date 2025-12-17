import express from 'express';
import {
  getAllItems,
  getAllItemsAdmin,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/ourSectionController.js';
import authenticateAdmin from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - Get all active items
router.get('/all', getAllItems);

// Admin routes - Protected
router.get('/admin/all', authenticateAdmin, getAllItemsAdmin);
router.get('/admin/:id', authenticateAdmin, getItemById);
router.post('/admin/create', authenticateAdmin, createItem);
router.put('/admin/:id', authenticateAdmin, updateItem);
router.delete('/admin/:id', authenticateAdmin, deleteItem);

export default router;


