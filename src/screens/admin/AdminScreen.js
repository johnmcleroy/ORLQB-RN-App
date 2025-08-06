/**
 * AdminScreen - Administrative controls and management interfaces
 * 
 * This screen provides ORLQB administrators with:
 * - Calendar event management (CRUD operations)
 * - Member management tools
 * - System configuration
 * - Reports and analytics
 * - Future: Inventory, finance, and notification management
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventManager, CalendarComponent, UserManager } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { canManageSystem, getRoleDisplayName } from '../../utils/userRoles';

const AdminScreen = ({ navigation }) => {
  const { userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');

  const adminSections = [
    { 
      title: 'Event Management', 
      icon: 'calendar-outline',
      description: 'Create, edit, and manage ORLQB events',
      route: 'EventManagement',
      key: 'calendar',
      color: '#3880ff'
    },
    { 
      title: 'Member Management', 
      icon: 'people-outline',
      description: 'Manage member accounts and permissions',
      route: 'MemberManagement',
      key: 'members',
      color: '#10dc60'
    },
    { 
      title: 'Communication', 
      icon: 'mail-outline',
      description: 'Send notifications and announcements',
      route: 'Communication',
      key: 'communication',
      color: '#ffce00'
    },
    { 
      title: 'Reports & Analytics', 
      icon: 'bar-chart-outline',
      description: 'View attendance and engagement metrics',
      route: 'Reports',
      key: 'reports',
      color: '#7044ff'
    },
    { 
      title: 'System Settings', 
      icon: 'settings-outline',
      description: 'Configure app settings and preferences',
      route: 'Settings',
      key: 'settings',
      color: '#ff8c00'
    },
    { 
      title: 'Data Management', 
      icon: 'server-outline',
      description: 'Backup and restore organization data',
      route: 'DataManagement',
      key: 'data',
      color: '#f04141'
    },
  ];

  const handleSectionPress = (section) => {
    if (section.key === 'calendar') {
      setActiveTab('calendar');
    } else if (section.key === 'overview') {
      setActiveTab('overview');
    } else {
      // TODO: Navigate to specific admin sub-screens
      console.log(`Navigate to ${section.route}`);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <EventManager />;
      case 'calendarView':
        return (
          <CalendarComponent
            userRole="admin"
            onEventPress={(event) => console.log('Admin view event:', event)}
            onDatePress={(day) => console.log('Admin select date:', day)}
          />
        );
      case 'users':
        return <UserManager />;
      default:
        return (
          <ScrollView style={styles.sectionsContainer}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="people" size={24} color="#3880ff" />
                <Text style={styles.statNumber}>142</Text>
                <Text style={styles.statLabel}>Active Members</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="calendar" size={24} color="#10dc60" />
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Events This Month</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle" size={24} color="#ffce00" />
                <Text style={styles.statNumber}>89%</Text>
                <Text style={styles.statLabel}>Attendance Rate</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="notifications" size={24} color="#7044ff" />
                <Text style={styles.statNumber}>23</Text>
                <Text style={styles.statLabel}>Pending Tasks</Text>
              </View>
            </View>

            {adminSections.filter(s => s.key !== 'calendar').map((section, index) => (
              <TouchableOpacity
                key={index}
                style={styles.sectionCard}
                onPress={() => handleSectionPress(section)}
              >
                <View style={styles.sectionContent}>
                  <View style={[styles.sectionIconContainer, { backgroundColor: section.color + '20' }]}>
                    <Ionicons 
                      name={section.icon} 
                      size={28} 
                      color={section.color}
                    />
                  </View>
                  <View style={styles.sectionText}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <Text style={styles.sectionDescription}>{section.description}</Text>
                  </View>
                  <View style={styles.sectionArrow}>
                    <Ionicons 
                      name="chevron-forward-outline" 
                      size={20} 
                      color="#999" 
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.quickActions}>
              <Text style={styles.quickActionsTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity style={styles.quickActionButton}>
                  <Ionicons name="add-circle-outline" size={24} color="#3880ff" />
                  <Text style={styles.quickActionText}>New Event</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionButton}>
                  <Ionicons name="mail-outline" size={24} color="#10dc60" />
                  <Text style={styles.quickActionText}>Send Alert</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionButton}>
                  <Ionicons name="download-outline" size={24} color="#ffce00" />
                  <Text style={styles.quickActionText}>Export Data</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionButton}>
                  <Ionicons name="stats-chart-outline" size={24} color="#7044ff" />
                  <Text style={styles.quickActionText}>View Reports</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Administration</Text>
        <Text style={styles.subtitle}>
          ORLQB management and configuration
        </Text>
        <Text style={styles.roleIndicator}>
          🛡️ {getRoleDisplayName(userRole)} Access
        </Text>
      </View>

      {/* Admin Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons 
            name={activeTab === 'overview' ? 'grid' : 'grid-outline'} 
            size={18} 
            color={activeTab === 'overview' ? '#3880ff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'calendar' && styles.activeTab]}
          onPress={() => setActiveTab('calendar')}
        >
          <Ionicons 
            name={activeTab === 'calendar' ? 'calendar' : 'calendar-outline'} 
            size={18} 
            color={activeTab === 'calendar' ? '#3880ff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'calendar' && styles.activeTabText]}>
            Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'calendarView' && styles.activeTab]}
          onPress={() => setActiveTab('calendarView')}
        >
          <Ionicons 
            name={activeTab === 'calendarView' ? 'eye' : 'eye-outline'} 
            size={18} 
            color={activeTab === 'calendarView' ? '#3880ff' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'calendarView' && styles.activeTabText]}>
            View
          </Text>
        </TouchableOpacity>

        {/* Sudo Admin Only: User Management Tab */}
        {canManageSystem(userRole) && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'users' && styles.activeTab]}
            onPress={() => setActiveTab('users')}
          >
            <Ionicons 
              name={activeTab === 'users' ? 'people' : 'people-outline'} 
              size={18} 
              color={activeTab === 'users' ? '#ff0000' : '#666'} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'users' && { ...styles.activeTabText, color: '#ff0000' }
            ]}>
              👥 Users
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Content */}
      {renderTabContent()}
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
  roleIndicator: {
    fontSize: 14,
    color: '#3880ff',
    fontWeight: 'bold',
    marginTop: 8,
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
    paddingHorizontal: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3880ff',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3880ff',
    fontWeight: 'bold',
  },
  sectionsContainer: {
    flex: 1,
    padding: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 25,
    gap: 15,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  sectionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
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
  sectionArrow: {
    marginLeft: 10,
  },
  quickActions: {
    marginTop: 20,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AdminScreen;