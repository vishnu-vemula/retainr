import { applicationDefault, cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from '../config/env';

function readServiceAccount(): ServiceAccount | undefined {
  if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY) as ServiceAccount;
  }
  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
  }
  return undefined;
}

const account = readServiceAccount();
const hasAcd = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

export const hasFullFirebaseCredentials = Boolean(account || hasAcd);

if (getApps().length === 0) {
  if (account) {
    initializeApp({ credential: cert(account) });
  } else if (hasAcd) {
    initializeApp({ credential: applicationDefault() });
  } else if (env.FIREBASE_PROJECT_ID) {
    initializeApp({ projectId: env.FIREBASE_PROJECT_ID });
  } else {
    initializeApp({ credential: applicationDefault() });
  }
}

export const firebaseAuth = getAuth();
