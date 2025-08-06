/**
 * App.js - Main Application Entry Point
 * 
 * This replaces your Angular main.ts and app.component.ts files.
 * React Native apps have a single entry point that sets up the entire app.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import our main components
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Main App Component
 * 
 * This is the root of your entire application. It:
 * 1. Provides authentication context to all child components
 * 2. Sets up safe area handling for device notches/status bars
 * 3. Initializes the main navigation system
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="light" backgroundColor="#3880ff" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

/**
 * LEARNING NOTES:
 * 
 * 1. App Structure:
 *    - Angular: Multiple modules, complex bootstrapping
 *    - React Native: Single entry point with nested providers
 * 
 * 2. Context Providers:
 *    - AuthProvider wraps the entire app to provide auth state
 *    - Similar to Angular's root-level services but simpler
 * 
 * 3. Safe Area Provider:
 *    - Handles device-specific layouts (iPhone notch, Android status bar)
 *    - Much easier than CSS env() variables in web
 * 
 * 4. Status Bar:
 *    - Native status bar control
 *    - style="light" = white text for dark backgrounds
 * 
 * 5. No Routing Module:
 *    - Navigation is handled by NavigationContainer in AppNavigator
 *    - No need for separate routing configuration files
 * 
 * This single file replaces multiple Angular bootstrap files!
 */
