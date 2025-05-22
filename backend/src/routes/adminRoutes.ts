import { Router } from 'express';
const router = Router();

// import { protect, authorize } from '../middleware/authMiddleware'; // Your authentication middleware
import {
  sendBroadcastMessage, // Assuming these functions exist in an admin messages controller
  sendMessageToIndividual
} from '../controllers/messageController';
// Assuming you have other admin controllers
import { getStudentData } from '../controllers/adminController'; // For total students card

// Import the analytics controllers from their respective file
import {
  getStudentActivityChartData,
  getChatbotUsageForCard, // Make sure this is imported if used
} from '../controllers/adminAnalyticsController';

// --- Existing Routes ---
router.get('/students-data', getStudentData);
router.get('/chatbot-usage', getChatbotUsageForCard); // For the card data

// --- THIS IS THE CRUCIAL ROUTE YOU NEED TO ADD/VERIFY ---
router.get('/student-activity-chart-data', getStudentActivityChartData);

// --- Message Sending Routes (re-added as per your request) ---
 // You might need a new file for this: adminMessagesController.ts

router.post('/messages/broadcast',  sendBroadcastMessage);
router.post('/messages/individual',  sendMessageToIndividual);

export default router; // Use default export for routers