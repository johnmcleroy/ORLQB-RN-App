/**
 * TabNavigator - Bottom Tab Navigation
 * 
 * This replaces your Ionic tabs (tabs.page.html) with React Navigation's
 * native tab navigator. Provides better performance and native feel.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import GuestsScreen from '../screens/guests/GuestsScreen';
import MembersScreen from '../screens/members/MembersScreen';
import LeadmenScreen from '../screens/leadmen/LeadmenScreen';
import AdminScreen from '../screens/admin/AdminScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import { useAuth } from '../context/AuthContext';
import { hasSecurityLevel, SECURITY_LEVELS, HANGAR_ROLES } from '../utils/userRoles';

const Tab = createBottomTabNavigator();

/**
 * TabNavigator Component
 * 
 * This creates the bottom tab navigation with ORLQB role-based visibility.
 * Tabs are shown/hidden based on user's security authorization level (0-4).
 */
const TabNavigator = () => {
  const { user, userRole } = useAuth();

  // Get user's security level for authorization checks
  const userSecurityLevel = SECURITY_LEVELS[userRole] || 0;
  
  // Determine which tabs to show based on ORLQB authorization levels
  const shouldShowTab = (tabName) => {
    switch (tabName) {
      case 'Guests':
        // All users (including guests) can see guest information
        return true;
      case 'Members':
        // Level 1+ (Candidates, Initiates, Members, Leadmen) can view member directory
        // Guests (level 0) cannot access member directory
        return userSecurityLevel >= 1;
      case 'Leadmen':
        // Level 3+ (Leadmen roles) can access leadership functions
        // Guests (level 0) cannot access leadmen functions
        return hasSecurityLevel(userRole, 3);
      case 'Admin':
        // Level 4+ (Governor, Historian) or Sudo Admin for full administration
        // Guests (level 0) cannot access admin functions
        return hasSecurityLevel(userRole, 4) || userRole === HANGAR_ROLES.SUDO_ADMIN;
      case 'Profile':
        // All authenticated users have access to their profile
        return true;
      default:
        return false;
    }
  };

  /**
   * Tab Screen Configuration
   * Each tab matches your original Ionic tab structure
   */
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Tab bar icon configuration
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Guests':
              iconName = focused ? 'warning' : 'warning-outline';
              break;
            case 'Members':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Leadmen':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Admin':
              iconName = focused ? 'folder' : 'folder-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Tab bar styling (matches Ionic's bottom tab bar)
        tabBarActiveTintColor: '#3880ff', // Ionic blue
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        // Header configuration
        headerStyle: {
          backgroundColor: '#3880ff',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      {/* Role-based tab visibility using ORLQB authorization levels */}
      
      {shouldShowTab('Guests') && (
        <Tab.Screen 
          name="Guests" 
          component={GuestsScreen}
          options={{
            title: 'Guests',
            headerTitle: 'Guest Information',
          }}
        />
      )}
      
      {shouldShowTab('Members') && (
        <Tab.Screen 
          name="Members" 
          component={MembersScreen}
          options={{
            title: 'Members',
            headerTitle: 'Member Directory',
          }}
        />
      )}
      
      {shouldShowTab('Leadmen') && (
        <Tab.Screen 
          name="Leadmen" 
          component={LeadmenScreen}
          options={{
            title: 'Leadmen',
            headerTitle: 'ORLQB Leadership',
          }}
        />
      )}
      
      {shouldShowTab('Admin') && (
        <Tab.Screen 
          name="Admin" 
          component={AdminScreen}
          options={{
            title: 'Admin',
            headerTitle: 'Hangar Administration',
          }}
        />
      )}
      
      {shouldShowTab('Profile') && (
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'Profile',
            headerTitle: 'My Profile',
          }}
        />
      )}
    </Tab.Navigator>
  );
};

export default TabNavigator;

/**
 * LEARNING NOTES:
 * 
 * 1. Bottom Tab Navigator vs Ionic Tabs:
 *    - Ionic: Uses web-based tab switching
 *    - React Navigation: Uses native tab controllers for smoother performance
 * 
 * 2. Icon System:
 *    - Ionic: Uses ion-icon with Ionicons library
 *    - React Native: Uses @expo/vector-icons (same Ionicons, better integration)
 * 
 * 3. Tab Configuration:
 *    - Ionic: Configured in HTML with ion-tab-button
 *    - React Navigation: Screen options with dynamic icon function
 * 
 * 4. Styling:
 *    - Ionic: CSS variables and ion-tab-bar styling
 *    - React Navigation: JavaScript style objects (more powerful)
 * 
 * 5. ORLQB Role-based Visibility:
 *    - Implemented with ORLQB security authorization levels (0-4)
 *    - Tabs show/hide based on user's role and security clearance
 *    - Much cleaner than Angular guards or *ngIf directives
 * 
 * 6. Performance Benefits:
 *    - Native tab switching (iOS/Android controllers)
 *    - Lazy loading of tab screens
 *    - Better memory management
 * 
 * The tab navigator provides a much smoother user experience than Ionic tabs!
 */