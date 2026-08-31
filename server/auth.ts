import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db, saveDb, hashPin, generateSecureToken } from './db';
import { User } from '../src/types';

// In-memory math challenges with 3-minute expiration
interface MathChallenge {
  id: string;
  question: string;
  answer: number;
  expiresAt: number;
}

const activeChallenges: Record<string, MathChallenge> = {};

// Clean up expired math challenges periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(activeChallenges).forEach(id => {
    if (activeChallenges[id].expiresAt < now) {
      delete activeChallenges[id];
    }
  });
}, 60000);

export function generateMathChallenge(): { id: string; question: string } {
  const num1 = Math.floor(Math.random() * 12) + 2;
  const num2 = Math.floor(Math.random() * 12) + 1;
  const isAddition = Math.random() > 0.3;

  const question = isAddition ? `${num1} + ${num2} = ?` : `${num1 + num2} - ${num1} = ?`;
  const answer = isAddition ? num1 + num2 : num2;
  const id = `mc_${crypto.randomBytes(8).toString('hex')}`;

  activeChallenges[id] = {
    id,
    question,
    answer,
    expiresAt: Date.now() + 3 * 60 * 1000, // 3 minutes
  };

  return { id, question };
}

export function verifyMathChallenge(id: string, userAnswer: number | string): boolean {
  if (!id || !activeChallenges[id]) return false;
  const challenge = activeChallenges[id];

  if (Date.now() > challenge.expiresAt) {
    delete activeChallenges[id];
    return false;
  }

  // Normalize user answer (handles Arabic numbers too)
  const normalizedStr = String(userAnswer).replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
  const parsedNum = parseInt(normalizedStr, 10);
  const isValid = parsedNum === challenge.answer;

  // Single-use challenge: delete immediately
  delete activeChallenges[id];
  return isValid;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function createSession(userId: string): { token: string; expiresAt: number } {
  const token = generateSecureToken('sess');
  const expiresAt = Date.now() + 30 * 86400 * 1000; // 30 days
  db.sessions[token] = { userId, expiresAt };
  saveDb();
  return { token, expiresAt };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.tourvia_token) {
    token = req.cookies.tourvia_token;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const session = db.sessions[token];
  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      delete db.sessions[token];
      saveDb();
    }
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    return;
  }

  const user = db.users.find(u => u.id === session.userId);
  if (!user) {
    res.status(401).json({ error: 'User account not found.' });
    return;
  }

  req.user = user;
  next();
}

export function adminOnlyMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  authMiddleware(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied. Admin privileges required.' });
      return;
    }
    next();
  });
}
