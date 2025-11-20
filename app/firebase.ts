import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCp-F61e9ngKInplwX6dVFp0Tou2__31M0",
  authDomain: "workout-builder-792ff.firebaseapp.com",
  databaseURL: "https://workout-builder-792ff-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "workout-builder-792ff",
  storageBucket: "workout-builder-792ff.firebasestorage.app",
  messagingSenderId: "323314630132",
  appId: "1:323314630132:web:64781495dccd7e3bb08da1",
  measurementId: "G-QEBEHC1JY1"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, googleProvider, analytics };
