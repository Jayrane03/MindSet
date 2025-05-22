import { Request, Response } from 'express';
import User from '../models/User';

export const getStudentData = async (req: Request, res: Response) => {
  console.log('getStudentData controller function called.'); // Add this
  try {
    const students = await User.find({ role: 'student' }).select('-password').populate('documents').populate('messages').exec();
    console.log(`Found ${students.length} students.`); // Add this
    res.json(students);
  } catch (error) {
    console.error('Error fetching student data in controller:', error); // Add this
    res.status(500).json({ message: 'Server error while fetching student data.' });
  }
};