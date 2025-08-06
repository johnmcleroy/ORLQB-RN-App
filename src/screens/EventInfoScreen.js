/**
 * EventInfoScreen - Detailed Event Information Page
 * 
 * Shows comprehensive details about a specific event including:
 * - Event details (time, location, description)
 * - RSVP functionality
 * - Attendee list (for authorized users)
 * - Event actions (edit for leadmen/admin)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { firestore } from '../services/firebase';
import { hasSecurityLevel, HANGAR_ROLES } from '../utils/userRoles';
import { showNavigationOptions, quickNavigate, parseEventLocation } from '../utils/navigationServices';

const EventInfoScreen = ({ event, visible, onClose, onRSVP }) => {
  const { user, userRole } = useAuth();
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAttendees, setShowAttendees] = useState(false);
  const [isNavigationAvailable, setIsNavigationAvailable] = useState(false);

  useEffect(() => {
    if (event && user) {
      checkRSVPStatus();
      if (hasSecurityLevel(userRole, 3)) { // Leadmen can see attendee list
        loadAttendees();
      }
    }
    
    // Check if navigation is available for this event
    if (event) {
      checkNavigationAvailability();
    }
  }, [event, user]);

  const checkNavigationAvailability = () => {
    const location = parseEventLocation(event?.location);
    setIsNavigationAvailable(!!location);
  };

  const checkRSVPStatus = async () => {
    if (!event || !user) return;
    
    try {
      // Check if user has RSVP'd to this event
      // This is a placeholder - implement based on your RSVP data structure
      setIsRSVPed(false); // Default to false for now
    } catch (error) {
      console.error('Error checking RSVP status:', error);
    }
  };

  const loadAttendees = async () => {
    if (!event) return;
    
    try {
      // Load attendee list from Firebase
      // This is a placeholder - implement based on your attendance data structure
      setAttendees([]);
    } catch (error) {
      console.error('Error loading attendees:', error);
    }
  };

  const handleRSVP = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to RSVP for events.');
      return;
    }

    if (userRole === HANGAR_ROLES.GUEST) {
      Alert.alert(
        'Guest RSVP',
        'As a guest, your RSVP will be recorded and Leadmen will be notified. You are welcome to attend!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'RSVP as Guest', onPress: () => processRSVP() }
        ]
      );
      return;
    }

    processRSVP();
  };

  const processRSVP = async () => {
    setLoading(true);
    
    try {
      // TODO: Implement RSVP logic with Firebase
      // For now, just toggle the state and show success
      setIsRSVPed(!isRSVPed);
      
      Alert.alert(
        'RSVP Confirmed',
        isRSVPed ? 'You have been removed from this event.' : 'You have been added to this event.',
        [{ text: 'OK' }]
      );
      
      if (onRSVP) {
        onRSVP(event, !isRSVPed);
      }
    } catch (error) {
      console.error('Error processing RSVP:', error);
      Alert.alert('Error', 'Failed to update RSVP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetDirections = () => {
    if (!event?.location) {
      Alert.alert('Error', 'Location information is not available for this event.');
      return;
    }
    
    showNavigationOptions(event.location);
  };

  const handleQuickNavigation = () => {
    if (!event?.location) {
      Alert.alert('Error', 'Location information is not available for this event.');
      return;
    }
    
    quickNavigate(event.location);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting': return '#3880ff';
      case 'orientation': return '#10dc60';
      case 'leadership': return '#ffce00';
      case 'social': return '#f04141';
      default: return '#666';
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'meeting': return 'people-outline';
      case 'orientation': return 'school-outline';
      case 'leadership': return 'medal-outline';
      case 'social': return 'happy-outline';
      default: return 'calendar-outline';
    }
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  if (!event) return null;

  const eventColor = getEventTypeColor(event.type);
  const eventIcon = getEventTypeIcon(event.type);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-back-outline" size={24} color="#333" />
            <Text style={styles.closeText}>Back</Text>
          </TouchableOpacity>
          
          {hasSecurityLevel(userRole, 3) && (
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color="#3880ff" />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content}>
          {/* Event Header */}
          <View style={[styles.eventHeader, { backgroundColor: eventColor + '15' }]}>
            <View style={styles.eventIconContainer}>
              <Ionicons name={eventIcon} size={32} color={eventColor} />
            </View>
            <View style={styles.eventHeaderText}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventType}>
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                {event.isRecurring && ' • Recurring Monthly'}
              </Text>
            </View>
          </View>

          {/* Event Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                {formatEventDate(event.date || '2025-01-13')}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                {formatTime(event.time)}
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.detailRow, isNavigationAvailable && styles.clickableLocation]} 
              onPress={isNavigationAvailable ? handleGetDirections : undefined}
              disabled={!isNavigationAvailable}
            >
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={[styles.detailText, isNavigationAvailable && styles.clickableLocationText]}>
                {event.location || 'Location TBD'}
              </Text>
              {isNavigationAvailable && (
                <Ionicons name="navigate-outline" size={16} color="#3880ff" style={styles.navigationIcon} />
              )}
            </TouchableOpacity>

            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <Text style={styles.detailText}>
                {event.attendees} / {event.maxAttendees} attending
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {event.description || 'No description available.'}
            </Text>
          </View>

          {/* RSVP Status */}
          {event.requiresRSVP && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RSVP Status</Text>
              <View style={styles.rsvpStatus}>
                <Ionicons 
                  name={isRSVPed ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={20} 
                  color={isRSVPed ? '#10dc60' : '#666'} 
                />
                <Text style={[styles.rsvpStatusText, isRSVPed && styles.rsvpConfirmed]}>
                  {isRSVPed ? 'You are attending this event' : 'You have not RSVP\'d'}
                </Text>
              </View>
            </View>
          )}

          {/* Attendee List (for authorized users) */}
          {hasSecurityLevel(userRole, 3) && (
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => setShowAttendees(!showAttendees)}
              >
                <Text style={styles.sectionTitle}>Attendees ({attendees.length})</Text>
                <Ionicons 
                  name={showAttendees ? 'chevron-up-outline' : 'chevron-down-outline'} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
              
              {showAttendees && (
                <View style={styles.attendeeList}>
                  {attendees.length > 0 ? (
                    attendees.map((attendee, index) => (
                      <View key={index} style={styles.attendeeItem}>
                        <Text style={styles.attendeeName}>{attendee.name}</Text>
                        <Text style={styles.attendeeRole}>{attendee.role}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noAttendees}>No RSVPs yet</Text>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {/* Directions Button */}
          {isNavigationAvailable && (
            <TouchableOpacity
              style={[styles.actionButton, styles.directionsButton]}
              onPress={handleGetDirections}
            >
              <Ionicons name="navigate-outline" size={20} color="white" />
              <Text style={styles.actionButtonText}>Get Directions</Text>
            </TouchableOpacity>
          )}
          
          {/* RSVP Button */}
          {event.requiresRSVP && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.rsvpButton,
                isRSVPed ? styles.rsvpButtonConfirmed : styles.rsvpButtonPending,
                loading && styles.buttonDisabled
              ]}
              onPress={handleRSVP}
              disabled={loading}
            >
              <Ionicons 
                name={isRSVPed ? 'checkmark-outline' : 'add-outline'} 
                size={20} 
                color="white" 
              />
              <Text style={styles.actionButtonText}>
                {loading ? 'Processing...' : (isRSVPed ? 'Cancel RSVP' : 'RSVP for Event')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#3880ff',
  },
  content: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  eventIconContainer: {
    marginRight: 15,
  },
  eventHeaderText: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  clickableLocation: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderRadius: 6,
    backgroundColor: 'rgba(56, 128, 255, 0.05)',
  },
  clickableLocationText: {
    color: '#3880ff',
    textDecorationLine: 'underline',
  },
  navigationIcon: {
    marginLeft: 8,
  },
  section: {
    margin: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  rsvpStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rsvpStatusText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  rsvpConfirmed: {
    color: '#10dc60',
    fontWeight: '500',
  },
  attendeeList: {
    marginTop: 10,
  },
  attendeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  attendeeName: {
    fontSize: 16,
    color: '#333',
  },
  attendeeRole: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  noAttendees: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  actionContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    flex: 1,
  },
  directionsButton: {
    backgroundColor: '#FF8C00',
  },
  rsvpButton: {
    // Inherits from actionButton
  },
  rsvpButtonPending: {
    backgroundColor: '#3880ff',
  },
  rsvpButtonConfirmed: {
    backgroundColor: '#10dc60',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default EventInfoScreen;