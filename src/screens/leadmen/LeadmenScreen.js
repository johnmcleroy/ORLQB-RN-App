/**
 * LeadmenScreen - ORLQB Leadership Dashboard
 * 
 * Administrative interface for Leadmen to manage ORLQB gatherings and events.
 * Provides tools for the 4 main types of ORLQB gatherings:
 * - Monthly Meetings
 * - Wing Dings  
 * - Initiations
 * - Special Events
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { RoleBasedComponent } from '../../components/Auth';
import { hasSecurityLevel, getRoleDisplayName, getRoleIcon, getRoleColor, HANGAR_ROLES } from '../../utils/userRoles';
import { EventManager } from '../../components/Calendar';
import { MemberManager } from '../../components/Members';
import { ResourceManager } from '../../components/Resources';
import { ReportsManager } from '../../components/Reports';
import { MemberDataImporter } from '../../components/Admin';

const LeadmenScreen = () => {
  const { user, userRole } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [showMemberImporter, setShowMemberImporter] = useState(false);
  const [quickStats, setQuickStats] = useState({
    upcomingEvents: 0,
    monthlyMeetings: 0,
    wingDings: 0,
    initiations: 0,
    specialEvents: 0
  });

  // ORLQB Gathering Types with specific configurations
  const gatheringTypes = [
    {
      id: 'monthly_meetings',
      title: 'Monthly Meetings',
      description: 'Regular Hangar meetings for business and fellowship',
      icon: 'calendar-outline',
      color: '#3880ff',
      count: quickStats.monthlyMeetings,
      responsibilities: [
        'Schedule meeting location and time',
        'Prepare agenda and materials',
        'Coordinate member notifications',
        'Manage meeting logistics'
      ]
    },
    {
      id: 'wing_dings',
      title: 'Wing Dings',
      description: 'Social gatherings and celebrations',
      icon: 'airplane-outline',
      color: '#10dc60',
      count: quickStats.wingDings,
      responsibilities: [
        'Plan entertainment and activities',
        'Coordinate catering and venue',
        'Manage guest list and invitations',
        'Oversee event execution'
      ]
    },
    {
      id: 'initiations',
      title: 'Initiations',
      description: 'Ceremonies for new member induction',
      icon: 'ribbon-outline',
      color: '#ffce00',
      count: quickStats.initiations,
      responsibilities: [
        'Prepare ceremonial materials',
        'Coordinate with candidates',
        'Arrange venue and setup',
        'Ensure protocol compliance'
      ]
    },
    {
      id: 'special_events',
      title: 'Special Events',
      description: 'Commemorative and unique gatherings',
      icon: 'star-outline',
      color: '#f04141',
      count: quickStats.specialEvents,
      responsibilities: [
        'Plan unique event requirements',
        'Coordinate special arrangements',
        'Manage external partnerships',
        'Handle special logistics'
      ]
    }
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh - in real app, this would reload data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderUserRoleInfo = () => (
    <View style={styles.roleInfoCard}>
      <View style={styles.roleHeader}>
        <Ionicons 
          name={getRoleIcon(userRole)} 
          size={24} 
          color={getRoleColor(userRole)} 
        />
        <Text style={[styles.roleName, { color: getRoleColor(userRole) }]}>
          {getRoleDisplayName(userRole)}
        </Text>
      </View>
      <Text style={styles.roleDescription}>
        ORLQB Leadership - Orlando Hangar
      </Text>
    </View>
  );

  const renderGatheringCard = (gathering) => (
    <TouchableOpacity 
      key={gathering.id}
      style={styles.gatheringCard}
      onPress={() => Alert.alert(
        gathering.title,
        `Manage ${gathering.title.toLowerCase()} - Coming Soon!\n\n${gathering.description}`,
        [{ text: 'OK' }]
      )}
    >
      <View style={styles.gatheringHeader}>
        <View style={[styles.gatheringIcon, { backgroundColor: gathering.color }]}>
          <Ionicons name={gathering.icon} size={24} color="white" />
        </View>
        <View style={styles.gatheringInfo}>
          <Text style={styles.gatheringTitle}>{gathering.title}</Text>
          <Text style={styles.gatheringDescription}>{gathering.description}</Text>
        </View>
        <View style={styles.gatheringStats}>
          <Text style={[styles.gatheringCount, { color: gathering.color }]}>
            {gathering.count}
          </Text>
          <Text style={styles.gatheringLabel}>Scheduled</Text>
        </View>
      </View>
      
      <View style={styles.responsibilitiesSection}>
        <Text style={styles.responsibilitiesTitle}>Key Responsibilities:</Text>
        {gathering.responsibilities.slice(0, 2).map((responsibility, index) => (
          <View key={index} style={styles.responsibilityItem}>
            <Text style={styles.responsibilityBullet}>•</Text>
            <Text style={styles.responsibilityText}>{responsibility}</Text>
          </View>
        ))}
        {gathering.responsibilities.length > 2 && (
          <Text style={styles.moreResponsibilities}>
            +{gathering.responsibilities.length - 2} more responsibilities
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: '#3880ff' }]}
          onPress={() => setActiveSection('events')}
        >
          <Ionicons name="calendar-outline" size={28} color="white" />
          <Text style={styles.quickActionText}>Event Manager</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: '#10dc60' }]}
          onPress={() => setActiveSection('members')}
        >
          <Ionicons name="people-outline" size={28} color="white" />
          <Text style={styles.quickActionText}>Members</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: '#ffce00' }]}
          onPress={() => setActiveSection('resources')}
        >
          <Ionicons name="library-outline" size={28} color="white" />
          <Text style={styles.quickActionText}>Resources</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: '#f04141' }]}
          onPress={() => setActiveSection('reports')}
        >
          <Ionicons name="analytics-outline" size={28} color="white" />
          <Text style={styles.quickActionText}>Reports</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDashboard = () => (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>ORLQB Leadership</Text>
        <Text style={styles.subtitle}>Hangar Event Management</Text>
      </View>

      {renderUserRoleInfo()}
      {renderQuickActions()}

      <View style={styles.gatheringsSection}>
        <Text style={styles.sectionTitle}>ORLQB Gatherings</Text>
        <Text style={styles.sectionSubtitle}>
          Manage the 4 main types of ORLQB gatherings
        </Text>
        {gatheringTypes.map(renderGatheringCard)}
      </View>

      <View style={styles.leadershipNotes}>
        <Text style={styles.notesTitle}>Leadership Reminders</Text>
        <View style={styles.noteItem}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#10dc60" />
          <Text style={styles.noteText}>
            All gatherings require proper planning and resource allocation
          </Text>
        </View>
        <View style={styles.noteItem}>
          <Ionicons name="time-outline" size={16} color="#3880ff" />
          <Text style={styles.noteText}>
            Monthly meetings should be scheduled consistently
          </Text>
        </View>
        <View style={styles.noteItem}>
          <Ionicons name="people-outline" size={16} color="#ffce00" />
          <Text style={styles.noteText}>
            Coordinate with other Leadmen for major events
          </Text>
        </View>
      </View>

      {/* Data Import Section - Governor/Historian Level */}
      <RoleBasedComponent requiredLevel={4}>
        <View style={styles.dataImportSection}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity 
            style={styles.importButton}
            onPress={() => setShowMemberImporter(true)}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="white" />
            <View style={styles.importButtonContent}>
              <Text style={styles.importButtonTitle}>Import ORLQB Roster</Text>
              <Text style={styles.importButtonSubtitle}>
                Load member data from roster JSON
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </RoleBasedComponent>
    </ScrollView>
  );

  // Render navigation header for management sections
  const renderNavigationHeader = (title) => (
    <View style={styles.navigationHeader}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setActiveSection('dashboard')}
      >
        <Ionicons name="arrow-back-outline" size={24} color="#3880ff" />
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );

  // Render management sections
  if (activeSection === 'events') {
    return (
      <View style={styles.container}>
        {renderNavigationHeader('Event Management')}
        <EventManager />
      </View>
    );
  }

  if (activeSection === 'members') {
    return (
      <View style={styles.container}>
        {renderNavigationHeader('Member Management')}
        <MemberManager />
      </View>
    );
  }

  if (activeSection === 'resources') {
    return (
      <View style={styles.container}>
        {renderNavigationHeader('Resource Management')}
        <ResourceManager />
      </View>
    );
  }

  if (activeSection === 'reports') {
    return (
      <View style={styles.container}>
        {renderNavigationHeader('Reports & Documentation')}
        <ReportsManager />
      </View>
    );
  }

  return (
    <RoleBasedComponent requiredLevel={3}>
      {renderDashboard()}
      
      {/* Member Data Importer Modal */}
      <MemberDataImporter 
        visible={showMemberImporter}
        onClose={() => setShowMemberImporter(false)}
      />
    </RoleBasedComponent>
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  roleInfoCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    marginLeft: 34,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  quickActionsSection: {
    margin: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickActionCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  gatheringsSection: {
    margin: 15,
  },
  gatheringCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  gatheringHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gatheringIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gatheringInfo: {
    flex: 1,
    marginLeft: 12,
  },
  gatheringTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  gatheringDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  gatheringStats: {
    alignItems: 'center',
  },
  gatheringCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  gatheringLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  responsibilitiesSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  responsibilitiesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  responsibilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  responsibilityBullet: {
    fontSize: 14,
    color: '#3880ff',
    marginRight: 8,
    marginTop: 1,
  },
  responsibilityText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  moreResponsibilities: {
    fontSize: 12,
    color: '#3880ff',
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 16,
  },
  leadershipNotes: {
    backgroundColor: 'white',
    margin: 15,
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  navigationHeader: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#3880ff',
    marginLeft: 8,
    fontWeight: '600',
  },
  dataImportSection: {
    backgroundColor: 'white',
    margin: 15,
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7044ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  importButtonContent: {
    flex: 1,
    marginLeft: 12,
  },
  importButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  importButtonSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
});

export default LeadmenScreen;