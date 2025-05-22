import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // ✅ Make sure you have bcryptjs installed


const generateToken = (user: any) => {
  return jwt.sign(
    { id: user._id, name: user.name, role: user.role, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // THIS IS THE LINE WHERE YOU HASH THE PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    const newUser = new User({ name, email, password: hashedPassword, role }); // Correctly assign the hashed password
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};



export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    // 1. Basic input validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    // 2. Find user by email AND role
    // This efficiently checks if a user with that email and role exists
    const user = await User.findOne({ email, role });

    // 3. Check if user exists (based on email and role)
    if (!user) {
      // General "Invalid credentials" is better for security,
      // to avoid giving hints if the email exists but the role is wrong.
      return res.status(400).json({ message: 'Invalid credentials for the role' });
    }

    // 4. (Optional but good) More strict role validation if 'role' could be anything from frontend
    // If you only allow 'student' or 'admin' to even try to log in, this is a good safety check.
    if (!['student', 'admin'].includes(user.role)) {
      return res.status(400).json({ message: 'Invalid user role found in database.' });
    }

    // 5. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Again, "Invalid credentials" is safer than "Invalid password"
      return res.status(400).json({ message: 'Invalid credentials for the need' });
    }

    // 6. Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string, // Ensure JWT_SECRET is set in your .env
      { expiresIn: '1d' }
    );

    // 7. Determine redirect path
    const redirectTo = user.role === 'student' ? '/student' : '/admin';

    // 8. Send success response
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      redirectTo
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};