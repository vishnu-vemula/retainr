import type { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error';
import { asyncHandler } from '../utils/async-handler';
import { firebaseAuth } from '../../database/firebase';
import type { UsersService } from '../../features/users/users.service';

export class AuthMiddleware {
  constructor(private readonly users: UsersService) {}

  requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
    void asyncHandler(async (innerReq: Request, _innerRes: Response, innerNext: NextFunction) => {
      const header = innerReq.headers.authorization;
      if (!header?.startsWith('Bearer ')) {
        throw new AppError(401, 'UNAUTHENTICATED', 'Missing bearer token');
      }
      let decoded: { uid: string; email?: string; email_verified?: boolean; name?: string; picture?: string };
      try {
        decoded = await firebaseAuth.verifyIdToken(header.slice(7));
      } catch {
        throw new AppError(401, 'UNAUTHENTICATED', 'Invalid or expired token');
      }
      const user = await this.users.ensureFromToken({
        uid: decoded.uid,
        email: decoded.email,
        emailVerified: decoded.email_verified,
        name: decoded.name,
        picture: decoded.picture
      });
      innerReq.user = this.users.toAuthUser(user, decoded.email_verified === true && decoded.email?.toLowerCase() === user.email.toLowerCase());
      innerNext();
    })(req, _res, next);
  };

  requireRole(role: Role) {
    return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
      if (req.user?.role !== role) {
        throw new AppError(403, 'FORBIDDEN', `This action requires the ${role} role`);
      }
      if (role === 'ADMIN' && !req.user.emailVerified) {
        throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Verify your email before using admin features');
      }
      next();
    });
  }
}
