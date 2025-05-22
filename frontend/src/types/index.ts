// src/types/index.ts

// User types
export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface StudentUser extends User {
  role: 'student';
  documents: Document[];
  messages: Message[];
}

export interface AdminUser extends User {
  role: 'admin';
}

// Document types
export interface Document {
  id: string;
  title: string;
  fileName: string;
  uploadDate: Date;
  status: 'analyzing' | 'analyzed' | 'failed';
  analysis?: DocumentAnalysis;
}

export interface DocumentAnalysis {
  id: string;
  summary: string;
  keyPoints: string[];
  topics: {
    name: string;
    confidence: number;
  }[];
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface Message {
  _id: string;
  sender_id: string; // Could be admin's ID or student's ID (for replies)
  recipient_id: string; // Student's ID
  content: string;
  created_at: string; // ISO string
  // Add other fields as per your backend message schema (e.g., read, subject)
}

// API types
export interface UploadDocumentResponse {
  documentId: string;
  status: 'uploaded' | 'error';
  message?: string;
}

export interface AnalyzeDocumentResponse {
  documentId: string;
  status: 'analyzing' | 'analyzed' | 'failed';
  analysis?: DocumentAnalysis;
}
