import type { Role, User } from '@prisma/client';
import type { AuthUser } from '../../types/express';
import { AppError } from '../../common/utils/app-error';
import { firebaseAuth, hasFullFirebaseCredentials } from '../../database/firebase';
import { bootstrapAdminEmails } from '../../config/env';
import type { IUsersRepository, ListUsersInput, UpsertFromFirebaseInput } from './users.repository';

export class UsersService {
  constructor(private readonly repo: IUsersRepository) {}

  async ensureFromToken(decoded: { uid: string; email?: string; emailVerified?: boolean; name?: string; picture?: string }): Promise<User> {
    if (!decoded.email) {
      throw new AppError(401, 'UNAUTHENTICATED', 'Token has no email claim');
    }
    const input: UpsertFromFirebaseInput = {
      id: decoded.uid,
      email: decoded.email.toLowerCase(),
      displayName: decoded.name ?? null,
      photoURL: decoded.picture ?? null,
      forceAdmin: decoded.emailVerified === true && bootstrapAdminEmails.includes(decoded.email.toLowerCase())
    };
    return this.repo.upsertFromFirebase(input);
  }

  toAuthUser(user: User, emailVerified: boolean): AuthUser {
    return { uid: user.id, email: user.email, role: user.role, emailVerified };
  }

  async session(uid: string, displayName?: string): Promise<User> {
    if (displayName !== undefined && displayName.length > 0) {
      return this.repo.updateProfile(uid, { displayName });
    }
    const user = await this.repo.findById(uid);
    if (!user) throw AppError.notFound('User');
    return user;
  }

  list(uid: string, input: ListUsersInput): Promise<{ items: User[]; total: number }> {
    void uid;
    return this.repo.list(input);
  }

  async setRole(requesterUid: string, targetId: string, role: Role): Promise<User> {
    if (requesterUid === targetId && role !== 'ADMIN') {
      throw new AppError(422, 'INVALID_INPUT', 'Admins cannot demote themselves');
    }
    const user = await this.repo.setRole(targetId, role);
    if (hasFullFirebaseCredentials) {
      await firebaseAuth.setCustomUserClaims(targetId, { role });
    } else {
      console.warn(
        'FIREBASE_SERVICE_ACCOUNT_KEY not configured — role saved to database only; ' +
          'Firebase custom claim skipped. Authorization is database-driven, so this is safe. ' +
          'Add the service account key to enable claim syncing (see .env.example).'
      );
    }
    return user;
  }
}
