/**
 * Navigation Services - Native Turn-by-Turn Navigation Integration
 * 
 * Provides cross-platform navigation capabilities:
 * - iOS: Apple Maps, Google Maps, Waze
 * - Android: Google Maps, Waze
 * - Web: Google Maps web interface
 * 
 * Features:
 * - Automatic platform detection
 * - Fallback navigation options
 * - Location permission handling
 * - Current location integration
 */

import { Platform, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';

// ORLQB Default Locations (frequently used venues)
export const ORLQB_LOCATIONS = {
  'Orlando QB Hangar': {
    address: 'Orlando Executive Airport, Orlando, FL 32803',
    latitude: 28.5449,
    longitude: -81.3324,
    name: 'Orlando QB Hangar'
  },
  'Orlando Executive Airport': {
    address: 'Orlando Executive Airport, 365 Rickenbacker Dr, Orlando, FL 32803',
    latitude: 28.5449,
    longitude: -81.3324,
    name: 'Orlando Executive Airport'
  },
  // Add more common ORLQB locations as needed
};

/**
 * Navigation Apps and their URL schemes
 */
const NAVIGATION_APPS = {
  APPLE_MAPS: {
    name: 'Apple Maps',
    scheme: 'maps://',
    available: Platform.OS === 'ios',
  },
  GOOGLE_MAPS: {
    name: 'Google Maps',
    scheme: Platform.OS === 'ios' ? 'comgooglemaps://' : 'google.navigation:',
    webUrl: 'https://maps.google.com/',
    available: true,
  },
  WAZE: {
    name: 'Waze',
    scheme: 'waze://',
    available: true,
  },
};

/**
 * Check location permissions
 */
export const checkLocationPermission = async () => {
  try {
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    
    if (existingStatus !== 'granted') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return { 
          success: false, 
          error: 'Location permission is required for navigation features.' 
        };
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error checking location permission:', error);
    return { 
      success: false, 
      error: 'Failed to check location permissions.' 
    };
  }
};

/**
 * Get current user location
 */
export const getCurrentLocation = async () => {
  try {
    const permissionResult = await checkLocationPermission();
    if (!permissionResult.success) {
      return { success: false, error: permissionResult.error };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 10000,
    });

    return {
      success: true,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return {
      success: false,
      error: 'Failed to get current location. Please ensure GPS is enabled.',
    };
  }
};

/**
 * Parse location from event location string
 */
export const parseEventLocation = (locationString) => {
  if (!locationString) return null;

  // Check if it's a known ORLQB location
  const knownLocation = ORLQB_LOCATIONS[locationString];
  if (knownLocation) {
    return knownLocation;
  }

  // Check if location string contains coordinates (e.g., "Orlando QB Hangar (28.5449, -81.3324)")
  const coordRegex = /\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/;
  const coordMatch = locationString.match(coordRegex);
  
  if (coordMatch) {
    const [, lat, lng] = coordMatch;
    return {
      address: locationString.replace(coordRegex, '').trim(),
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      name: locationString.replace(coordRegex, '').trim(),
    };
  }

  // Return as address string for geocoding
  return {
    address: locationString,
    name: locationString,
  };
};

/**
 * Check if a navigation app is installed
 */
export const isNavigationAppInstalled = async (app) => {
  if (!app.available) return false;
  
  try {
    if (Platform.OS === 'web') {
      return app === NAVIGATION_APPS.GOOGLE_MAPS; // Only Google Maps on web
    }
    
    const supported = await Linking.canOpenURL(app.scheme);
    return supported;
  } catch (error) {
    console.error(`Error checking ${app.name} availability:`, error);
    return false;
  }
};

/**
 * Get available navigation apps on device
 */
export const getAvailableNavigationApps = async () => {
  const availableApps = [];
  
  for (const app of Object.values(NAVIGATION_APPS)) {
    const isInstalled = await isNavigationAppInstalled(app);
    if (isInstalled) {
      availableApps.push(app);
    }
  }
  
  return availableApps;
};

/**
 * Open navigation to location with specific app
 */
export const navigateWithApp = async (destination, app, origin = null) => {
  try {
    let url;

    if (Platform.OS === 'web') {
      // Web navigation - always use Google Maps
      if (destination.latitude && destination.longitude) {
        url = `${NAVIGATION_APPS.GOOGLE_MAPS.webUrl}dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
      } else {
        url = `${NAVIGATION_APPS.GOOGLE_MAPS.webUrl}dir/?api=1&destination=${encodeURIComponent(destination.address)}`;
      }
      
      if (origin && origin.latitude && origin.longitude) {
        url += `&origin=${origin.latitude},${origin.longitude}`;
      }
    } else {
      // Mobile navigation
      switch (app) {
        case NAVIGATION_APPS.APPLE_MAPS:
          if (destination.latitude && destination.longitude) {
            url = `${app.scheme}?daddr=${destination.latitude},${destination.longitude}`;
          } else {
            url = `${app.scheme}?daddr=${encodeURIComponent(destination.address)}`;
          }
          
          if (origin && origin.latitude && origin.longitude) {
            url += `&saddr=${origin.latitude},${origin.longitude}`;
          }
          break;

        case NAVIGATION_APPS.GOOGLE_MAPS:
          if (Platform.OS === 'ios') {
            if (destination.latitude && destination.longitude) {
              url = `${app.scheme}?daddr=${destination.latitude},${destination.longitude}&directionsmode=driving`;
            } else {
              url = `${app.scheme}?daddr=${encodeURIComponent(destination.address)}&directionsmode=driving`;
            }
          } else {
            // Android
            if (destination.latitude && destination.longitude) {
              url = `${app.scheme}q=${destination.latitude},${destination.longitude}`;
            } else {
              url = `${app.scheme}q=${encodeURIComponent(destination.address)}`;
            }
          }
          break;

        case NAVIGATION_APPS.WAZE:
          if (destination.latitude && destination.longitude) {
            url = `${app.scheme}?ll=${destination.latitude},${destination.longitude}&navigate=yes`;
          } else {
            url = `${app.scheme}?q=${encodeURIComponent(destination.address)}&navigate=yes`;
          }
          break;

        default:
          throw new Error('Unsupported navigation app');
      }
    }

    console.log(`Opening navigation URL: ${url}`);
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
      return { success: true };
    } else {
      return { 
        success: false, 
        error: `Cannot open ${app.name}. Please ensure it's installed.` 
      };
    }
  } catch (error) {
    console.error('Error opening navigation:', error);
    return { 
      success: false, 
      error: `Failed to open ${app.name}: ${error.message}` 
    };
  }
};

/**
 * Show navigation options to user
 */
export const showNavigationOptions = async (eventLocation) => {
  const destination = parseEventLocation(eventLocation);
  if (!destination) {
    Alert.alert('Error', 'Event location information is not available.');
    return;
  }

  const availableApps = await getAvailableNavigationApps();
  
  if (availableApps.length === 0) {
    Alert.alert(
      'No Navigation Apps',
      'No supported navigation apps found. Please install Google Maps, Apple Maps, or Waze.',
    );
    return;
  }

  // Get current location for better navigation
  const currentLocationResult = await getCurrentLocation();
  const origin = currentLocationResult.success ? currentLocationResult.location : null;

  if (availableApps.length === 1) {
    // Only one app available, use it directly
    const result = await navigateWithApp(destination, availableApps[0], origin);
    if (!result.success) {
      Alert.alert('Navigation Error', result.error);
    }
    return;
  }

  // Multiple apps available, show selection
  const options = availableApps.map(app => ({
    text: app.name,
    onPress: async () => {
      const result = await navigateWithApp(destination, app, origin);
      if (!result.success) {
        Alert.alert('Navigation Error', result.error);
      }
    },
  }));

  options.push({ text: 'Cancel', style: 'cancel' });

  Alert.alert(
    'Choose Navigation App',
    `Get directions to ${destination.name}`,
    options
  );
};

/**
 * Quick navigation - uses best available app automatically
 */
export const quickNavigate = async (eventLocation) => {
  const destination = parseEventLocation(eventLocation);
  if (!destination) {
    Alert.alert('Error', 'Event location information is not available.');
    return;
  }

  const availableApps = await getAvailableNavigationApps();
  
  if (availableApps.length === 0) {
    Alert.alert(
      'No Navigation Apps',
      'Please install Google Maps, Apple Maps, or Waze for navigation.',
    );
    return;
  }

  // Get current location
  const currentLocationResult = await getCurrentLocation();
  const origin = currentLocationResult.success ? currentLocationResult.location : null;

  // Use the first available app (prioritized by order in NAVIGATION_APPS)
  const result = await navigateWithApp(destination, availableApps[0], origin);
  
  if (!result.success) {
    Alert.alert('Navigation Error', result.error);
  }
};

/**
 * Get distance and estimated travel time (requires additional API - placeholder for now)
 */
export const getDistanceAndTime = async (eventLocation) => {
  // This would require Google Maps Distance Matrix API or similar
  // For now, return placeholder data
  return {
    distance: 'Distance unavailable',
    duration: 'Time unavailable',
  };
};