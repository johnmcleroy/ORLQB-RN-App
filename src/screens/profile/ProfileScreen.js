/**
 * ProfileScreen - User Profile Management
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ImageBackground } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MemberPhotos, ORLQBPhotos } from '../../constants/images';

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

  const memberPhoto = user?.qbNumber ? MemberPhotos.getMemberPhoto(user.qbNumber) : MemberPhotos.DEFAULT_AVATAR;

  return (
    <ImageBackground
      source={ORLQBPhotos.HANGAR_INTERIOR}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={memberPhoto} style={styles.avatar} />
          <View style={styles.avatarBorder} />
        </View>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleContainer}>
          <Ionicons name="shield-outline" size={16} color="#FFD700" />
          <Text style={styles.role}>{userRole || 'Guest'}</Text>
        </View>
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.7)',
    marginTop: 50,
    marginHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f0f0f0',
  },
  avatarBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  email: {
    fontSize: 18,
    color: '#333',
    marginTop: 15,
    fontWeight: '600',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  role: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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