// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
// import User from '../models/User'; // Assuming you have a User model to verify roles

interface CustomRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}


// Extend the Request interface if using TypeScript
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]; // This extracts the token part

            // Verify token
            // G:\Minset\backend\src\middleware\authMiddleware.ts:19:38 (This is likely the line that throws the error)
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

            // Attach user to the request
            req.user = await User.findById(decoded.id).select('-password'); // Select user without password

            // Check if user exists
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next(); // Continue to the next middleware/route handler
        } catch (error: any) {
            console.error('Token error:', error.name, error.message); // Log the specific JWT error
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Not authorized, token failed: jwt malformed' }); // More specific message
            }
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// ... (your authorize function)
export const authorize = (roles: string[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to access this route' });
        }
        next();
    };
};