import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { defaultFirebaseConfig } from './firebaseConfigData';

// Initialize Firebase App instance safely with embedded configuration
export const app = getApps().length === 0 ? initializeApp(defaultFirebaseConfig) : getApps()[0];

// Export Auth instance
export const auth = getAuth(app);

// Export Firestore instance configured with the assigned database ID
export const db = defaultFirebaseConfig.firestoreDatabaseId && defaultFirebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, defaultFirebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

