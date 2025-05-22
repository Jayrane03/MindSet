import { Request, Response } from 'express';
import Message from "../models/Message"; // Assuming you have a Message model

// Function to calculate average daily chatbot usage
export const getChatbotUsage = async (req: Request, res: Response) => {
  try {
    // You'll need to define what "chatbot messages" are.
    // Example: messages where recipient_id is null (assuming admin sends to students, chatbot responds to students)
    // Or, if you have a dedicated 'chatbot' user ID, use that as sender_id.
    // Or, if messages have a 'type' field like 'chatbot_interaction'.

    // For demonstration, let's assume messages with no recipient_id are chatbot responses
    // or you have a specific way to identify chatbot interactions.
    // This example is simplified; a real one might aggregate by day.

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

    // Count messages that are likely chatbot-related within the last 30 days
    // This is a placeholder; real usage metrics are more complex (e.g., session duration)
    const usageData = await Message.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }, // Last 30 days
          recipient: null // Assuming chatbot messages have no specific recipient
          // Or, if your chatbot has a user ID: sender: CHATBOT_USER_ID
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date
          count: { $sum: 1 } // Count messages per day
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Calculate average daily messages for the last 30 days
    let totalMessages = 0;
    if (usageData.length > 0) {
        totalMessages = usageData.reduce((sum, day) => sum + day.count, 0);
    }
    const averageDailyMessages = usageData.length > 0 ? (totalMessages / usageData.length).toFixed(1) : 0; // One decimal place

    // You might convert messages to a conceptual "hours" if 10 messages = 1 hour, etc.
    const averageDailyHours = (parseFloat(averageDailyMessages.toString()) / 10).toFixed(1); // Example conversion

    res.json({
        averageDailyMessages: parseFloat(averageDailyMessages.toString()),
        averageDailyHours: parseFloat(averageDailyHours),
        rawData: usageData // Optionally send raw data for a chart
    });

  } catch (error) {
    console.error('Error fetching chatbot usage:', error);
    res.status(500).json({ message: 'Server error fetching chatbot usage' });
  }
};