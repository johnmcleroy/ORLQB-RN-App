/**
 * AppNavigator - Main Navigation Logic
 * 
 * This replaces your Angular app-routing.module.ts with React Navigation.
 * React Navigation uses a component-based approach instead of route definitions.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../screens/LoadingScreen';
import IntroScreen from '../screens/auth/IntroScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import TabNavigator from './TabNavigator';

// Member Portal Screens
import MemberDirectoryScreen from '../screens/members/MemberDirectoryScreen';
import MeetingMinutesScreen from '../screens/members/MeetingMinutesScreen';
import MemberResourcesScreen from '../screens/members/MemberResourcesScreen';
import EventSignInScreen from '../screens/members/EventSignInScreen';
import MemberNotificationsScreen from '../screens/members/MemberNotificationsScreen';

const Stack = createStackNavigator();

/**
 * AppNavigator Component
 * 
 * This is the main navigation component that decides which screens to show
 * based on authentication state. Similar to Angular guards but simpler.
 */
const AppNavigator = () => {
  const { user, isLoading, hasSeenIntro, setHasSeenIntro } = useAuth();

  console.log('AppNavigator: isLoading=', isLoading, 'hasSeenIntro=', hasSeenIntro, 'user=', user ? 'authenticated' : 'not authenticated');

  /**
   * Show loading screen while checking auth state
   * This prevents flickering between auth and main screens
   */
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenIntro ? (
          // First time user - show intro screen
          <Stack.Screen name="Intro">
            {() => <IntroScreen onComplete={() => setHasSeenIntro(true)} />}
          </Stack.Screen>
        ) : user ? (
          // User is authenticated - show main app with tabs and member screens
          <>
            <Stack.Screen name="MainApp" component={TabNavigator} />
            <Stack.Screen name="MemberDirectory" component={MemberDirectoryScreen} />
            <Stack.Screen name="MeetingMinutes" component={MeetingMinutesScreen} />
            <Stack.Screen name="MemberResources" component={MemberResourcesScreen} />
            <Stack.Screen name="EventSignIn" component={EventSignInScreen} />
            <Stack.Screen name="MemberNotifications" component={MemberNotificationsScreen} />
          </>
        ) : (
          // User not authenticated - show auth flow
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

/**
 * LEARNING NOTES:
 * 
 * 1. React Navigation vs Angular Router:
 *    - Angular: Define routes in arrays with path strings
 *    - React: Stack screens as JSX components
 * 
 * 2. Navigation Guards vs Conditional Rendering:
 *    - Angular: CanActivate guards check auth state
 *    - React: Conditional rendering based on user state
 * 
 * 3. Route Parameters:
 *    - Angular: ActivatedRoute service with params observable
 *    - React: navigation.navigate('Screen', { param: value })
 * 
 * 4. Navigation Container:
 *    - Wraps entire navigation tree (like Angular RouterModule.forRoot())
 *    - Manages navigation state and deep linking
 * 
 * 5. Stack Navigator:
 *    - Similar to Angular's router-outlet
 *    - Handles screen transitions and back button
 * 
 * This approach is more visual and easier to understand than Angular routing!
 */