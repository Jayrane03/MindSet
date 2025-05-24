// server.ts or app.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // ✅ Import CORS
import connectDB from './src/config/db';
import path from 'path';
import authRoutes from './src/routes/authRoutes';
import adminRoutes from './src/routes/adminRoutes'; 
import './src/models/User';     // Ensure User model is loaded and registered
import './src/models/Document'; // <-- Import your Document model
import './src/models/Message'; 
import courseRoutes from './src/routes/courseRoutes'; // <-- Import your course routes
import messageRoutes from './src/routes/messageRoutes'; // <-- Import your message routes
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use("/api/courses", courseRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // 

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
