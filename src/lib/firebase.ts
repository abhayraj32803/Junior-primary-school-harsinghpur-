import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  verifyPasswordResetCode,
  confirmPasswordReset,
  checkActionCode,
  applyActionCode
} from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore, 
  setLogLevel,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  getDocFromServer,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL
} from 'firebase/storage';

// Read config from firebase-applet-config.json
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);
export const storage = getStorage(app);

export const firebaseProjectId = firebaseConfig.projectId;
export const firestoreDatabaseId = firebaseConfig.firestoreDatabaseId || '(default)';

// Keep error-level logs visible while suppressing noisy info polling
try {
  setLogLevel('error');
} catch {
  // ignore
}

// Helper to recursively strip undefined properties from documents before sending to Firestore
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        result[key] = sanitizeForFirestore(value);
      }
    }
    return result as T;
  }
  return data;
}

// Initialize Firestore with specific database ID and enable ignoreUndefinedProperties
export const db = (() => {
  try {
    return initializeFirestore(app, {
      ignoreUndefinedProperties: true
    }, firebaseConfig.firestoreDatabaseId);
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
})();

export type FirestoreConnectionState =
  | 'connecting'
  | 'connected'
  | 'offline'
  | 'permission-error'
  | 'error';

export interface FirestoreConnectionDiagnostics {
  status: FirestoreConnectionState;
  projectId: string;
  databaseId: string;
  lastCheckedAt: string | null;
  latencyMs: number | null;
  errorMessage: string | null;
  authUid: string | null;
  authEmail: string | null;
}

let currentDiagnostics: FirestoreConnectionDiagnostics = {
  status: 'connecting',
  projectId: firebaseProjectId,
  databaseId: firestoreDatabaseId,
  lastCheckedAt: null,
  latencyMs: null,
  errorMessage: null,
  authUid: null,
  authEmail: null,
};

const connectionListeners = new Set<(diag: FirestoreConnectionDiagnostics) => void>();

function notifyConnectionListeners(next: FirestoreConnectionDiagnostics) {
  currentDiagnostics = next;
  connectionListeners.forEach((cb) => {
    try {
      cb(next);
    } catch {
      // ignore listener errors
    }
  });
}

export function getFirestoreConnectionStatus(): FirestoreConnectionDiagnostics {
  return {
    ...currentDiagnostics,
    authUid: auth.currentUser?.uid || null,
    authEmail: auth.currentUser?.email || null,
  };
}

export function subscribeFirestoreConnection(
  cb: (diag: FirestoreConnectionDiagnostics) => void
): () => void {
  connectionListeners.add(cb);
  cb(getFirestoreConnectionStatus());
  return () => {
    connectionListeners.delete(cb);
  };
}

// Validate Connection to Firestore against the live server
export async function checkFirestoreConnection(): Promise<FirestoreConnectionDiagnostics> {
  const startedAt = Date.now();
  notifyConnectionListeners({
    ...currentDiagnostics,
    status: 'connecting',
    authUid: auth.currentUser?.uid || null,
    authEmail: auth.currentUser?.email || null,
  });

  try {
    // Primary server probe (publicly readable health check path)
    await getDocFromServer(doc(db, 'test', 'connection'));
    const next: FirestoreConnectionDiagnostics = {
      status: 'connected',
      projectId: firebaseProjectId,
      databaseId: firestoreDatabaseId,
      lastCheckedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      errorMessage: null,
      authUid: auth.currentUser?.uid || null,
      authEmail: auth.currentUser?.email || null,
    };
    notifyConnectionListeners(next);
    return next;
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    const code = error?.code || '';

    // Fallback check against public settings document if /test/connection rule isn't deployed yet
    if (code === 'permission-denied' || msg.toLowerCase().includes('permission')) {
      try {
        await getDocFromServer(doc(db, 'settings', 'school_config'));
        const next: FirestoreConnectionDiagnostics = {
          status: 'connected',
          projectId: firebaseProjectId,
          databaseId: firestoreDatabaseId,
          lastCheckedAt: new Date().toISOString(),
          latencyMs: Date.now() - startedAt,
          errorMessage: null,
          authUid: auth.currentUser?.uid || null,
          authEmail: auth.currentUser?.email || null,
        };
        notifyConnectionListeners(next);
        return next;
      } catch (fallbackErr: any) {
        const fbMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        const isOffline = fbMsg.includes('the client is offline') || fallbackErr?.code === 'unavailable';
        const next: FirestoreConnectionDiagnostics = {
          status: isOffline ? 'offline' : 'permission-error',
          projectId: firebaseProjectId,
          databaseId: firestoreDatabaseId,
          lastCheckedAt: new Date().toISOString(),
          latencyMs: Date.now() - startedAt,
          errorMessage: fbMsg,
          authUid: auth.currentUser?.uid || null,
          authEmail: auth.currentUser?.email || null,
        };
        notifyConnectionListeners(next);
        return next;
      }
    }

    const isOffline = msg.includes('the client is offline') || code === 'unavailable';
    if (isOffline) {
      console.warn('Please check your Firebase configuration. Firestore client running in offline mode.');
    }

    const next: FirestoreConnectionDiagnostics = {
      status: isOffline ? 'offline' : 'error',
      projectId: firebaseProjectId,
      databaseId: firestoreDatabaseId,
      lastCheckedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      errorMessage: msg,
      authUid: auth.currentUser?.uid || null,
      authEmail: auth.currentUser?.email || null,
    };
    notifyConnectionListeners(next);
    return next;
  }
}

// Run startup connection verification
void checkFirestoreConnection();

// Refresh auth identity inside diagnostics whenever Firebase Auth state updates
onAuthStateChanged(auth, (user) => {
  notifyConnectionListeners({
    ...currentDiagnostics,
    authUid: user?.uid || null,
    authEmail: user?.email || null,
  });
});

const rawSetDoc = setDoc;
export const safeSetDoc: typeof setDoc = ((reference: any, data: any, options?: any) => {
  const sanitized = sanitizeForFirestore(data);
  return options ? (rawSetDoc as any)(reference, sanitized, options) : (rawSetDoc as any)(reference, sanitized);
}) as typeof setDoc;

const rawUpdateDoc = updateDoc;
export const safeUpdateDoc: typeof updateDoc = ((reference: any, ...args: any[]) => {
  if (typeof args[0] === 'object') {
    return (rawUpdateDoc as any)(reference, sanitizeForFirestore(args[0]));
  }
  return (rawUpdateDoc as any)(reference, ...args);
}) as typeof updateDoc;

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  verifyPasswordResetCode,
  confirmPasswordReset,
  checkActionCode,
  applyActionCode,
  collection,
  doc,
  getDoc,
  getDocs,
  getDocFromServer,
  safeSetDoc as setDoc,
  safeUpdateDoc as updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  onSnapshot,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL
};
