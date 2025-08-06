/**
 * GuestsScreen - Guest Information Display
 * 
 * This replaces your guests.page.html with a React Native screen.
 * Will contain guest-specific content and navigation to sub-screens.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GuestsScreen = ({ navigation }) => {
  const guestSections = [
    { 
      title: 'Welcome Information', 
      icon: 'information-circle-outline',
      description: 'Introduction to ORLQB for guests',
      route: 'GuestWelcome'
    },
    { 
      title: 'Conduct Guidelines', 
      icon: 'book-outline',
      description: 'Expected behavior and protocols',
      route: 'GuestConduct'
    },
    { 
      title: 'Candidate Information', 
      icon: 'person-add-outline',
      description: 'Path to membership',
      route: 'GuestCandidate'
    },
    { 
      title: 'Initiation Process', 
      icon: 'ribbon-outline',
      description: 'Steps to becoming a member',
      route: 'GuestInitiate'
    },
  ];

  const handleSectionPress = (route) => {
    // TODO: Navigate to specific guest sub-screens
    console.log(`Navigate to ${route}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Guest Information</Text>
        <Text style={styles.subtitle}>
          Welcome to Ye Ancient and Secret Order of Quiet Birdmen
        </Text>
      </View>

      <View style={styles.sectionsContainer}>
        {guestSections.map((section, index) => (
          <TouchableOpacity
            key={index}
            style={styles.sectionCard}
            onPress={() => handleSectionPress(section.route)}
          >
            <View style={styles.sectionContent}>
              <Ionicons 
                name={section.icon} 
                size={32} 
                color="#3880ff" 
                style={styles.sectionIcon}
              />
              <View style={styles.sectionText}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionDescription}>{section.description}</Text>
              </View>
              <Ionicons 
                name="chevron-forward-outline" 
                size={20} 
                color="#999" 
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  sectionsContainer: {
    padding: 15,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  sectionIcon: {
    marginRight: 15,
  },
  sectionText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default GuestsScreen;

/**
 * LEARNING NOTES:
 * 
 * 1. ScrollView vs FlatList:
 *    - ScrollView: For small, fixed lists (like this menu)
 *    - FlatList: For large, dynamic lists (better performance)
 * 
 * 2. Card-based UI:
 *    - Uses shadows and elevation for depth
 *    - TouchableOpacity provides press feedback
 * 
 * 3. Flexbox Layout:
 *    - flexDirection: 'row' for horizontal layout
 *    - flex: 1 to take remaining space
 * 
 * 4. Vector Icons:
 *    - @expo/vector-icons provides thousands of icons
 *    - Much easier than managing icon fonts in Ionic
 */