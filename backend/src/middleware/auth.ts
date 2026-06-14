import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { prisma } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('Error: JWT_SECRET is not defined.');
  process.exit(1);
}

export interface AuthRequest extends Request {
  userId?: number;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not found.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Authentication failed:', error);
    return res.status(403).json({ error: 'Invalid token.' });
  }
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Brak dostępu. Zaloguj się.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Brak uprawnień administratora.' });
    }

    next();
  } catch (error) {
    console.error('Błąd weryfikacji roli:', error);
    return res.status(500).json({ error: 'Wystąpił błąd serwera.' });
  }
};
