import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

// Define the Document Interface (optional, but good for TypeScript)
export interface IDocument extends MongooseDocument {
  title: string;
  uploadDate: Date;
  status: 'analyzed' | 'analyzing' | 'failed';
  student: mongoose.Types.ObjectId; // Reference back to the User who owns this document
}

const DocumentSchema: Schema = new Schema({
  title: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['analyzed', 'analyzing', 'failed'], default: 'analyzing' },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true } // Link to the User model
});

export default mongoose.model<IDocument>('Document', DocumentSchema);