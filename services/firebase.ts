
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import * as firebaseAuth from "firebase/auth";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  Firestore
} from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

// --- FIREBASE CONFIGURATION ---
// TODO: Replace these values with your actual Firebase Project keys
// You can find these in Firebase Console -> Project Settings -> General -> "Your apps"
const firebaseConfig = {
  apiKey: "AIzaSyD_-BFQxbJ5FjCAgFzXD14T4V4G-nBgrkY",
  authDomain: "kass-oma.firebaseapp.com",
  projectId: "kass-oma",
  storageBucket: "kass-oma.firebasestorage.app",
  messagingSenderId: "262461043730",
  appId: "1:262461043730:web:e00e93feee8a13ff4d14cb",
  measurementId: "G-NE2NWFRBET"
};

// 1. Initialize App (Singleton pattern)
// We check if an app is already initialized to prevent "Firebase App named '[DEFAULT]' already exists" errors during hot-reload.
let app: FirebaseApp;
let auth: firebaseAuth.Auth;
let db: Firestore;
let analytics: Analytics | undefined;

try {
    if (getApps().length > 0) {
      app = getApp();
    } else {
      app = initializeApp(firebaseConfig);
    }

    // 2. Initialize Auth
    // The "Component auth has not been registered yet" error usually happens if there's a mismatch 
    // between the app instance and the auth module. By strictly using the app instance we just got/created,
    // we ensure consistency.
    auth = firebaseAuth.getAuth(app);

    // 3. Initialize Firestore with Offline Persistence
    // We try to initialize with specific settings. If it fails (e.g., already initialized with different settings),
    // we fallback to getFirestore(app).
    try {
        db = initializeFirestore(app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager()
            })
        });
    } catch (e) {
        // If Firestore is already initialized (e.g. from a previous hot reload), use the existing instance
        db = getFirestore(app);
    }

    // 4. Initialize Analytics (Safely)
    // Check if supported first (prevents errors in environments with strict privacy blocking)
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    }).catch((e) => {
      console.log("Analytics not supported/failed:", e);
    });

    console.log("Firebase initialized:", app.name);

} catch (error) {
    console.error("Critical Firebase Initialization Error:", error);
    // In a real app, you might want to show a fallback UI here, 
    // but for now we let the app crash or handle the undefined exports in services.
    throw error;
}

export { app, auth, db, analytics };
