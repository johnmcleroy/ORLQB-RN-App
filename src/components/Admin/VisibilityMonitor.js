/**
 * VisibilityMonitor - Administrator Dashboard for Component Visibility Tracking
 * 
 * This component provides administrators with comprehensive monitoring capabilities
 * for role-based component access throughout the ORLQB application.
 * 
 * Features:
 * - Real-time visibility event tracking
 * - Access attempt statistics and analytics  
 * - User role breakdown and component usage
 * - Filtering and export capabilities
 * - Security oversight and audit trails
 * 
 * Only accessible to SUDO_ADMIN users.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import {
  getVisibilityEvents,
  getVisibilityStatistics,
  clearVisibilityLog,
  exportVisibilityEvents,
  getRoleDisplayName,
  getRoleColor,
  getRoleIcon,
  HANGAR_ROLES
} from '../../utils/userRoles';

const VisibilityMonitor = () => {
  const { user, userRole } = useAuth();
  
  // State management
  const [statistics, setStatistics] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    userEmail: '',
    componentName: '',
    userRole: '',
    accessGranted: '',
    dateFrom: '',
    dateTo: '',
    limit: 50
  });

  // Load initial data
  useEffect(() => {
    if (user && userRole === HANGAR_ROLES.SUDO_ADMIN) {
      loadData();
    }
  }, [user, userRole]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load statistics and events in parallel
      const [statsResult, eventsResult] = await Promise.all([
        getVisibilityStatistics(user),
        getVisibilityEvents(user, filters)
      ]);

      if (statsResult.success) {
        setStatistics(statsResult.statistics);
      } else {
        console.error('Error loading statistics:', statsResult.error);
      }

      if (eventsResult.success) {
        setEvents(eventsResult.events);
      } else {
        console.error('Error loading events:', eventsResult.error);
      }
      
    } catch (error) {
      console.error('Error loading visibility monitor data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const applyFilters = () => {
    setShowFilters(false);
    loadData();
  };

  const clearFilters = () => {
    setFilters({
      userEmail: '',
      componentName: '',
      userRole: '',
      accessGranted: '',
      dateFrom: '',
      dateTo: '',
      limit: 50
    });
    loadData();
  };

  const handleClearLog = () => {
    Alert.alert(
      'Clear Visibility Log',
      'Are you sure you want to clear all visibility events? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Log',
          style: 'destructive',
          onPress: async () => {
            const result = await clearVisibilityLog(user);
            if (result.success) {
              Alert.alert('Success', result.message);
              loadData();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const handleExport = async () => {
    try {
      const result = await exportVisibilityEvents(user, filters);
      if (result.success) {
        // In a real app, you would save this to device or share
        console.log('Export data:', result.exportData);
        Alert.alert(
          'Export Successful', 
          `Exported ${result.exportData.exportedEvents} events. Check console for data.`
        );
      } else {
        Alert.alert('Export Error', result.error);
      }
    } catch (error) {
      Alert.alert('Export Error', error.message);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderStatisticsCard = (title, value, icon, color = '#3880ff') => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const renderEventItem = (event, index) => {
    const statusColor = event.accessGranted ? '#10dc60' : '#f04141';
    const statusIcon = event.accessGranted ? 'checkmark-circle' : 'close-circle';

    return (
      <TouchableOpacity 
        key={event.id || index}
        style={styles.eventItem}
        onPress={() => {
          setSelectedEvent(event);
          setShowEventDetails(true);
        }}
      >
        <View style={styles.eventHeader}>
          <View style={styles.eventStatus}>
            <Ionicons name={statusIcon} size={16} color={statusColor} />
            <Text style={[styles.eventAccessText, { color: statusColor }]}>
              {event.accessGranted ? 'GRANTED' : 'DENIED'}
            </Text>
          </View>
          <Text style={styles.eventTime}>
            {formatTimestamp(event.timestamp)}
          </Text>
        </View>
        
        <Text style={styles.eventComponent}>{event.componentName}</Text>
        
        <View style={styles.eventFooter}>
          <View style={styles.userInfo}>
            <Ionicons 
              name={getRoleIcon(event.userRole)} 
              size={12} 
              color={getRoleColor(event.userRole)} 
            />
            <Text style={styles.eventUser}>{event.userEmail}</Text>
          </View>
          
          <Text style={styles.eventRole}>
            {getRoleDisplayName(event.userRole)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filter Events</Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.filtersContent}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>User Email</Text>
            <TextInput
              style={styles.filterInput}
              value={filters.userEmail}
              onChangeText={(text) => setFilters({...filters, userEmail: text})}
              placeholder="Enter user email..."
            />
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Component Name</Text>
            <TextInput
              style={styles.filterInput}
              value={filters.componentName}
              onChangeText={(text) => setFilters({...filters, componentName: text})}
              placeholder="Enter component name..."
            />
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Access Status</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filters.accessGranted === true && styles.filterButtonActive
                ]}
                onPress={() => setFilters({...filters, accessGranted: true})}
              >
                <Text style={styles.filterButtonText}>Granted</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filters.accessGranted === false && styles.filterButtonActive
                ]}
                onPress={() => setFilters({...filters, accessGranted: false})}
              >
                <Text style={styles.filterButtonText}>Denied</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filters.accessGranted === '' && styles.filterButtonActive
                ]}
                onPress={() => setFilters({...filters, accessGranted: ''})}
              >
                <Text style={styles.filterButtonText}>All</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderEventDetailsModal = () => (
    <Modal
      visible={showEventDetails}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowEventDetails(false)}
    >
      {selectedEvent && (
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Event Details</Text>
            <TouchableOpacity onPress={() => setShowEventDetails(false)}>
              <Ionicons name="close-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.eventDetailsContent}>
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Component</Text>
              <Text style={styles.detailValue}>{selectedEvent.componentName}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>User</Text>
              <Text style={styles.detailValue}>{selectedEvent.userEmail}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Role</Text>
              <View style={styles.roleDetail}>
                <Ionicons 
                  name={getRoleIcon(selectedEvent.userRole)} 
                  size={16} 
                  color={getRoleColor(selectedEvent.userRole)} 
                />
                <Text style={styles.detailValue}>
                  {getRoleDisplayName(selectedEvent.userRole)} (Level {selectedEvent.userLevel})
                </Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Access Decision</Text>
              <View style={styles.accessDetail}>
                <Ionicons 
                  name={selectedEvent.accessGranted ? 'checkmark-circle' : 'close-circle'} 
                  size={16} 
                  color={selectedEvent.accessGranted ? '#10dc60' : '#f04141'} 
                />
                <Text style={[
                  styles.detailValue,
                  { color: selectedEvent.accessGranted ? '#10dc60' : '#f04141' }
                ]}>
                  {selectedEvent.accessGranted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                </Text>
              </View>
            </View>

            {!selectedEvent.accessGranted && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Denial Reason</Text>
                <Text style={styles.detailValue}>{selectedEvent.accessReason}</Text>
              </View>
            )}

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Timestamp</Text>
              <Text style={styles.detailValue}>
                {formatTimestamp(selectedEvent.timestamp)}
              </Text>
            </View>

            {selectedEvent.requiredLevel && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Required Security Level</Text>
                <Text style={styles.detailValue}>{selectedEvent.requiredLevel}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </Modal>
  );

  // Only allow sudo admin access
  if (userRole !== HANGAR_ROLES.SUDO_ADMIN) {
    return (
      <View style={styles.accessDeniedContainer}>
        <Ionicons name="shield-outline" size={48} color="#f04141" />
        <Text style={styles.accessDeniedTitle}>Sudo Admin Required</Text>
        <Text style={styles.accessDeniedMessage}>
          This monitoring dashboard is restricted to system administrators only.
        </Text>
      </View>
    );
  }

  if (isLoading && !statistics) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="analytics-outline" size={48} color="#666" />
        <Text style={styles.loadingText}>Loading visibility monitor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Visibility Monitor</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowFilters(true)}>
            <Ionicons name="filter-outline" size={20} color="#3880ff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleExport}>
            <Ionicons name="download-outline" size={20} color="#3880ff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleClearLog}>
            <Ionicons name="trash-outline" size={20} color="#f04141" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Statistics */}
        {statistics && (
          <View style={styles.statisticsSection}>
            <Text style={styles.sectionTitle}>System Statistics</Text>
            <View style={styles.statsGrid}>
              {renderStatisticsCard('Total Events', statistics.totalEvents, 'analytics-outline')}
              {renderStatisticsCard('Access Granted', statistics.accessGranted, 'checkmark-circle-outline', '#10dc60')}
              {renderStatisticsCard('Access Denied', statistics.accessDenied, 'close-circle-outline', '#f04141')}
              {renderStatisticsCard('Unique Users', statistics.uniqueUsers, 'people-outline', '#ffce00')}
              {renderStatisticsCard('Components', statistics.uniqueComponents, 'grid-outline', '#7B68EE')}
            </View>
          </View>
        )}

        {/* Recent Events */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Recent Access Events</Text>
          {events.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="documents-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No visibility events recorded</Text>
            </View>
          ) : (
            events.map((event, index) => renderEventItem(event, index))
          )}
        </View>
      </ScrollView>

      {renderFiltersModal()}
      {renderEventDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  accessDeniedMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  statisticsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: '45%',
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  eventsSection: {
    padding: 16,
  },
  eventItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventAccessText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  eventTime: {
    fontSize: 11,
    color: '#666',
  },
  eventComponent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventUser: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  eventRole: {
    fontSize: 11,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filtersContent: {
    padding: 16,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#3880ff',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#3880ff',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  eventDetailsContent: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  roleDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default VisibilityMonitor;