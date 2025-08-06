/**
 * ProfileScreen - User Profile Management
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const { user, signOut, userRole } = useAuth();

  const handleSignOut = async () => {
    console.log('ProfileScreen: handleSignOut function called');
    
    // Test direct signout first
    try {
      console.log('ProfileScreen: Attempting direct sign out...');
      const result = await signOut();
      console.log('ProfileScreen: Sign out result:', result);
      if (!result.success) {
        console.error('ProfileScreen: Sign out failed:', result.error);
        Alert.alert('Error', `Failed to sign out: ${result.error}`);
      } else {
        console.log('ProfileScreen: Sign out successful, user should be redirected');
      }
    } catch (error) {
      console.error('ProfileScreen: Sign out exception:', error);
      Alert.alert('Error', 'An unexpected error occurred during sign out');
    }
  };

  const handleResetIntro = async () => {
    Alert.alert(
      'Reset Intro',
      'This will reset the intro screen for testing. You will see the intro screen again on next visit.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('intro_completed');
              Alert.alert('Success', 'Intro screen has been reset');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset intro screen');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={80} color="#3880ff" />
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>Role: {userRole || 'Guest'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleResetIntro}>
          <Ionicons name="refresh-outline" size={24} color="#3880ff" />
          <Text style={[styles.menuText, { color: '#3880ff' }]}>Reset Intro Screen</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => {
            console.log('ProfileScreen: Sign out button touched!');
            handleSignOut();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color="#ff3333" />
          <Text style={[styles.menuText, { color: '#ff3333' }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  email: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
  },
  role: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
});

export default ProfileScreen;