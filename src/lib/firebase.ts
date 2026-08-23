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
  getRedirectResult
} from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore, 
  setLogLevel,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
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

// Read config from firebase-applet-config.json or fallback
let firebaseConfig = {
  projectId: "gen-lang-client-0870597145",
  appId: "1:915090148427:web:fd8f53e9255f79fb7011ce",
  apiKey: "AIzaSyDr38orHZ3zCyA8-TBDSKKhFVtinnzpESg",
  authDomain: "gen-lang-client-0870597145.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-schoolmanagement-e7f18a16-9738-4787-887c-1a8ba88500c0",
  storageBucket: "gen-lang-client-0870597145.firebasestorage.app",
  messagingSenderId: "915090148427",
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);
export const storage = getStorage(app);

// Set Firestore log level to error to avoid noisy offline warning notices in console
try {
  setLogLevel('error');
} catch (e) {
  // ignore
}

// Use custom firestore database ID with auto-detect long polling for maximum reliability
export const db = (() => {
  try {
    const dbId = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
      ? firebaseConfig.firestoreDatabaseId
      : undefined;

    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true
    }, dbId);
  } catch (e) {
    // If already initialized or fallback
    return firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
})();

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
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL
};
