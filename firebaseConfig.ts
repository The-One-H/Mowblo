
import { initializeApp, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore'

// Optionally import the services that you want to use
// import {...} from 'firebase/auth';
// import {...} from 'firebase/database';
// import {...} from 'firebase/firestore';
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBYXo2Q5KQP2DCBIQYjUEDoZCEX4ikHzoA",
  authDomain:  "mowblo.firebaseapp.com",
  databaseURL: 'https://project-id.firebaseio.com',
  projectId: "mowblo",
  storageBucket:"mowblo.firebasestorage.app",
  messagingSenderId: "462578654049",
  appId:  "1:462578654049:web:5bdae84bf10fd939708320",
  measurementId: "G-RTV52ZMQJF",
};

// initialize Firebase App
const app = initializeApp(firebaseConfig);

// Connect to Firestore database
const db = getFirestore(app)

// initialize Firebase Auth
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { app, db, auth, getApp, getAuth };