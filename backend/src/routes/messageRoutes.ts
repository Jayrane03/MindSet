// G:\Minset\backend\src\routes\messageRoutes.ts
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { getStudentMessages, markMessagesAsRead } from '../controllers/messageController'; // Student-related message functions

const router = express.Router();

// Student-specific message retrieval and management endpoints
// This assumes /api/messages will be the base for these routes
router.get('/student', getStudentMessages);
router.put('/mark-as-read' , markMessagesAsRead);

export default router;