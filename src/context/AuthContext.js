/**
 * AuthContext - Global Authentication State Management
 * 
 * This replaces your Angular authentication.service.ts with React's Context API.
 * Context API is React's built-in way to share state between components.
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { auth } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserRole, createUserProfile, initializeSudoAdmin, initializeTestUser, HANGAR_ROLES } from '../utils/userRoles';

// Create the context
const AuthContext = createContext({});

/**
 * AuthProvider Component
 * 
 * This wraps your entire app and provides authentication state to all components.
 * Think of it like Angular's root-level service, but simpler.
 */
export const AuthProvider = ({ children }) => {
  // State management using React hooks (replaces Angular's BehaviorSubject)
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(HANGAR_ROLES.GUEST);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  /**
   * useEffect replaces Angular's OnInit lifecycle
   * This runs when the component mounts and sets up auth listener
   */
  useEffect(() => {
    // Load introduction status from storage
    loadIntroStatus();

    // Firebase auth state listener (platform-specific)
    let unsubscribe;
    
    if (Platform.OS === 'web') {
      // Web Firebase SDK v9+ uses onAuthStateChanged differently
      const { onAuthStateChanged } = require('firebase/auth');
      const authInstance = auth();
      unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
        console.log('Web auth state changed:', firebaseUser);
        await handleUserChange(firebaseUser);
      });
    } else {
      // React Native Firebase SDK
      unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
        console.log('Native auth state changed:', firebaseUser);
        await handleUserChange(firebaseUser);
      });
    }

    // Cleanup function (replaces Angular's OnDestroy)
    return unsubscribe;
  }, []);

  // Handle user authentication state changes
  const handleUserChange = async (firebaseUser) => {
    try {
      if (firebaseUser) {
        // User signed in
        setUser(firebaseUser);
        
        // Initialize sudo admin if needed
        await initializeSudoAdmin(firebaseUser);
        
        // Initialize test user if needed
        await initializeTestUser(firebaseUser);
        
        // Get user role
        const role = await getUserRole(firebaseUser);
        setUserRole(role);
        
        // Create/update user profile
        await createUserProfile(firebaseUser, role);
        
        console.log(`✅ User authenticated: ${firebaseUser.email} (${role})`);
      } else {
        // User signed out
        setUser(null);
        setUserRole(HANGAR_ROLES.GUEST);
        console.log('❌ User signed out');
      }
    } catch (error) {
      console.error('Error handling user change:', error);
      setUser(firebaseUser);
      setUserRole(HANGAR_ROLES.GUEST);
    }
    
    setIsLoading(false);
  };

  // Load introduction status from local storage
  const loadIntroStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('intro_completed');
      console.log('AuthContext: loadIntroStatus - AsyncStorage value:', status);
      setHasSeenIntro(status === 'true');
      console.log('AuthContext: setHasSeenIntro to:', status === 'true');
    } catch (error) {
      console.log('Error loading intro status:', error);
    }
  };

  // Sign in function with enhanced error handling
  const signIn = async (email, password) => {
    try {
      let result;
      
      if (Platform.OS === 'web') {
        // Web Firebase SDK v9+
        const { signInWithEmailAndPassword } = require('firebase/auth');
        const authInstance = auth();
        result = await signInWithEmailAndPassword(authInstance, email, password);
        console.log('Web sign in successful:', result.user);
      } else {
        // React Native Firebase SDK
        result = await auth().signInWithEmailAndPassword(email, password);
        console.log('Native sign in successful:', result.user);
      }
      
      return { success: true, user: result.user };
    } catch (error) {
      console.log('Sign in error:', error);
      let errorMessage = 'An error occurred';
      
      // Parse Firebase error codes to user-friendly messages
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Invalid username';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Invalid password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Sign up function with member data
  const signUp = async (email, password, memberData = {}) => {
    try {
      let result;
      
      if (Platform.OS === 'web') {
        const { createUserWithEmailAndPassword } = require('firebase/auth');
        const authInstance = auth();
        result = await createUserWithEmailAndPassword(authInstance, email, password);
      } else {
        result = await auth().createUserWithEmailAndPassword(email, password);
      }

      // Create user profile with additional member data
      if (result.user) {
        const profileData = {
          ...memberData,
          uid: result.user.uid,
          email: result.user.email,
          createdAt: new Date().toISOString(),
          role: 'guest', // Default role until approved
          status: memberData.status || 'U' // Unknown until approved
        };

        console.log('Creating user profile with data:', profileData);
        await createUserProfile(result.user.uid, profileData);
      }

      return { success: true, user: result.user };
    } catch (error) {
      console.error('SignUp error:', error);
      return { success: false, error: error.message };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      if (Platform.OS === 'web') {
        const { signOut: firebaseSignOut } = require('firebase/auth');
        const authInstance = auth();
        await firebaseSignOut(authInstance);
        console.log('Web sign out successful');
      } else {
        await auth().signOut();
        console.log('Native sign out successful');
      }
      
      // Clear local state immediately
      setUser(null);
      setUserRole(HANGAR_ROLES.GUEST);
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  };

  // Password reset function
  const resetPassword = async (email) => {
    try {
      if (Platform.OS === 'web') {
        const { sendPasswordResetEmail } = require('firebase/auth');
        const authInstance = auth();
        await sendPasswordResetEmail(authInstance, email);
      } else {
        await auth().sendPasswordResetEmail(email);
      }
      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
      let errorMessage = 'Failed to send password reset email';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Update introduction status
  const updateHasSeenIntro = async (status) => {
    try {
      await AsyncStorage.setItem('intro_completed', status.toString());
      setHasSeenIntro(status);
    } catch (error) {
      console.log('Error saving intro status:', error);
    }
  };

  // Context value - all the data and functions available to child components
  const value = {
    user,
    userRole,
    isLoading,
    hasSeenIntro,
    setHasSeenIntro,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateHasSeenIntro,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 
 * This is a custom hook that makes it easy to use auth context in any component.
 * Instead of injecting services like in Angular, you just call useAuth().
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * LEARNING NOTES FOR YOU:
 * 
 * 1. Context API vs Angular Services:
 *    - Angular: Inject service in component constructor
 *    - React: Call useAuth() hook anywhere in component
 * 
 * 2. State Management:
 *    - Angular: BehaviorSubject with subscribe/unsubscribe
 *    - React: useState with automatic re-renders when state changes
 * 
 * 3. Lifecycle:
 *    - Angular: OnInit, OnDestroy interfaces
 *    - React: useEffect with dependency array and cleanup function
 * 
 * 4. Async Storage:
 *    - Replaces browser localStorage
 *    - Works on both iOS and Android
 *    - Persists data between app sessions
 * 
 * This pattern is much simpler than Angular's dependency injection!
 */