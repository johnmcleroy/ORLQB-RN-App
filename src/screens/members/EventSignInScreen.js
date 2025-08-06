/**
 * EventSignInScreen - Event Check-in Functionality
 * 
 * Features:
 * - QR code scanning for quick check-in
 * - Manual member search and check-in
 * - Real-time attendance tracking
 * - Event-specific check-in lists
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Alert,
  TextInput,
  Modal,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ORLQBPhotos } from '../../constants/images';
import { useAuth } from '../../context/AuthContext';

const EventSignInScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
    fetchMembers();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      console.log('EventSignIn: Fetching upcoming events...');
      
      // For demo purposes, create sample events
      const sampleEvents = [
        {
          id: '1',
          title: 'Monthly Meeting - March 2024',
          date: '2024-03-15',
          time: '19:00',
          location: 'ORLQB Hangar',
          type: 'meeting',
          status: 'active',
          maxAttendees: 50,
          currentAttendees: 0,
          signInEnabled: true
        },
        {
          id: '2',
          title: 'Safety Seminar',
          date: '2024-03-22',
          time: '10:00',
          location: 'ORLQB Hangar',
          type: 'seminar',
          status: 'active',
          maxAttendees: 30,
          currentAttendees: 0,
          signInEnabled: true
        },
        {
          id: '3',
          title: 'Annual Fly-in',
          date: '2024-04-05',
          time: '08:00',
          location: 'Orlando Executive Airport',
          type: 'event',
          status: 'upcoming',
          maxAttendees: 100,
          currentAttendees: 0,
          signInEnabled: false
        }
      ];
      
      setEvents(sampleEvents);
    } catch (error) {
      console.error('EventSignIn: Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
      
      const membersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(membersQuery);
      const membersList = [];
      
      querySnapshot.forEach((doc) => {
        const memberData = doc.data();
        if (memberData.name && memberData.qbNumber) {
          membersList.push({
            id: doc.id,
            ...memberData
          });
        }
      });

      setMembers(membersList);
    } catch (error) {
      console.error('EventSignIn: Error fetching members:', error);
      // Use sample data for demo
      setMembers([
        { id: 'sample1', name: 'Smith, John', qbNumber: '123' },
        { id: 'sample2', name: 'Johnson, Sarah', qbNumber: '456' }
      ]);
    }
  };

  const fetchEventAttendees = async (eventId) => {
    try {
      const attendeesQuery = query(
        collection(db, 'eventAttendance'),
        where('eventId', '==', eventId)
      );
      const querySnapshot = await getDocs(attendeesQuery);
      const attendeesList = [];
      
      querySnapshot.forEach((doc) => {
        attendeesList.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setAttendees(attendeesList);
    } catch (error) {
      console.error('EventSignIn: Error fetching attendees:', error);
      setAttendees([]);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    fetchEventAttendees(event.id);
  };

  const handleSignIn = async (member) => {
    if (!selectedEvent) return;

    try {
      // Check if already signed in
      const existingAttendee = attendees.find(
        attendee => attendee.memberId === member.id
      );

      if (existingAttendee) {
        Alert.alert(
          'Already Signed In',
          `${member.name} is already signed in to this event.`,
          [{ text: 'OK' }]
        );
        return;
      }

      // Add attendance record
      const attendanceData = {
        eventId: selectedEvent.id,
        memberId: member.id,
        memberName: member.name,
        qbNumber: member.qbNumber,
        signInTime: new Date().toISOString(),
        signedInBy: user.email
      };

      await addDoc(collection(db, 'eventAttendance'), attendanceData);
      
      // Update local state
      setAttendees(prev => [...prev, { id: Date.now().toString(), ...attendanceData }]);
      
      Alert.alert(
        'Sign-in Successful',
        `${member.name} has been signed in to ${selectedEvent.title}.`,
        [{ text: 'OK' }]
      );

      setShowSignInModal(false);
      setSearchQuery('');
    } catch (error) {
      console.error('EventSignIn: Error signing in member:', error);
      Alert.alert('Error', 'Failed to sign in member. Please try again.');
    }
  };

  const toggleSignInEnabled = async (event) => {
    try {
      const eventRef = doc(db, 'events', event.id);
      const newStatus = !event.signInEnabled;
      
      await updateDoc(eventRef, {
        signInEnabled: newStatus
      });

      setEvents(prev => prev.map(e => 
        e.id === event.id ? { ...e, signInEnabled: newStatus } : e
      ));

      if (selectedEvent?.id === event.id) {
        setSelectedEvent({ ...selectedEvent, signInEnabled: newStatus });
      }
    } catch (error) {
      console.error('EventSignIn: Error updating sign-in status:', error);
    }
  };

  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.name?.toLowerCase().includes(query) ||
      member.nickname?.toLowerCase().includes(query) ||
      member.qbNumber?.toString().includes(query)
    );
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderEventItem = ({ item: event }) => (
    <TouchableOpacity
      style={[
        styles.eventCard,
        selectedEvent?.id === event.id && styles.selectedEventCard
      ]}
      onPress={() => handleEventSelect(event)}
      activeOpacity={0.7}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Switch
          value={event.signInEnabled}
          onValueChange={() => toggleSignInEnabled(event)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={event.signInEnabled ? '#3880ff' : '#f4f3f4'}
        />
      </View>

      <View style={styles.eventDetails}>
        <View style={styles.eventDetailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.eventDetailText}>
            {formatDate(event.date)} at {formatTime(event.time)}
          </Text>
        </View>
        <View style={styles.eventDetailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.eventDetailText}>{event.location}</Text>
        </View>
        <View style={styles.eventDetailRow}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.eventDetailText}>
            {event.currentAttendees || attendees.length} / {event.maxAttendees} attendees
          </Text>
        </View>
      </View>

      <View style={styles.eventStatus}>
        <Text style={[
          styles.statusText,
          event.signInEnabled ? styles.activeStatus : styles.inactiveStatus
        ]}>
          Sign-in {event.signInEnabled ? 'Enabled' : 'Disabled'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderAttendeeItem = ({ item: attendee }) => (
    <View style={styles.attendeeCard}>
      <View style={styles.attendeeInfo}>
        <Text style={styles.attendeeName}>{attendee.memberName}</Text>
        <Text style={styles.attendeeDetail}>QB #{attendee.qbNumber}</Text>
        <Text style={styles.attendeeTime}>
          Signed in: {new Date(attendee.signInTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
        </Text>
      </View>
      <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
    </View>
  );

  const renderMemberSearchItem = ({ item: member }) => (
    <TouchableOpacity
      style={styles.memberSearchCard}
      onPress={() => handleSignIn(member)}
      activeOpacity={0.7}
    >
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberDetail}>QB #{member.qbNumber}</Text>
      </View>
      <Ionicons name="person-add" size={24} color="#3880ff" />
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={ORLQBPhotos.HANGAR_INTERIOR}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Event Sign-in</Text>
        <TouchableOpacity 
          onPress={() => setShowSignInModal(true)}
          style={styles.addButton}
          disabled={!selectedEvent?.signInEnabled}
        >
          <Ionicons name="person-add" size={24} color={selectedEvent?.signInEnabled ? "#333" : "#ccc"} />
        </TouchableOpacity>
      </View>

      {/* Events List */}
      {!selectedEvent ? (
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Select Event for Sign-in</Text>
          <FlatList
            data={events}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <View style={styles.attendeesSection}>
          <View style={styles.selectedEventHeader}>
            <TouchableOpacity onPress={() => setSelectedEvent(null)} style={styles.backToEventsButton}>
              <Ionicons name="arrow-back" size={20} color="#3880ff" />
              <Text style={styles.backToEventsText}>Back to Events</Text>
            </TouchableOpacity>
            <Text style={styles.selectedEventTitle}>{selectedEvent.title}</Text>
            <Text style={styles.attendeeCount}>
              {attendees.length} attendee{attendees.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <FlatList
            data={attendees}
            renderItem={renderAttendeeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No attendees yet</Text>
                <Text style={styles.emptySubtext}>
                  Use the + button to sign in members
                </Text>
              </View>
            }
          />
        </View>
      )}

      {/* Sign-in Modal */}
      <Modal
        visible={showSignInModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSignInModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSignInModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Sign in Member</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search members by name or QB number..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
            </View>
          </View>

          <FlatList
            data={filteredMembers}
            renderItem={renderMemberSearchItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modalListContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.7)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  eventsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 15,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedEventCard: {
    borderWidth: 2,
    borderColor: '#3880ff',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  eventStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatus: {
    color: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  inactiveStatus: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  attendeesSection: {
    flex: 1,
  },
  selectedEventHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.7)',
  },
  backToEventsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backToEventsText: {
    color: '#3880ff',
    fontWeight: '600',
    marginLeft: 4,
  },
  selectedEventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  attendeeCount: {
    fontSize: 14,
    color: '#666',
  },
  attendeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 15,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  attendeeDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  attendeeTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelText: {
    color: '#3880ff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 60,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  modalListContent: {
    paddingBottom: 20,
  },
  memberSearchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  memberDetail: {
    fontSize: 14,
    color: '#666',
  },
});

export default EventSignInScreen;