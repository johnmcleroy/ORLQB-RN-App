/**
 * LoadingScreen - Shows while checking authentication state
 * 
 * This is a simple screen that shows while Firebase checks if user is logged in.
 * Prevents the flickering you might see between login and main screens.
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3880ff" />
      <Text style={styles.text}>Loading ORLQB...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default LoadingScreen;

/**
 * LEARNING NOTES:
 * 
 * 1. React Native Components:
 *    - View: Like <div> in HTML, but for mobile layouts
 *    - Text: All text must be wrapped in <Text> components
 *    - ActivityIndicator: Native loading spinner
 * 
 * 2. StyleSheet:
 *    - JavaScript objects instead of CSS
 *    - Flexbox is the primary layout system
 *    - No units needed (defaults to density-independent pixels)
 * 
 * 3. Flexbox Layout:
 *    - flex: 1 means "take up all available space"
 *    - justifyContent: 'center' centers vertically
 *    - alignItems: 'center' centers horizontally
 * 
 * This pattern is much simpler than creating loading components in Angular!
 */