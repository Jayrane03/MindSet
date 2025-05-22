// G:\Minset\backend\src\models\Message.ts

import mongoose from 'mongoose'; // Correct import for Mongoose

// Define your IMessage interface if you haven't already, for strong typing
// This interface describes the shape of a Message document in TypeScript
export interface IMessage extends mongoose.Document {
    sender: mongoose.Types.ObjectId;
    recipient: mongoose.Types.ObjectId | null;
    content: string;
    links: { url: string; text: string }[];
    is_read: boolean;
    createdAt?: Date; // Mongoose adds this with timestamps: true
    updatedAt?: Date; // Mongoose adds this with timestamps: true
}

const messageSchema = new mongoose.Schema<IMessage>({ // Type the schema with IMessage
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    content: {
        type: String,
        required: true
    },
    links: [
        {
            url: { type: String, required: true },
            text: { type: String, required: true }
        }
    ],
    is_read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Correct way to default export a Mongoose model with TypeScript typing
export default mongoose.model<IMessage>('Message', messageSchema);