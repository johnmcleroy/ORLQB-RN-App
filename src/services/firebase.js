/**
 * Firebase Configuration for ORLQB React Native App
 * 
 * This replaces the Angular environment files with a more direct approach.
 * Uses platform-specific Firebase SDKs: native for mobile, web for browser.
 */

import { Platform } from 'react-native';

// Firebase config from your original Ionic app
const firebaseConfig = {
  apiKey: "AIzaSyAqCWig0L0spfRpBUsL_VsgwxwSqtKzIPI",
  authDomain: "orlqb.firebaseapp.com",
  databaseURL: "https://orlqb.firebaseio.com",
  projectId: "firebase-orlqb",
  storageBucket: "firebase-orlqb.appspot.com",
  messagingSenderId: "230654055784",
  appId: "1:230654055784:web:ad58ed108b8e4c2fe8f2dd",
  measurementId: "G-28Y3N8DK92"
};

let auth, firestore, app;

if (Platform.OS === 'web') {
  // Web Firebase SDK
  const { initializeApp, getApps } = require('firebase/app');
  const { getAuth } = require('firebase/auth');
  const { getFirestore } = require('firebase/firestore');
  
  // Initialize Firebase for web
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  auth = () => getAuth(app);
  firestore = () => getFirestore(app);
} else {
  // React Native Firebase SDK (for iOS/Android)
  const { initializeApp, getApps } = require('@react-native-firebase/app');
  const rnAuth = require('@react-native-firebase/auth').default;
  const rnFirestore = require('@react-native-firebase/firestore').default;
  
  // Initialize Firebase for native
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  auth = rnAuth;
  firestore = rnFirestore;
}

// Export the services we'll use throughout the app
export { auth, firestore };
export default app;

/**
 * LEARNING NOTE:
 * 
 * Unlike Angular where you import AngularFireModule in app.module.ts,
 * React Native Firebase is initialized once here and imported where needed.
 * 
 * Benefits over Ionic/Angular approach:
 * 1. Native Firebase SDK = better performance
 * 2. Smaller bundle size
 * 3. Better offline support
 * 4. Push notifications work properly
 * 5. Simpler import pattern
 */