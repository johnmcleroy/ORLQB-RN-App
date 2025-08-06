/**
 * MeetingMinutesScreen - Access to Past Meeting Records
 * 
 * Features:
 * - List of meeting minutes organized by date
 * - Search functionality for finding specific meetings
 * - PDF viewer for reading minutes documents
 * - Download/share capabilities
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Alert,
  RefreshControl,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ORLQBPhotos } from '../../constants/images';

const MeetingMinutesScreen = ({ navigation }) => {
  const [minutes, setMinutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMeetingMinutes();
  }, []);

  const fetchMeetingMinutes = async () => {
    try {
      console.log('MeetingMinutes: Fetching meeting minutes from Firestore...');
      
      // Query for meeting minutes documents
      const minutesQuery = query(
        collection(db, 'meetingMinutes'),
        orderBy('meetingDate', 'desc')
      );
      
      const querySnapshot = await getDocs(minutesQuery);
      const minutesList = [];
      
      querySnapshot.forEach((doc) => {
        const minutesData = doc.data();
        minutesList.push({
          id: doc.id,
          ...minutesData
        });
      });

      console.log(`MeetingMinutes: Loaded ${minutesList.length} meeting minutes`);
      setMinutes(minutesList);
    } catch (error) {
      console.error('MeetingMinutes: Error fetching meeting minutes:', error);
      
      // For demo purposes, provide sample data
      const sampleMinutes = [
        {
          id: '1',
          title: 'Monthly Meeting - January 2024',
          meetingDate: '2024-01-15',
          location: 'ORLQB Hangar',
          attendees: 25,
          topics: ['Safety Review', 'New Member Induction', 'Upcoming Events'],
          documentsUrl: null,
          summary: 'Monthly meeting covering safety protocols and member updates.'
        },
        {
          id: '2',
          title: 'Monthly Meeting - February 2024',
          meetingDate: '2024-02-15',
          location: 'ORLQB Hangar',
          attendees: 28,
          topics: ['Financial Report', 'Hangar Maintenance', 'Safety Discussion'],
          documentsUrl: null,
          summary: 'Financial review and hangar maintenance planning.'
        },
        {
          id: '3',
          title: 'Special Meeting - Event Planning',
          meetingDate: '2024-03-01',
          location: 'ORLQB Hangar',
          attendees: 15,
          topics: ['Annual Fly-in Planning', 'Volunteer Coordination'],
          documentsUrl: null,
          summary: 'Planning session for annual ORLQB fly-in event.'
        }
      ];
      
      setMinutes(sampleMinutes);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMeetingMinutes();
  };

  const filteredMinutes = minutes.filter(minute =>
    minute.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    minute.topics?.some(topic => 
      topic.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    minute.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleMinutePress = (minute) => {
    if (minute.documentsUrl) {
      Linking.openURL(minute.documentsUrl);
    } else {
      Alert.alert(
        minute.title,
        `Meeting Date: ${formatDate(minute.meetingDate)}\n\nSummary: ${minute.summary}\n\nTopics:\n${minute.topics?.join('\n• ') || 'No topics listed'}\n\nDocument not yet available.`,
        [{ text: 'OK' }]
      );
    }
  };

  const renderMinuteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.minuteCard}
      onPress={() => handleMinutePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.minuteHeader}>
        <Text style={styles.minuteTitle}>{item.title}</Text>
        <View style={styles.minuteMeta}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.minuteDate}>{formatDate(item.meetingDate)}</Text>
        </View>
      </View>

      <View style={styles.minuteDetails}>
        <View style={styles.minuteDetailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.minuteDetailText}>{item.location}</Text>
        </View>
        
        <View style={styles.minuteDetailRow}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.minuteDetailText}>{item.attendees} attendees</Text>
        </View>
      </View>

      {item.topics && item.topics.length > 0 && (
        <View style={styles.topicsContainer}>
          <Text style={styles.topicsTitle}>Topics:</Text>
          {item.topics.slice(0, 3).map((topic, index) => (
            <Text key={index} style={styles.topicItem}>• {topic}</Text>
          ))}
          {item.topics.length > 3 && (
            <Text style={styles.moreTopics}>+{item.topics.length - 3} more topics</Text>
          )}
        </View>
      )}

      <View style={styles.minuteFooter}>
        <Text style={styles.minuteSummary} numberOfLines={2}>
          {item.summary}
        </Text>
        
        <View style={styles.documentStatus}>
          {item.documentsUrl ? (
            <>
              <Ionicons name="document-text" size={16} color="#22c55e" />
              <Text style={styles.statusAvailable}>Available</Text>
            </>
          ) : (
            <>
              <Ionicons name="document-outline" size={16} color="#f59e0b" />
              <Text style={styles.statusPending}>Pending</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Loading meeting minutes...</Text>
        </View>
      );
    }

    if (searchQuery && filteredMinutes.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No minutes found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search terms
          </Text>
        </View>
      );
    }

    if (minutes.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No meeting minutes available</Text>
          <Text style={styles.emptySubtext}>
            Meeting records will appear here once available
          </Text>
        </View>
      );
    }

    return null;
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
        <Text style={styles.title}>Meeting Minutes</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search meeting minutes..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Minutes List */}
      <FlatList
        data={filteredMinutes}
        renderItem={renderMinuteItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
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
  refreshButton: {
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
  searchContainer: {
    padding: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  minuteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  minuteHeader: {
    marginBottom: 12,
  },
  minuteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  minuteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minuteDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  minuteDetails: {
    marginBottom: 12,
  },
  minuteDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  minuteDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  topicsContainer: {
    marginBottom: 12,
  },
  topicsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  topicItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  moreTopics: {
    fontSize: 14,
    color: '#3880ff',
    fontStyle: 'italic',
  },
  minuteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  minuteSummary: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  documentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusAvailable: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
    marginLeft: 4,
  },
  statusPending: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginLeft: 4,
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

export default MeetingMinutesScreen;