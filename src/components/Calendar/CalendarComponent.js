/**
 * CalendarComponent - Reusable Calendar Module
 * 
 * This calendar component can be used across the app for:
 * - Members viewing meetings and events
 * - Leadmen/Admins managing events
 * - Event attendance tracking
 * - Future integration with Firebase for event storage
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { firestore } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import EventInfoScreen from '../../screens/EventInfoScreen';

const CalendarComponent = ({ 
  userRole = 'member', // 'guest', 'member', 'leadman', 'admin'
  onEventPress,
  onDatePress 
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [events, setEvents] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showEventInfo, setShowEventInfo] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Load events from Firebase on component mount
  useEffect(() => {
    if (!user) {
      // Even without a user, show monthly meetings for guests
      generateMonthlyMeetingsOnly();
      setIsLoading(false);
      return;
    }

    const unsubscribe = setupEventListener();
    return unsubscribe;
  }, [user]);

  // Generate monthly meetings only (for guests or when Firebase fails)
  const generateMonthlyMeetingsOnly = () => {
    const currentYear = new Date().getFullYear();
    const monthlyEvents = {};

    for (let year = currentYear; year <= currentYear + 1; year++) {
      for (let month = 0; month < 12; month++) {
        const secondMonday = getSecondMonday(year, month);
        const dateString = secondMonday.toISOString().split('T')[0];
        
        const monthlyMeeting = {
          id: `monthly-meeting-${dateString}`,
          title: 'ORLQB Monthly Meeting',
          time: '19:00',
          type: 'meeting',
          attendees: 0,
          location: 'Orlando QB Hangar',
          description: 'Regular monthly meeting for all ORLQB members and guests. Join us for updates, announcements, and fellowship.',
          maxAttendees: 50,
          requiresRSVP: true,
          isRecurring: true,
          recurring: 'monthly'
        };

        if (!monthlyEvents[dateString]) {
          monthlyEvents[dateString] = [];
        }
        
        monthlyEvents[dateString].push(monthlyMeeting);
      }
    }

    setEvents(monthlyEvents);
    console.log('Generated monthly meetings only:', monthlyEvents);
  };

  // Set up real-time Firestore listener for events
  const setupEventListener = () => {
    setIsLoading(true);

    if (Platform.OS === 'web') {
      // Web Firebase SDK
      const { collection, onSnapshot, orderBy, query } = require('firebase/firestore');
      
      const eventsQuery = query(
        collection(firestore(), 'events'),
        orderBy('date', 'asc')
      );

      return onSnapshot(eventsQuery, (snapshot) => {
        const eventsData = {};
        snapshot.forEach((doc) => {
          const eventData = { id: doc.id, ...doc.data() };
          const date = eventData.date;
          
          if (!eventsData[date]) {
            eventsData[date] = [];
          }
          
          // Transform data for calendar display
          eventsData[date].push({
            id: eventData.id,
            title: eventData.title,
            time: formatTime(eventData.time),
            type: eventData.type,
            attendees: eventData.currentAttendees || 0,
            location: eventData.location,
            description: eventData.description,
            maxAttendees: eventData.maxAttendees,
            requiresRSVP: eventData.requiresRSVP
          });
        });
        
        // Always include monthly meetings with Firebase events
        const currentYear = new Date().getFullYear();
        const monthlyEvents = {};

        // Generate meetings for current year and next year
        for (let year = currentYear; year <= currentYear + 1; year++) {
          for (let month = 0; month < 12; month++) {
            const secondMonday = getSecondMonday(year, month);
            const dateString = secondMonday.toISOString().split('T')[0];
            
            const monthlyMeeting = {
              id: `monthly-meeting-${dateString}`,
              title: 'ORLQB Monthly Meeting',
              time: '19:00',
              type: 'meeting',
              attendees: 0,
              location: 'Orlando QB Hangar',
              description: 'Regular monthly meeting for all ORLQB members and guests. Join us for updates, announcements, and fellowship.',
              maxAttendees: 50,
              requiresRSVP: true,
              isRecurring: true,
              recurring: 'monthly'
            };

            if (!monthlyEvents[dateString]) {
              monthlyEvents[dateString] = [];
            }
            
            monthlyEvents[dateString].push(monthlyMeeting);
          }
        }

        // Merge Firebase events with monthly meetings
        const mergedEvents = { ...eventsData };
        Object.keys(monthlyEvents).forEach(date => {
          if (mergedEvents[date]) {
            mergedEvents[date] = [...mergedEvents[date], ...monthlyEvents[date]];
          } else {
            mergedEvents[date] = monthlyEvents[date];
          }
        });

        setEvents(mergedEvents);
        setIsLoading(false);
        console.log('Calendar events loaded from Firestore and merged with monthly meetings:', mergedEvents);
      }, (error) => {
        console.error('Error loading calendar events:', error);
        // Still show monthly meetings even if Firebase fails
        generateMonthlyMeetingsOnly();
        setIsLoading(false);
      });
    } else {
      // React Native Firebase SDK
      const eventsCollection = firestore().collection('events');
      
      return eventsCollection
        .orderBy('date', 'asc')
        .onSnapshot((snapshot) => {
          const eventsData = {};
          snapshot.forEach((doc) => {
            const eventData = { id: doc.id, ...doc.data() };
            const date = eventData.date;
            
            if (!eventsData[date]) {
              eventsData[date] = [];
            }
            
            // Transform data for calendar display
            eventsData[date].push({
              id: eventData.id,
              title: eventData.title,
              time: formatTime(eventData.time),
              type: eventData.type,
              attendees: eventData.currentAttendees || 0,
              location: eventData.location,
              description: eventData.description,
              maxAttendees: eventData.maxAttendees,
              requiresRSVP: eventData.requiresRSVP
            });
          });
          
          // Always include monthly meetings with Firebase events
          const currentYear = new Date().getFullYear();
          const monthlyEvents = {};

          // Generate meetings for current year and next year
          for (let year = currentYear; year <= currentYear + 1; year++) {
            for (let month = 0; month < 12; month++) {
              const secondMonday = getSecondMonday(year, month);
              const dateString = secondMonday.toISOString().split('T')[0];
              
              const monthlyMeeting = {
                id: `monthly-meeting-${dateString}`,
                title: 'ORLQB Monthly Meeting',
                time: '19:00',
                type: 'meeting',
                attendees: 0,
                location: 'Orlando QB Hangar',
                description: 'Regular monthly meeting for all ORLQB members and guests. Join us for updates, announcements, and fellowship.',
                maxAttendees: 50,
                requiresRSVP: true,
                isRecurring: true,
                recurring: 'monthly'
              };

              if (!monthlyEvents[dateString]) {
                monthlyEvents[dateString] = [];
              }
              
              monthlyEvents[dateString].push(monthlyMeeting);
            }
          }

          // Merge Firebase events with monthly meetings
          const mergedEvents = { ...eventsData };
          Object.keys(monthlyEvents).forEach(date => {
            if (mergedEvents[date]) {
              mergedEvents[date] = [...mergedEvents[date], ...monthlyEvents[date]];
            } else {
              mergedEvents[date] = monthlyEvents[date];
            }
          });

          setEvents(mergedEvents);
          setIsLoading(false);
          console.log('Calendar events loaded from Firestore and merged with monthly meetings:', mergedEvents);
        }, (error) => {
          console.error('Error loading calendar events:', error);
          // Still show monthly meetings even if Firebase fails
          generateMonthlyMeetingsOnly();
          setIsLoading(false);
        });
    }
  };

  // Helper function to format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString; // Return original if parsing fails
    }
  };

  // Function to calculate the 2nd Monday of a given month
  const getSecondMonday = (year, month) => {
    const date = new Date(year, month, 1);
    
    // Find the first Monday
    while (date.getDay() !== 1) {
      date.setDate(date.getDate() + 1);
    }
    
    // Add 7 days to get the second Monday
    date.setDate(date.getDate() + 7);
    
    return date;
  };


  // Create marked dates for calendar display
  const getMarkedDates = () => {
    const marked = {};
    
    console.log('getMarkedDates: events object has', Object.keys(events).length, 'dates');
    console.log('getMarkedDates: events object:', events);
    
    Object.keys(events).forEach(date => {
      marked[date] = {
        marked: true,
        dotColor: '#3880ff',
        selected: date === selectedDate,
        selectedColor: date === selectedDate ? '#3880ff' : undefined
      };
    });

    console.log('getMarkedDates: marked dates:', marked);
    return marked;
  };

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);
    
    if (events[dateString]) {
      setSelectedEvents(events[dateString]);
      setShowEventModal(true);
    }
    
    if (onDatePress) {
      onDatePress(day);
    }
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

  const canManageEvents = () => {
    return userRole === 'leadman' || userRole === 'admin';
  };

  const handleEventPress = (event) => {
    setSelectedEvent({ ...event, date: selectedDate });
    setShowEventModal(false);
    setShowEventInfo(true);
    
    if (onEventPress) {
      onEventPress(event);
    }
  };

  const handleEventRSVP = (event, rsvpStatus) => {
    console.log('RSVP updated:', event.title, rsvpStatus);
    // TODO: Update Firebase with RSVP status
  };

  const renderEventModal = () => (
    <Modal
      visible={showEventModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowEventModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            Events for {selectedDate}
          </Text>
          <TouchableOpacity
            onPress={() => setShowEventModal(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.eventsContainer}>
          {selectedEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={[styles.eventCard, { borderLeftColor: getEventTypeColor(event.type) }]}
              onPress={() => handleEventPress(event)}
            >
              <View style={styles.eventHeader}>
                <Ionicons 
                  name={getEventTypeIcon(event.type)} 
                  size={20} 
                  color={getEventTypeColor(event.type)}
                  style={styles.eventIcon}
                />
                <Text style={styles.eventTitle}>{event.title}</Text>
              </View>
              
              <View style={styles.eventDetails}>
                <View style={styles.eventTime}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.eventTimeText}>{event.time}</Text>
                </View>
                
                <View style={styles.eventAttendees}>
                  <Ionicons name="people-outline" size={16} color="#666" />
                  <Text style={styles.eventAttendeesText}>
                    {event.attendees > 0 ? `${event.attendees} attending` : 'No RSVPs yet'}
                  </Text>
                </View>
              </View>

              {userRole !== 'guest' && (
                <View style={styles.eventActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>
                      {event.attendees > 0 && event.attendees < 50 ? 'RSVP' : 'View Details'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {canManageEvents() && (
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.addEventButton}>
              <Ionicons name="add-outline" size={20} color="white" />
              <Text style={styles.addEventButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="hourglass-outline" size={48} color="#666" />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  // Show authentication required message
  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="lock-closed-outline" size={48} color="#666" />
        <Text style={styles.errorText}>Please sign in to view the calendar</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.calendarHeader}>
        <Text style={styles.calendarTitle}>ORLQB Events Calendar</Text>
        {canManageEvents() && (
          <TouchableOpacity style={styles.manageButton}>
            <Ionicons name="settings-outline" size={20} color="#3880ff" />
          </TouchableOpacity>
        )}
      </View>

      <Calendar
        style={styles.calendar}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#3880ff',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#3880ff',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#3880ff',
          selectedDotColor: '#ffffff',
          arrowColor: '#3880ff',
          monthTextColor: '#2d4150',
          indicatorColor: '#3880ff',
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14
        }}
        markedDates={getMarkedDates()}
        onDayPress={handleDayPress}
        enableSwipeMonths={true}
        hideExtraDays={true}
        disableMonthChange={false}
        firstDay={0} // Sunday first
        hideDayNames={false}
        showWeekNumbers={false}
        disableArrowLeft={false}
        disableArrowRight={false}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3880ff' }]} />
          <Text style={styles.legendText}>Events scheduled</Text>
        </View>
      </View>

      {renderEventModal()}
      
      {/* Event Info Screen */}
      <EventInfoScreen
        event={selectedEvent}
        visible={showEventInfo}
        onClose={() => setShowEventInfo(false)}
        onRSVP={handleEventRSVP}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  manageButton: {
    padding: 5,
  },
  calendar: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
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
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  eventsContainer: {
    flex: 1,
    padding: 20,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventIcon: {
    marginRight: 10,
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
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventTimeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  eventAttendees: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventAttendeesText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  eventActions: {
    alignItems: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#3880ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addEventButton: {
    backgroundColor: '#10dc60',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
  },
  addEventButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default CalendarComponent;