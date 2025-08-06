/**
 * MemberNotificationsScreen - Notifications and Updates
 * 
 * Features:
 * - Important ORLQB notifications and updates
 * - Event reminders and announcements
 * - System notifications and alerts
 * - Push notification preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Switch,
  Alert,
  RefreshControl,
  Badge
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ORLQBPhotos } from '../../constants/images';
import { useAuth } from '../../context/AuthContext';

const MemberNotificationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    eventReminders: true,
    meetingUpdates: true,
    safetyAlerts: true,
    generalAnnouncements: true,
    systemNotifications: false
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchNotificationPreferences();
  }, []);

  const fetchNotifications = async () => {
    try {
      console.log('Notifications: Fetching notifications...');
      
      // For demo purposes, create sample notifications
      const sampleNotifications = [
        {
          id: '1',
          type: 'event',
          title: 'Monthly Meeting Reminder',
          message: 'Don\'t forget about tomorrow\'s monthly meeting at 7:00 PM in the ORLQB Hangar.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          read: false,
          priority: 'high',
          icon: 'calendar',
          color: '#3880ff'
        },
        {
          id: '2',
          type: 'safety',
          title: 'Safety Alert: Weather Advisory',
          message: 'Severe weather conditions expected this weekend. Please secure all aircraft and equipment.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          read: false,
          priority: 'urgent',
          icon: 'warning',
          color: '#ff6b35'
        },
        {
          id: '3',
          type: 'announcement',
          title: 'New Member Welcome',
          message: 'Please welcome our newest members: John Smith (QB #456) and Sarah Johnson (QB #457).',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          read: true,
          priority: 'normal',
          icon: 'people',
          color: '#22c55e'
        },
        {
          id: '4',
          type: 'update',
          title: 'Hangar Maintenance Complete',
          message: 'The scheduled hangar maintenance has been completed. All facilities are now fully operational.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
          read: true,
          priority: 'normal',
          icon: 'construct',
          color: '#6366f1'
        },
        {
          id: '5',
          type: 'event',
          title: 'Annual Fly-in Registration Open',
          message: 'Registration is now open for the 2024 Annual ORLQB Fly-in. Reserve your spot today!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
          read: true,
          priority: 'high',
          icon: 'airplane',
          color: '#3880ff'
        },
        {
          id: '6',
          type: 'system',
          title: 'App Update Available',
          message: 'Version 2.1 of the ORLQB app is now available with new features and improvements.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
          read: true,
          priority: 'low',
          icon: 'download',
          color: '#8b5cf6'
        }
      ];
      
      setNotifications(sampleNotifications);
      setUnreadCount(sampleNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Notifications: Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      // Load user preferences from Firestore or local storage
      // For demo, use default preferences
      console.log('Notifications: Loading preferences...');
    } catch (error) {
      console.error('Notifications: Error fetching preferences:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.read) {
      // Mark as read
      const updatedNotifications = notifications.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update in Firestore (commented out for demo)
      // await updateDoc(doc(db, 'notifications', notification.id), { read: true });
    }

    // Handle specific notification actions
    switch (notification.type) {
      case 'event':
        Alert.alert(
          notification.title,
          notification.message + '\n\nWould you like to view the event details?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'View Event', onPress: () => console.log('Navigate to event') }
          ]
        );
        break;
      case 'safety':
        Alert.alert(
          'Safety Alert',
          notification.message,
          [{ text: 'Understood' }]
        );
        break;
      default:
        Alert.alert(
          notification.title,
          notification.message,
          [{ text: 'OK' }]
        );
    }
  };

  const handlePreferenceChange = async (preferenceKey, value) => {
    const updatedPreferences = {
      ...preferences,
      [preferenceKey]: value
    };
    
    setPreferences(updatedPreferences);
    
    // Save to Firestore (commented out for demo)
    // await updateDoc(doc(db, 'userPreferences', user.uid), {
    //   notifications: updatedPreferences
    // });
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ff6b35';
      case 'high': return '#3880ff';
      case 'normal': return '#22c55e';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInHours = Math.floor((now - notificationTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <View style={[styles.notificationIcon, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationTitleRow}>
            <Text style={[
              styles.notificationTitle,
              !item.read && styles.unreadTitle
            ]}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          
          <View style={styles.notificationMeta}>
            <Text style={styles.notificationTime}>
              {formatTimestamp(item.timestamp)}
            </Text>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(item.priority) }
            ]}>
              <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPreferences = () => (
    <View style={styles.preferencesContainer}>
      <Text style={styles.preferencesTitle}>Notification Preferences</Text>
      
      {Object.entries(preferences).map(([key, value]) => (
        <View key={key} style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceLabel}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Text>
            <Text style={styles.preferenceDescription}>
              {getPreferenceDescription(key)}
            </Text>
          </View>
          <Switch
            value={value}
            onValueChange={(newValue) => handlePreferenceChange(key, newValue)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={value ? '#3880ff' : '#f4f3f4'}
          />
        </View>
      ))}
    </View>
  );

  const getPreferenceDescription = (key) => {
    const descriptions = {
      eventReminders: 'Get notified about upcoming events and meetings',
      meetingUpdates: 'Receive updates about meeting changes',
      safetyAlerts: 'Important safety notifications and alerts',
      generalAnnouncements: 'ORLQB news and general announcements',
      systemNotifications: 'App updates and system maintenance notices'
    };
    return descriptions[key] || '';
  };

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
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={markAllAsRead} style={styles.markReadButton}>
          <Ionicons name="checkmark-done" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderPreferences}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFD700"
            colors={['#FFD700']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              You'll see important updates and alerts here
            </Text>
          </View>
        }
      />
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
  markReadButton: {
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#ff6b35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  preferencesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  preferencesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 15,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 15,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#3880ff',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3880ff',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
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
});

export default MemberNotificationsScreen;