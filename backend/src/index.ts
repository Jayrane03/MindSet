// server.ts or app.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // ✅ Import CORS
import connectDB from './config/db';
import authRoutes from '../src/routes/authRoutes';
import adminRoutes from './routes/adminRoutes'; 
import './models/User';     // Ensure User model is loaded and registered
import './models/Document'; // <-- Import your Document model
import './models/Message'; 
import messageRoutes from '../src/routes/messageRoutes'; // <-- Import your message routes
dotenv.config();

const app = express();

// ✅ Setup CORS middleware
app.use(
  cors({
    origin: 'http://localhost:5173', // 👈 Your frontend URL
    credentials: true, // Allow cookies and authorization headers
  })
);

// Connect to DB
connectDB();

// Body parser middleware
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
