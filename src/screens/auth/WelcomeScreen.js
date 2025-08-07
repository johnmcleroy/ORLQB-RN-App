/**
 * WelcomeScreen - App Introduction
 * 
 * This replaces your welcome.page.html with a React Native introduction screen.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const WelcomeScreen = ({ navigation }) => {
  const { updateHasSeenIntroduction } = useAuth();

  const handleGetStarted = () => {
    updateHasSeenIntroduction(true);
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to ORLQB</Text>
        <Text style={styles.subtitle}>
          Ye Ancient and Secret Order
        </Text>
        
        <View style={styles.features}>
          <Text style={styles.featureText}>• Connect with fellow members</Text>
          <Text style={styles.featureText}>• Access exclusive content</Text>
          <Text style={styles.featureText}>• Stay updated with events</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3880ff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 40,
  },
  features: {
    marginBottom: 40,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: '#3880ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;