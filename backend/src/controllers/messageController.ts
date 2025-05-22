// G:\Minset\backend\src\controllers\messageController.ts

import { Request, Response, NextFunction } from 'express'; // This import was commented out, uncomment it
import Message, { IMessage } from '../models/Message'; // Import as default and IMessage interface
import User from '../models/User'; // Import User model

// Extend the Request interface for proper type inference with req.user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string; // Admin's ID or Student's ID
    role: string;
  };
}

// 1. Controller for getting messages for students
export const getStudentMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user?.id; // Safely access user.id

        if (!studentId) {
            return res.status(401).json({ message: 'Not authorized, student ID not found.' });
        }

        const messages = await Message.find({
            $or: [
                { recipient: studentId }, // Individual messages
                { recipient: null }       // Broadcast messages (null recipient)
            ]
        })
        .populate('sender', 'name') // Populate sender's name
        .sort({ createdAt: -1 }); // Sort by creation date descending

        // Format messages to include sender_name directly
        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            sender_id: msg.sender._id,
            recipient_id: msg.recipient,
            content: msg.content,
            links: msg.links || [], // Ensure links is an array
            createdAt: msg.createdAt,
            is_read: msg.is_read,
            sender_name: (msg.sender as any).name || 'Admin' // Use populated name, default to 'Admin'
        }));

        res.status(200).json(formattedMessages);
    } catch (error) {
        // Pass error to Express error handling middleware
        next(error);
    }
};

// 2. Controller for marking messages as read
export const markMessagesAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { messageIds } = req.body;
        const studentId = req.user?.id; // To ensure only the recipient can mark as read

        if (!studentId) {
            return res.status(401).json({ message: 'Not authorized, student ID not found.' });
        }
        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return res.status(400).json({ message: 'No message IDs provided.' });
        }

        await Message.updateMany(
            { _id: { $in: messageIds }, recipient: studentId }, // Only mark individual messages for the requesting student
            { $set: { is_read: true } }
        );

        res.status(200).json({ message: 'Messages marked as read.' });
    } catch (error) {
        next(error);
    }
};

// 3. Controller for sending an individual message (Admin function)
export const sendMessageToIndividual = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { recipient_id, content, links } = req.body;
        const sender_id = req.user?.id; // Admin's ID from auth middleware

        if (!sender_id || !recipient_id || !content) {
            return res.status(400).json({ message: 'Sender, recipient, and content are required.' });
        }

        // Optional: Verify recipient exists and is a student
        const recipientUser = await User.findById(recipient_id);
        if (!recipientUser || recipientUser.role !== 'student') {
            return res.status(404).json({ message: 'Recipient not found or is not a student.' });
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
        // Better error handling for Mongoose validation errors or duplicate keys etc.
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error while sending individual message.' });
    }
};

// 4. Controller for sending a broadcast message (Admin function)
export const sendBroadcastMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { messages } = req.body; // Expecting an array of messages as prepared by frontend
        const sender_id = req.user?.id; // Admin's ID from auth middleware

        if (!sender_id) {
            return res.status(401).json({ message: 'Admin sender ID is required.' });
        }
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ message: 'No messages provided for broadcast.' });
        }

        const messagesToInsert = messages.map((msg: any) => ({
            sender: sender_id, // Ensure sender is the admin
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