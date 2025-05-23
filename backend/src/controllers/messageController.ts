// G:\Minset\backend\src\controllers\messageController.ts

import { Request, Response, NextFunction } from 'express';
import Message, { IMessage } from '../models/Message'; // Import as default and IMessage interface
import User from '../models/User'; // Import User model

// AuthenticatedRequest interface is removed as it's no longer used due to no authentication.

// 1. Controller for getting messages for students (publicly accessible)
const getStudentMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This route will fetch ALL messages with recipient_id === null (broadcast messages).
    // If you intend for this to also fetch individual messages for a specific student
    // without authentication, you'd need to pass the student ID as a query parameter (e.g., /messages/student?studentId=SOME_ID).
    // However, this would mean anyone could query any student's messages.
    // For "normal request is enough", this function will just return broadcast messages.
    const messages = await Message.find({ recipient_id: null }).sort({ createdAt: -1 }); // Fetch all broadcast messages, newest first
    res.json(messages);
  } catch (error) {
    console.error('Error fetching student messages:', error);
    next(error); // Pass error to error handling middleware
  }
};

// 2. Controller for marking messages as read (NO AUTHENTICATION - SECURITY RISK)
export const markMessagesAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messageIds, studentId } = req.body; // Expecting studentId to be sent in the request body now

    // WARNING: This assumes studentId is sent from the frontend and is trusted.
    // In a real application, studentId should come from an authenticated token.
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required to mark messages as read.' });
    }
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: 'No message IDs provided.' });
    }

    // Mark messages where the recipient matches the provided studentId
    const result = await Message.updateMany(
      { _id: { $in: messageIds }, recipient: studentId, is_read: false },
      { $set: { is_read: true } }
    );

    if (result.modifiedCount === 0) {
        return res.status(200).json({ message: 'No new messages to mark as read for this user or messages not found.' });
    }

    res.status(200).json({ message: 'Messages marked as read successfully.' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    next(error);
  }
};

// 3. Controller for sending an individual message (NO AUTHENTICATION - MAJOR SECURITY RISK)
export const sendMessageToIndividual = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // WARNING: Anyone can now send messages as any sender or to any recipient.
    // Ensure you understand the implications.
    const { sender_id, recipient_id, content, links } = req.body; // Expecting sender_id from body

    if (!sender_id || !recipient_id || !content) {
      return res.status(400).json({ message: 'Sender ID, recipient ID, and content are required.' });
    }

    // Optional: Verify recipient exists and is a student (Good to keep this check)
    const recipientUser = await User.findById(recipient_id);
    if (!recipientUser || recipientUser.role !== 'student') {
      return res.status(404).json({ message: 'Recipient not found or is not a student.' });
    }
    
    // Optional: Verify sender exists (Good practice even without auth)
    const senderUser = await User.findById(sender_id);
    if (!senderUser) {
      return res.status(404).json({ message: 'Sender not found.' });
    }


    const newMessage = await Message.create({
      sender: sender_id,
      recipient: recipient_id,
      content,
      links: links || [],
      is_read: false
    });

    res.status(201).json({
      message: 'Individual message sent successfully',
      data: newMessage
    });

  } catch (error: any) {
    console.error('Error sending individual message:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while sending individual message.' });
  }
};

// 4. Controller for sending a broadcast message (NO AUTHENTICATION - MAJOR SECURITY RISK)
export const sendBroadcastMessage = async (req: Request, res: Response, next: NextFunction) => { // Fixed 'Au' to 'Request'
  try {
    // WARNING: Anyone can now send broadcast messages.
    // Ensure you understand the implications.
    const { messages, sender_id } = req.body; // Expecting sender_id from body

    if (!sender_id) { // Now comes from body, not req.user
      return res.status(400).json({ message: 'Sender ID is required for broadcast.' });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'No messages provided for broadcast.' });
    }

    // Optional: Verify sender exists (Good practice even without auth)
    const senderUser = await User.findById(sender_id);
    if (!senderUser) {
      return res.status(404).json({ message: 'Sender not found.' });
    }

    // Ensure the 'sender' for each message in the array is the 'sender_id' from the body
    const messagesToInsert = messages.map((msg: any) => ({
      sender: sender_id, // Ensure sender is provided in the request body
      recipient: null, // Broadcast messages have null recipient
      content: msg.content,
      links: msg.links || [],
      is_read: false
    }));

    const createdMessages = await Message.insertMany(messagesToInsert);

    res.status(201).json({
      message: `Broadcast message sent successfully to ${createdMessages.length} recipients.`,
      data: createdMessages
    });

  } catch (error: any) {
    console.error('Error sending broadcast message:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while sending broadcast message.' });
  }
};

// Export the public function separately, and others as named exports
export { getStudentMessages };