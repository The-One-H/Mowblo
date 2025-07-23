
import { initializeApp, getApp } from "firebase/app";
//@ts-ignore
import { initializeAuth, getAuth, getReactNativePersistence, signInWithCustomToken } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import { useAuth } from "@clerk/clerk-expo";

import type { GetToken } from '@clerk/types'
import { useCallback } from "react";

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

class DatabaseQuery {
  getToken: GetToken | undefined;
  userId: string | null | undefined;
  
  constructor() {
    const { getToken, userId } = useAuth()

    if (!userId) { return; }
    this.getToken = getToken;
    this.userId = userId;
  }

  /**
   * Passes data acquired from the Firestore database to given setter functions.
   * 
   * Nested data to be retrieved must be seperated in the `key` via periods. As an example, `names.first` would be valid (if it existed in the database).
   * 
   * Leave target blank to query all data.
   */
  public getFirestoreData = useCallback(async (
    targets?: {
      key: string,
      setters: Function[]
    }[] | null | undefined,
    mainSetter?: Function | null | undefined
  ) => {
    if (!this.userId) {
      console.error('User not logged in!')
      return;
    }
    
    const docRef = doc(db, 'users', this.userId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data())
      if (typeof targets !== "undefined" && targets) {
        targets.forEach(target => {
          let current: any = docSnap.data()
          target.key.split('.').every(val => {
            
            if (!(val in current)) {
              current = null;
              return false;
            }
            current = current[val]
            return true;
          });
          target.setters.forEach(setter => {
            setter(current);
          });
        });
      } else if (typeof mainSetter !== "undefined" && mainSetter) {
        mainSetter(docSnap.data());
      } else {
        throw new Error('Unsupported arguments passed!')
      }
    } else {
      // docSnap.data() will be undefined in this case
      console.log('No such document!')
    }

    return;
  }, [])

  public signIntoFirebaseWithClerk = useCallback(async () => {
    if (!this.getToken) {
      console.error('User not logged in!')
      return;
    }

    const token = await this.getToken({ template: 'integration_firebase' })

    const userCredentials = await signInWithCustomToken(auth, token || '')
    // The userCredentials.user object can call the methods of
    // the Firebase platform as an authenticated user.
    console.log('User:', userCredentials.user)
  }, [])

  public writeFirestoreData = useCallback(async (data: any) => {
    if (!this.userId) {
      console.error('User not logged in!')
      return;
    }

    try {
      const docRef = await setDoc(doc(db, 'users', this.userId), data)
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }, [])
}


export { app, db, auth, getApp, getAuth, DatabaseQuery };