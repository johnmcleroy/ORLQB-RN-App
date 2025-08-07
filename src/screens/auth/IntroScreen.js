/**
 * IntroScreen - First-time user introduction screen
 * 
 * Features:
 * - Full-screen ORLQB-themed background (image or video)
 * - Auto-advances to login after 10 seconds or user tap
 * - Only shows for first-time users
 * - Quebec Bravo aviation theme with gold accent colors
 * 
 * Background Media Options:
 * 1. Image Background (Current): Uses ORLQB hangar/aviation photography
 * 2. Video Background (Future): ORLQB intro video with expo-av package
 * 
 * To Add ORLQB-Specific Assets:
 * 1. Add images to: assets/images/ORLQB_Photos/orlqb_intro_background.jpg
 * 2. Add logo to: assets/images/QB_Graphics/qb_logo_light.png
 * 3. Add video to: assets/videos/orlqb_intro.mp4 (requires expo-av)
 * 
 * Current Status:
 * - Using fallback Unsplash aviation image
 * - Text-based ORLQB logo (ready for image replacement)
 * - Video support commented out (requires expo-av installation)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  StatusBar,
  Text,
  ImageBackground,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ORLQB Images - using import-based approach for better web compatibility
import { ORLQBPhotos, QBGraphics } from '../../constants/images';

const ORLQB_IMAGES = {
  INTRO_BACKGROUND: ORLQBPhotos.INTRO_BACKGROUND,
  ORLQB_LOGO: QBGraphics.ORLQB_LOGO_LIGHT,
};

const { width, height } = Dimensions.get('window');

const IntroScreen = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance after 10 seconds
    const timer = setTimeout(() => {
      handleComplete();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleComplete = async () => {
    console.log('IntroScreen: handleComplete called');
    
    // Mark intro as completed
    await AsyncStorage.setItem('intro_completed', 'true');
    console.log('IntroScreen: AsyncStorage updated');
    
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      console.log('IntroScreen: Calling onComplete callback');
      onComplete();
    });
  };


  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Background Video Option */}
      {/* To add video support, install expo-av: npm install expo-av */}
      {/* Then uncomment and add your video file to assets/videos/ */}

      {/* ORLQB Intro Background */}
      <ImageBackground
        source={ORLQB_IMAGES.INTRO_BACKGROUND}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* ORLQB Logo/Branding Area */}
          <View style={styles.logoContainer}>
            {/* Future: Replace with actual ORLQB logo image */}
            {/* <Image source={ORLQB_IMAGES.ORLQB_LOGO} style={styles.logoImage} /> */}
            <Image source={ORLQB_IMAGES.ORLQB_LOGO} style={styles.logoImage} />
            <Text style={styles.logoText}>ORLQB</Text>
            <Text style={styles.tagline}>Orlando Hangar of Quiet Birdmen</Text>
            <Text style={styles.qbText}>QB's forever, Brothers for life</Text>
          </View>

          {/* Welcome Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.welcomeText}>Welcome to the</Text>
            <Text style={styles.appName}>ORLQB Hangar Mobile App</Text>
            <Text style={styles.description}>
              Connecting Pilots and Goodfellows{'\n'}
              Building tomorrow's ORLQB's today{'\n'}
              Enrichening our Brotherhood
            </Text>
          </View>

          {/* Skip Button */}
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleComplete}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Tap to Continue</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]}
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: width,
    height: height,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  qbText: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 5,
    textAlign: 'center',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    letterSpacing: 2,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  welcomeText: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  description: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  skipButton: {
    position: 'absolute',
    bottom: 100,
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  skipText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 50,
    left: 30,
    right: 30,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
});

export default IntroScreen;