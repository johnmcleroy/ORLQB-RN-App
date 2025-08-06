/**
 * EventManager - Administrative CRUD interface for calendar events
 * 
 * This component provides administrators with full control over calendar events:
 * - Create new events
 * - Read/View existing events
 * - Update event details
 * - Delete events
 * - Manage event types and categories
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Switch
} from 'react-native';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { hasSecurityLevel, HANGAR_ROLES } from '../../utils/userRoles';

const EventManager = () => {
  const { user, userRole } = useAuth();
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    types: [],
    description: '',
    location: '',
    maxAttendees: '',
    requiresRSVP: true,
    isRecurring: false,
    recurringPattern: {
      frequency: 'monthly', // 'weekly', 'monthly', 'yearly'
      dayOfWeek: 1, // 0=Sunday, 1=Monday, etc.
      weekOfMonth: 2, // 1=1st, 2=2nd, 3=3rd, 4=4th, -1=last
      monthInterval: 1, // every 1 month, every 2 months, etc.
      endDate: '', // when to stop recurring
      customDescription: '' // e.g. "2nd Monday of each month"
    },
    notifyMembers: true
  });

  // Firebase Firestore integration
  useEffect(() => {
    if (!user) {
      console.log('No user authenticated');
      setIsLoading(false);
      return;
    }

    // Check user role permissions (Level 3+ Leadmen only)
    if (!hasSecurityLevel(userRole, 3)) {
      Alert.alert('Access Denied', 'Leadership privileges required to manage events');
      setIsLoading(false);
      return;
    }

    // Set up real-time listener for events
    const unsubscribe = setupEventListener();

    // Cleanup listener on unmount
    return unsubscribe;
  }, [user]);


  // Set up real-time Firestore listener
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
        const eventsData = [];
        snapshot.forEach((doc) => {
          eventsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setEvents(eventsData);
        setIsLoading(false);
        console.log('Events loaded from Firestore:', eventsData.length);
      }, (error) => {
        console.error('Error listening to events:', error);
        setIsLoading(false);
        Alert.alert('Error', 'Failed to load events from server');
      });
    } else {
      // React Native Firebase SDK
      const eventsCollection = firestore().collection('events');
      
      return eventsCollection
        .orderBy('date', 'asc')
        .onSnapshot((snapshot) => {
          const eventsData = [];
          snapshot.forEach((doc) => {
            eventsData.push({
              id: doc.id,
              ...doc.data()
            });
          });
          setEvents(eventsData);
          setIsLoading(false);
          console.log('Events loaded from Firestore:', eventsData.length);
        }, (error) => {
          console.error('Error listening to events:', error);
          setIsLoading(false);
          Alert.alert('Error', 'Failed to load events from server');
        });
    }
  };

  // ORLQB-specific event types for authentic gatherings
  const eventTypes = [
    { value: 'monthly_meeting', label: 'Monthly Meeting', color: '#3880ff', icon: 'calendar-outline' },
    { value: 'wing_ding', label: 'Wing Ding', color: '#10dc60', icon: 'airplane-outline' },
    { value: 'initiation', label: 'Initiation', color: '#ffce00', icon: 'ribbon-outline' },
    { value: 'special_event', label: 'Special Event', color: '#f04141', icon: 'star-outline' },
    { value: 'leadership_meeting', label: 'Leadership Meeting', color: '#7044ff', icon: 'medal-outline' },
    { value: 'training', label: 'Training', color: '#ff8c00', icon: 'library-outline' }
  ];

  const openEventForm = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        date: event.date,
        time: event.time,
        types: event.types || [event.type] || [], // Handle legacy single type
        description: event.description,
        location: event.location,
        maxAttendees: event.maxAttendees?.toString() || '',
        requiresRSVP: event.requiresRSVP,
        isRecurring: event.isRecurring,
        recurringPattern: event.recurringPattern || {
          frequency: 'monthly',
          dayOfWeek: 1,
          weekOfMonth: 2,
          monthInterval: 1,
          endDate: '',
          customDescription: ''
        },
        notifyMembers: event.notifyMembers
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        date: '',
        time: '',
        types: [],
        description: '',
        location: '',
        maxAttendees: '',
        requiresRSVP: true,
        isRecurring: false,
        recurringPattern: {
          frequency: 'monthly',
          dayOfWeek: 1,
          weekOfMonth: 2,
          monthInterval: 1,
          endDate: '',
          customDescription: ''
        },
        notifyMembers: true
      });
    }
    setShowEventForm(true);
  };

  const closeEventForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      date: '',
      time: '',
      types: [],
      description: '',
      location: '',
      maxAttendees: '',
      requiresRSVP: true,
      isRecurring: false,
      recurringPattern: {
        frequency: 'monthly',
        dayOfWeek: 1,
        weekOfMonth: 2,
        monthInterval: 1,
        endDate: '',
        customDescription: ''
      },
      notifyMembers: true
    });
  };

  // Helper functions for recurring date patterns
  const getDayName = (dayIndex) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  const getWeekOrdinal = (week) => {
    const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th'];
    return week === -1 ? 'Last' : ordinals[week];
  };

  const generateRecurringDescription = (pattern) => {
    if (pattern.customDescription) {
      return pattern.customDescription;
    }
    
    switch (pattern.frequency) {
      case 'weekly':
        return `Every ${getDayName(pattern.dayOfWeek)}`;
      case 'monthly':
        return `${getWeekOrdinal(pattern.weekOfMonth)} ${getDayName(pattern.dayOfWeek)} of each month`;
      case 'yearly':
        return `Annually on the same date`;
      default:
        return 'Custom recurring pattern';
    }
  };

  // Toggle event type selection (multi-select)
  const toggleEventType = (typeValue) => {
    const currentTypes = [...formData.types];
    const typeIndex = currentTypes.indexOf(typeValue);
    
    if (typeIndex > -1) {
      // Remove type if already selected
      currentTypes.splice(typeIndex, 1);
    } else {
      // Add type if not selected
      currentTypes.push(typeValue);
    }
    
    setFormData({ ...formData, types: currentTypes });
  };

  const saveEvent = async () => {
    // Validation
    if (!formData.title || !formData.date || !formData.time) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.types.length === 0) {
      Alert.alert('Error', 'Please select at least one event type');
      return;
    }

    // Check permissions before saving (Level 3+ Leadmen)
    if (!hasSecurityLevel(userRole, 3)) {
      Alert.alert('Access Denied', 'Leadership privileges required to manage events');
      return;
    }

    const eventData = {
      ...formData,
      maxAttendees: parseInt(formData.maxAttendees) || 0,
      createdBy: user?.email || 'Unknown',
      updatedAt: new Date().toISOString(),
      currentAttendees: editingEvent?.currentAttendees || 0,
      // Add recurring pattern info if recurring
      ...(formData.isRecurring && {
        recurringDescription: generateRecurringDescription(formData.recurringPattern)
      }),
      // Keep backward compatibility with single type
      type: formData.types[0] || 'meeting' // First type for backward compatibility
    };

    // Add createdAt only for new events
    if (!editingEvent) {
      eventData.createdAt = new Date().toISOString();
    }

    try {
      if (Platform.OS === 'web') {
        // Web Firebase SDK
        const { doc, addDoc, updateDoc, collection } = require('firebase/firestore');

        if (editingEvent) {
          // Update existing event
          const eventRef = doc(firestore(), 'events', editingEvent.id);
          await updateDoc(eventRef, eventData);
          Alert.alert('Success', 'Event updated successfully');
        } else {
          // Create new event
          await addDoc(collection(firestore(), 'events'), eventData);
          Alert.alert('Success', 'Event created successfully');
        }
      } else {
        // React Native Firebase SDK
        const eventsCollection = firestore().collection('events');

        if (editingEvent) {
          // Update existing event
          await eventsCollection.doc(editingEvent.id).update(eventData);
          Alert.alert('Success', 'Event updated successfully');
        } else {
          // Create new event
          await eventsCollection.add(eventData);
          Alert.alert('Success', 'Event created successfully');
        }
      }

      closeEventForm();
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'Failed to save event. Please try again.');
    }
  };

  const deleteEvent = (eventId) => {
    // Check permissions before deleting (Level 3+ Leadmen)
    if (!hasSecurityLevel(userRole, 3)) {
      Alert.alert('Access Denied', 'Leadership privileges required to delete events');
      return;
    }

    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (Platform.OS === 'web') {
                // Web Firebase SDK
                const { doc, deleteDoc } = require('firebase/firestore');
                const eventRef = doc(firestore(), 'events', eventId);
                await deleteDoc(eventRef);
              } else {
                // React Native Firebase SDK
                await firestore().collection('events').doc(eventId).delete();
              }
              
              Alert.alert('Success', 'Event deleted successfully');
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getEventTypeInfo = (type) => {
    return eventTypes.find(t => t.value === type) || eventTypes[0];
  };

  const renderEventItem = ({ item }) => {
    const typeInfo = getEventTypeInfo(item.type);
    
    return (
      <View style={[styles.eventItem, { borderLeftColor: typeInfo.color }]}>
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleRow}>
            <Ionicons name={typeInfo.icon} size={20} color={typeInfo.color} />
            <Text style={styles.eventTitle}>{item.title}</Text>
          </View>
          <View style={styles.eventActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEventForm(item)}
            >
              <Ionicons name="create-outline" size={20} color="#3880ff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteEvent(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#f04141" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.eventDetails}>
          <Text style={styles.eventDate}>📅 {item.date} at {item.time}</Text>
          <Text style={styles.eventLocation}>📍 {item.location}</Text>
          <Text style={styles.eventAttendance}>
            👥 {item.currentAttendees}/{item.maxAttendees} attendees
          </Text>
          <Text style={styles.eventDescription}>{item.description}</Text>
        </View>

        <View style={styles.eventTags}>
          {/* Display multiple event types */}
          {(item.types || [item.type]).filter(Boolean).map((eventType) => {
            const typeDetails = getEventTypeInfo(eventType);
            return (
              <View key={eventType} style={[styles.tag, { backgroundColor: typeDetails.color }]}>
                <Text style={styles.tagText}>{typeDetails.label}</Text>
              </View>
            );
          })}
          
          {item.isRecurring && (
            <View style={[styles.tag, { backgroundColor: '#666' }]}>
              <Text style={styles.tagText}>
                {item.recurringDescription || 'Recurring'}
              </Text>
            </View>
          )}
          {item.requiresRSVP && (
            <View style={[styles.tag, { backgroundColor: '#10dc60' }]}>
              <Text style={styles.tagText}>RSVP Required</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEventForm = () => (
    <Modal
      visible={showEventForm}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeEventForm}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </Text>
          <TouchableOpacity onPress={closeEventForm} style={styles.closeButton}>
            <Ionicons name="close-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer}>
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Event Details</Text>
            
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Event Title *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter event title"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formField, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.fieldLabel}>Date *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={[styles.formField, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.fieldLabel}>Time *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.time}
                  onChangeText={(text) => setFormData({ ...formData, time: text })}
                  placeholder="HH:MM"
                />
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Event Types (Multi-Select)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {eventTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      { borderColor: type.color },
                      formData.types.includes(type.value) && { backgroundColor: type.color }
                    ]}
                    onPress={() => toggleEventType(type.value)}
                  >
                    <Ionicons 
                      name={type.icon} 
                      size={20} 
                      color={formData.types.includes(type.value) ? 'white' : type.color} 
                    />
                    <Text style={[
                      styles.typeOptionText,
                      { color: formData.types.includes(type.value) ? 'white' : type.color }
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Selected Types Display */}
              {formData.types.length > 0 && (
                <View style={styles.selectedTypesContainer}>
                  <Text style={styles.selectedTypesLabel}>Selected Types:</Text>
                  <View style={styles.selectedTypesList}>
                    {formData.types.map((selectedType) => {
                      const typeInfo = eventTypes.find(t => t.value === selectedType);
                      return (
                        <View key={selectedType} style={[styles.selectedTypeChip, { backgroundColor: typeInfo.color }]}>
                          <Ionicons name={typeInfo.icon} size={14} color="white" />
                          <Text style={styles.selectedTypeText}>{typeInfo.label}</Text>
                          <TouchableOpacity 
                            onPress={() => toggleEventType(selectedType)}
                            style={styles.removeTypeButton}
                          >
                            <Ionicons name="close-outline" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Event location"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Event description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Max Attendees</Text>
              <TextInput
                style={styles.textInput}
                value={formData.maxAttendees}
                onChangeText={(text) => setFormData({ ...formData, maxAttendees: text })}
                placeholder="Maximum number of attendees"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>Event Options</Text>
            
            <View style={styles.switchField}>
              <Text style={styles.switchLabel}>Requires RSVP</Text>
              <Switch
                value={formData.requiresRSVP}
                onValueChange={(value) => setFormData({ ...formData, requiresRSVP: value })}
              />
            </View>

            <View style={styles.switchField}>
              <Text style={styles.switchLabel}>Recurring Event</Text>
              <Switch
                value={formData.isRecurring}
                onValueChange={(value) => setFormData({ ...formData, isRecurring: value })}
              />
            </View>

            {/* Recurring Pattern Options */}
            {formData.isRecurring && (
              <View style={styles.recurringSection}>
                <Text style={styles.recurringTitle}>Recurring Pattern</Text>
                
                {/* Frequency Selection */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Frequency</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.frequencySelector}>
                    {['weekly', 'monthly', 'yearly'].map((freq) => (
                      <TouchableOpacity
                        key={freq}
                        style={[
                          styles.frequencyOption,
                          formData.recurringPattern.frequency === freq && styles.frequencyOptionSelected
                        ]}
                        onPress={() => setFormData({
                          ...formData,
                          recurringPattern: { ...formData.recurringPattern, frequency: freq }
                        })}
                      >
                        <Text style={[
                          styles.frequencyOptionText,
                          formData.recurringPattern.frequency === freq && styles.frequencyOptionTextSelected
                        ]}>
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Monthly Pattern Options */}
                {formData.recurringPattern.frequency === 'monthly' && (
                  <>
                    <View style={styles.formRow}>
                      <View style={[styles.formField, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.fieldLabel}>Week of Month</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {[1, 2, 3, 4, -1].map((week) => (
                            <TouchableOpacity
                              key={week}
                              style={[
                                styles.weekOption,
                                formData.recurringPattern.weekOfMonth === week && styles.weekOptionSelected
                              ]}
                              onPress={() => setFormData({
                                ...formData,
                                recurringPattern: { ...formData.recurringPattern, weekOfMonth: week }
                              })}
                            >
                              <Text style={[
                                styles.weekOptionText,
                                formData.recurringPattern.weekOfMonth === week && styles.weekOptionTextSelected
                              ]}>
                                {getWeekOrdinal(week)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>

                      <View style={[styles.formField, { flex: 1, marginLeft: 10 }]}>
                        <Text style={styles.fieldLabel}>Day of Week</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                            <TouchableOpacity
                              key={day}
                              style={[
                                styles.dayOption,
                                formData.recurringPattern.dayOfWeek === day && styles.dayOptionSelected
                              ]}
                              onPress={() => setFormData({
                                ...formData,
                                recurringPattern: { ...formData.recurringPattern, dayOfWeek: day }
                              })}
                            >
                              <Text style={[
                                styles.dayOptionText,
                                formData.recurringPattern.dayOfWeek === day && styles.dayOptionTextSelected
                              ]}>
                                {getDayName(day).substring(0, 3)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>

                    {/* Pattern Description */}
                    <View style={styles.patternPreview}>
                      <Text style={styles.patternPreviewLabel}>Pattern:</Text>
                      <Text style={styles.patternPreviewText}>
                        {generateRecurringDescription(formData.recurringPattern)}
                      </Text>
                    </View>
                  </>
                )}

                {/* Custom Description Override */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Custom Description (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.recurringPattern.customDescription}
                    onChangeText={(text) => setFormData({
                      ...formData,
                      recurringPattern: { ...formData.recurringPattern, customDescription: text }
                    })}
                    placeholder="e.g., 2nd Monday of each month"
                  />
                </View>
              </View>
            )}

            <View style={styles.switchField}>
              <Text style={styles.switchLabel}>Notify Members</Text>
              <Switch
                value={formData.notifyMembers}
                onValueChange={(value) => setFormData({ ...formData, notifyMembers: value })}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={closeEventForm}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={saveEvent}>
            <Text style={styles.saveButtonText}>
              {editingEvent ? 'Update Event' : 'Create Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Show loading or permission denied state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="hourglass-outline" size={48} color="#666" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="lock-closed-outline" size={48} color="#666" />
        <Text style={styles.errorText}>Please sign in to manage events</Text>
      </View>
    );
  }

  if (!hasSecurityLevel(userRole, 3)) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="shield-outline" size={48} color="#666" />
        <Text style={styles.errorText}>Leadership Access Required</Text>
        <Text style={styles.errorSubtext}>Level 3+ Leadmen privileges needed</Text>
        <Text style={styles.errorSubtext}>Current role: {userRole}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ORLQB Event Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openEventForm()}>
          <Ionicons name="add-outline" size={20} color="white" />
          <Text style={styles.addButtonText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{events.length}</Text>
          <Text style={styles.statLabel}>Total Events</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {events.reduce((sum, event) => sum + (event.currentAttendees || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Total RSVPs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {events.filter(e => e.isRecurring).length}
          </Text>
          <Text style={styles.statLabel}>Recurring</Text>
        </View>
      </View>

      {events.length === 0 ? (
        <View style={[styles.centerContent, { flex: 1 }]}>
          <Ionicons name="calendar-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No events found</Text>
          <Text style={styles.emptySubtext}>Create your first event to get started</Text>
        </View>
      ) : (
        <FlatList
          data={events.sort((a, b) => new Date(a.date) - new Date(b.date))}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.eventsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderEventForm()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10dc60',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 15,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3880ff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  eventItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  eventActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  eventDetails: {
    marginBottom: 10,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventAttendance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  eventTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 30,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  formField: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
  typeOptionText: {
    marginLeft: 6,
    fontWeight: 'bold',
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3880ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Multi-Select Event Types Styles
  selectedTypesContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedTypesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedTypesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  selectedTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  removeTypeButton: {
    marginLeft: 4,
    padding: 2,
  },
  // Recurring Pattern Styles
  recurringSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cce7ff',
  },
  recurringTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  frequencySelector: {
    flexDirection: 'row',
  },
  frequencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3880ff',
    marginRight: 10,
    backgroundColor: 'white',
  },
  frequencyOptionSelected: {
    backgroundColor: '#3880ff',
  },
  frequencyOptionText: {
    color: '#3880ff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  frequencyOptionTextSelected: {
    color: 'white',
  },
  weekOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#10dc60',
    marginRight: 8,
    backgroundColor: 'white',
    minWidth: 50,
    alignItems: 'center',
  },
  weekOptionSelected: {
    backgroundColor: '#10dc60',
  },
  weekOptionText: {
    color: '#10dc60',
    fontWeight: 'bold',
    fontSize: 12,
  },
  weekOptionTextSelected: {
    color: 'white',
  },
  dayOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffce00',
    marginRight: 8,
    backgroundColor: 'white',
    minWidth: 40,
    alignItems: 'center',
  },
  dayOptionSelected: {
    backgroundColor: '#ffce00',
  },
  dayOptionText: {
    color: '#ffce00',
    fontWeight: 'bold',
    fontSize: 12,
  },
  dayOptionTextSelected: {
    color: 'white',
  },
  patternPreview: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c3e6c3',
  },
  patternPreviewLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d5a2d',
    marginBottom: 4,
  },
  patternPreviewText: {
    fontSize: 16,
    color: '#2d5a2d',
    fontStyle: 'italic',
  },
});

export default EventManager;