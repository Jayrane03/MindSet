// backend/routes/messageRoutes.ts

import express from 'express';
import { 
  getStudentMessages, 
  markMessagesAsRead, 
  sendMessageToIndividual, 
  sendBroadcastMessage 
} from '../controllers/messageController';
// import { protect } from '../middleware/authMiddleware'; // NO LONGER NEEDED FOR THESE ROUTES IF YOU REMOVE ALL AUTH


const router = express.Router();

// All routes are now public as per your request
router.get('/student', getStudentMessages);
router.put('/mark-as-read', markMessagesAsRead); // WARNING: Anyone can mark messages as read
router.post('/individual', sendMessageToIndividual); // WARNING: Anyone can send individual messages
router.post('/broadcast', sendBroadcastMessage);     // WARNING: Anyone can send broadcast messages

export default router;