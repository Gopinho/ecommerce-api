import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string; 
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: req.__('token.required') });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token) as { id: string; role: string; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: req.__('token.invalid') });
  }
}
