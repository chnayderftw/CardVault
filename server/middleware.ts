import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise_marketplace_jwt_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
    fullName: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User account not found or deactivated.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token.' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
  }
  next();
}

// Basic rate limiting helper in-memory
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(maxRequests = 100, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
    } else {
      clientData.count++;
    }

    rateLimitMap.set(ip, clientData);

    if (clientData.count > maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please slow down and try again.' });
    }

    next();
  };
}

// Sanitize message content to block sharing raw payment credentials
export function sanitizeMessageContent(content: string): string {
  // Pattern matching 13-19 digit card numbers or CVV keywords
  const cardPattern = /\b(?:\d[ -]*?){13,19}\b/g;
  const sensitiveKeywords = /\b(cvv|cvc|exp date|pin number)\b/gi;

  if (cardPattern.test(content) || sensitiveKeywords.test(content)) {
    return '[REDACTED: Security Policy prohibits exchanging sensitive card numbers or CVV in private chat]';
  }
  return content;
}
