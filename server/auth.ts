import { Request, Response, NextFunction } from 'express';
import { db, saveDb, hashPin, generateSecureToken } from './db';
import { User } from '../src/types';

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
