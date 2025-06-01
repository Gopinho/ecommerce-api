import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticate';

export function authorizeRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: req.__('auth.not_authenticated') });

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: req.__('auth.access_denied') });
    }

    next();
  };
}
