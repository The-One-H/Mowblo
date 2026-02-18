
import { initializeApp, getApp } from "firebase/app";
//@ts-ignore
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration — Mowblo production project
const firebaseConfig = {
  apiKey: "AIzaSyBKVWWbiKfnuIfRih2N3V_vyNnYgS9X3xQ",
  authDomain: "mowblo-2097b.firebaseapp.com",
  projectId: "mowblo-2097b",
  storageBucket: "mowblo-2097b.firebasestorage.app",
  messagingSenderId: "506168419903",
  appId: "1:506168419903:web:f1d6d214147138726d7a8a",
  measurementId: "G-DWPG3GRWCC",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Auth with React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { app, db, auth, getApp, getAuth };