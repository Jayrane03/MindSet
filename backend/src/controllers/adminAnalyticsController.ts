import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler'; // If you're using this library for async error handling
import User, { IUser } from '../models/User'; // Import your User model and its interface

// Helper function for the chatbot usage card, if it's in this controller
// (Assuming this returns { averageDailyHours: number })
export const getChatbotUsageForCard = asyncHandler(async (req: Request, res: Response) => {
  // Implement actual logic to calculate average daily chatbot usage hours
  // This is a placeholder
  const mockAverageDailyHours = 0.75; // Replace with actual aggregation
  res.status(200).json({ averageDailyHours: mockAverageDailyHours });
});


// @desc    Get student activity chart data (students joined per month)
// @route   GET /api/admin/student-activity-chart-data
// @access  Private/Admin
export const getStudentActivityChartData = asyncHandler(async (req: Request, res: Response) => {
  try {
    const studentsByMonth = await User.aggregate([
      {
        $match: {
          role: 'student'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, // Group by year-month
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 } // Sort by date ascending
      }
    ]);
// Admin Controller.ts
    // Format data for the frontend chart (labels and data for a single dataset)
    const labels = studentsByMonth.map(data => data._id);
    const dataPoints = studentsByMonth.map(data => data.count);

    res.status(200).json({
      labels: labels,
      datasets: [{
        label: 'New Students Registered',
        data: dataPoints,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      }]
    });
  } catch (error: any) {
    console.error('Error in getStudentActivityChartData:', error);
    res.status(500).json({ message: 'Server Error fetching student activity chart data' });
  }
});