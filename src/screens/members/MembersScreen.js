/**
 * MembersScreen - Member-specific functionality and resources
 * 
 * This screen provides ORLQB members with access to:
 * - Event calendar and meeting schedules
 * - Member directory and communication
 * - Member-specific resources and tools
 * - Future: Attendance tracking, notifications, etc.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarComponent } from '../../components';

const MembersScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('calendar');

  const memberSections = [
    { 
      title: 'Meeting Calendar', 
      icon: 'calendar-outline',
      description: 'View upcoming meetings and events',
      route: 'MemberCalendar',
      key: 'calendar'
    },
    { 
      title: 'Member Directory', 
      icon: 'people-outline',
      description: 'Connect with fellow ORLQB members',
      route: 'MemberDirectory',
      key: 'directory'
    },
    { 
      title: 'Meeting Minutes', 
      icon: 'document-text-outline',
      description: 'Access past meeting records',
      route: 'MeetingMinutes',
      key: 'minutes'
    },
    { 
      title: 'Member Resources', 
      icon: 'library-outline',
      description: 'ORLQB documents and guidelines',
      route: 'MemberResources',
      key: 'resources'
    },
    { 
      title: 'Event Sign-in', 
      icon: 'checkmark-circle-outline',
      description: 'Check in to meetings and events',
      route: 'EventSignIn',
      key: 'signin'
    },
    { 
      title: 'Notifications', 
      icon: 'notifications-outline',
      description: 'Important updates and reminders',
      route: 'MemberNotifications',
      key: 'notifications'
    },
  ];

  const handleSectionPress = (section) => {
    if (section.key === 'calendar') {
      setActiveTab('calendar');
    } else {
      // TODO: Navigate to specific member sub-screens
      console.log(`Navigate to ${section.route}`);
    }
  };

  const handleEventPress = (event) => {
    console.log('Event pressed:', event);
    // TODO: Navigate to event details screen
  };

  const handleDatePress = (day) => {
    console.log('Date pressed:', day);
    // TODO: Handle date selection for new events (if user has permissions)
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <CalendarComponent
            userRole="member"
            onEventPress={handleEventPress}
            onDatePress={handleDatePress}
          />
        );
      default:
        return (
          <View style={styles.sectionsContainer}>
            {memberSections.filter(s => s.key !== 'calendar').map((section, index) => (
              <TouchableOpacity
                key={index}
                style={styles.sectionCard}
                onPress={() => handleSectionPress(section)}
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
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Member Portal</Text>
        <Text style={styles.subtitle}>
          Welcome to the ORLQB member area
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'resources' && styles.activeTab]}
          onPress={() => setActiveTab('resources')}
        >
          <Ionicons 
            name={activeTab === 'resources' ? 'grid' : 'grid-outline'} 
            size={20} 
            color={activeTab === 'resources' ? '#3880ff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'resources' && styles.activeTabText]}>
            Resources
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'calendar' && styles.activeTab]}
          onPress={() => setActiveTab('calendar')}
        >
          <Ionicons 
            name={activeTab === 'calendar' ? 'calendar' : 'calendar-outline'} 
            size={20} 
            color={activeTab === 'calendar' ? '#3880ff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'calendar' && styles.activeTabText]}>
            Calendar
          </Text>
        </TouchableOpacity>

        
      </View>

      {/* Tab Content */}
      {renderTabContent()}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3880ff',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3880ff',
    fontWeight: 'bold',
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

export default MembersScreen;