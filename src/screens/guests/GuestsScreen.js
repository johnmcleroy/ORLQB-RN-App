/**
 * GuestsScreen - Guest Information Display
 * 
 * This replaces your guests.page.html with a React Native screen.
 * Will contain guest-specific content and navigation to sub-screens.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { HANGAR_ROLES } from '../../utils/userRoles';
import MemberManager from '../../components/Members/MemberManager';

const GuestsScreen = ({ navigation }) => {
  const { user, userRole } = useAuth();
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  
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

  const handleAttendanceNotification = () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to notify about attendance');
      return;
    }
    setShowAttendanceModal(true);
  };

  const sendAttendanceNotification = (type) => {
    // TODO: Implement actual notification to Leadmen
    Alert.alert(
      'Notification Sent',
      `Your ${type} notification has been sent to the Leadmen. They will be notified of your intention.`,
      [{ text: 'OK', onPress: () => setShowAttendanceModal(false) }]
    );
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

        {/* Guest Attendance Notification */}
        <TouchableOpacity
          style={[styles.sectionCard, styles.attendanceCard]}
          onPress={handleAttendanceNotification}
        >
          <View style={styles.sectionContent}>
            <Ionicons 
              name="calendar-outline" 
              size={32} 
              color="#10dc60" 
              style={styles.sectionIcon}
            />
            <View style={styles.sectionText}>
              <Text style={styles.sectionTitle}>Notify Attendance</Text>
              <Text style={styles.sectionDescription}>
                Let Leadmen know you'll attend or call-in to the next meeting
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward-outline" 
              size={20} 
              color="#999" 
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Attendance Notification Modal */}
      <Modal
        visible={showAttendanceModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAttendanceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notify Leadmen of Attendance</Text>
            <TouchableOpacity onPress={() => setShowAttendanceModal(false)}>
              <Ionicons name="close-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Choose how you plan to participate in the next ORLQB meeting:
            </Text>

            <TouchableOpacity
              style={[styles.attendanceOption, { backgroundColor: '#10dc60' }]}
              onPress={() => sendAttendanceNotification('attendance')}
            >
              <Ionicons name="person-outline" size={24} color="white" />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>I'll Attend</Text>
                <Text style={styles.optionDescription}>
                  I plan to be physically present at the meeting
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.attendanceOption, { backgroundColor: '#3880ff' }]}
              onPress={() => sendAttendanceNotification('call-in')}
            >
              <Ionicons name="call-outline" size={24} color="white" />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>I'll Call-In</Text>
                <Text style={styles.optionDescription}>
                  I plan to participate via phone/video call
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.attendanceOption, { backgroundColor: '#f04141' }]}
              onPress={() => sendAttendanceNotification('unable to attend')}
            >
              <Ionicons name="close-circle-outline" size={24} color="white" />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Cannot Attend</Text>
                <Text style={styles.optionDescription}>
                  I'm unable to participate in the next meeting
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.modalFooter}>
              <Text style={styles.footerNote}>
                Your notification will be sent to all current Leadmen. They will receive your name, selected option, and timestamp.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
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
  attendanceCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10dc60',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  attendanceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
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
  optionText: {
    flex: 1,
    marginLeft: 15,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  modalFooter: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  footerNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
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