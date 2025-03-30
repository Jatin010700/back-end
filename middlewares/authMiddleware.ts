import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';
import dotenv from 'dotenv';
dotenv.config();

// Middleware to check if the user is authenticated
export const requireUserRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    await verifyToken(token);
    next();
  } catch (err) {
    res.status(403).json({ message: "Verification failed" })
    return;
  }
};

// Protect route using api
export const protectedRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.PUBLIC_KEY) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  next();
}