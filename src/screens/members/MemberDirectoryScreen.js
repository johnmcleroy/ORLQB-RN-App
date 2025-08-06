/**
 * MemberDirectoryScreen - Searchable Member Directory
 * 
 * Features:
 * - Searchable list of ORLQB members from Firebase
 * - Alphabetical sorting by Last Name
 * - Profile Card integration for detailed member information
 * - Real-time search functionality
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground,
  Modal,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ORLQBPhotos } from '../../constants/images';
import ProfileCard from '../../components/ProfileCard';

const MemberDirectoryScreen = ({ navigation }) => {
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setError(null);
      console.log('MemberDirectory: Fetching members from Firestore...');
      console.log('MemberDirectory: db instance:', db);
      
      // Check if db is available
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
      
      const membersQuery = query(
        collection(db, 'users'), 
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(membersQuery);
      const membersList = [];
      
      querySnapshot.forEach((doc) => {
        const memberData = doc.data();
        
        // Only include members with valid data
        if (memberData.name && memberData.qbNumber) {
          membersList.push({
            id: doc.id,
            ...memberData
          });
        }
      });

      console.log(`MemberDirectory: Loaded ${membersList.length} members`);
      setMembers(membersList);
    } catch (error) {
      console.error('MemberDirectory: Error fetching members:', error);
      console.log('MemberDirectory: Error details:', error.message);
      
      // Provide sample data for demo purposes when Firebase fails
      const sampleMembers = [
        {
          id: 'sample1',
          name: 'Smith, John',
          nickname: 'Johnny',
          qbNumber: '123',
          status: 'A',
          email: 'john.smith@example.com',
          phone: '(407) 555-0123',
          inductingHangar: 'Orlando Executive',
          inductingDate: '2020-01-15'
        },
        {
          id: 'sample2', 
          name: 'Johnson, Sarah',
          nickname: 'Sally',
          qbNumber: '456',
          status: 'A',
          email: 'sarah.johnson@example.com',
          phone: '(407) 555-0456',
          inductingHangar: 'Orlando Executive',
          inductingDate: '2021-03-20'
        },
        {
          id: 'sample3',
          name: 'Williams, Robert',
          nickname: 'Bob',
          qbNumber: '789',
          status: 'A',
          email: 'bob.williams@example.com',
          phone: '(407) 555-0789',
          inductingHangar: 'Orlando Executive', 
          inductingDate: '2019-11-10'
        }
      ];
      
      setMembers(sampleMembers);
      setError('Using sample data - Firebase connection failed');
      console.log('MemberDirectory: Using sample data due to Firebase error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  // Parse name for sorting and display
  const parseMemberName = (fullName) => {
    if (!fullName) return { firstName: '', lastName: '', sortKey: '' };
    
    // Handle "Last, First" format
    const parts = fullName.split(', ');
    const lastName = parts[0] || '';
    const firstName = parts[1] || '';
    const sortKey = `${lastName.toLowerCase()} ${firstName.toLowerCase()}`;
    
    return { firstName, lastName, sortKey };
  };

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return members;
    }

    const query = searchQuery.toLowerCase();
    return members.filter(member => {
      const { firstName, lastName } = parseMemberName(member.name);
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      const nickname = member.nickname?.toLowerCase() || '';
      const qbNumber = member.qbNumber?.toString() || '';
      
      return (
        fullName.includes(query) ||
        nickname.includes(query) ||
        qbNumber.includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.inductingHangar?.toLowerCase().includes(query)
      );
    });
  }, [members, searchQuery]);

  const handleMemberPress = (member) => {
    setSelectedMember(member);
  };

  const renderMemberItem = ({ item: member }) => (
    <TouchableOpacity 
      onPress={() => handleMemberPress(member)}
      activeOpacity={0.7}
    >
      <ProfileCard member={member} compact={true} />
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members by name, QB#, email..."
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
      
      <View style={styles.resultCount}>
        <Text style={styles.resultText}>
          {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} found
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Loading members...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={64} color="#e74c3c" />
          <Text style={styles.emptyText}>Error loading members</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchMembers}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchQuery && filteredMembers.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No members found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search terms
          </Text>
        </View>
      );
    }

    if (members.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No members in directory</Text>
          <Text style={styles.emptySubtext}>
            Member data will appear here once available
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
        <Text style={styles.title}>Member Directory</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Member List */}
      <FlatList
        data={filteredMembers}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Member Detail Modal */}
      <Modal
        visible={!!selectedMember}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedMember(null)}
      >
        {selectedMember && (
          <ImageBackground
            source={ORLQBPhotos.HANGAR_INTERIOR}
            style={styles.modalContainer}
            resizeMode="cover"
          >
            <View style={styles.modalOverlay} />
            <ProfileCard 
              member={selectedMember} 
              onClose={() => setSelectedMember(null)} 
            />
          </ImageBackground>
        )}
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
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
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
  resultCount: {
    marginTop: 10,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  separator: {
    height: 1,
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
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3880ff',
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});

export default MemberDirectoryScreen;