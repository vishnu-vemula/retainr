import type { Role } from '@prisma/client';

export interface AuthUser {
  uid: string;
  email: string;
  role: Role;
  emailVerified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
