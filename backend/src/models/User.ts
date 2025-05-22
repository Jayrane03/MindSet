import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional if not always included
  role: 'student' | 'admin' | 'instructor'; // Or whatever roles you have
  documents: mongoose.Types.ObjectId[]; // Assuming array of document IDs
  messages: mongoose.Types.ObjectId[]; // Assuming array of message IDs
  createdAt: Date; // Important for your chart!
  updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin', 'instructor'], default: 'student' },
  documents: [{ type: Schema.Types.ObjectId, ref: 'Document' }], // Adjust ref if needed
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],   // Adjust ref if needed
}, {
  timestamps: true, // This automatically adds createdAt and updatedAt
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;