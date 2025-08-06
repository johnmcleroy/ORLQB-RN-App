/**
 * MemberManager - ORLQB Member Profile Management
 * 
 * Administrative interface for Leadmen to manage member profiles, attendance,
 * and participation tracking. Features:
 * - Member profile cards with photos and details
 * - Role status management
 * - Event attendance tracking and check-in/call-in
 * - Personal information updates
 * - Participation history
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
  Switch,
  Image,
  RefreshControl
} from 'react-native';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { 
  hasSecurityLevel, 
  HANGAR_ROLES, 
  SECURITY_LEVELS,
  getRoleDisplayName,
  getRoleColor,
  getRoleIcon
} from '../../utils/userRoles';

const MemberManager = () => {
  const { user, userRole } = useAuth();
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    role: HANGAR_ROLES.GUEST,
    joinDate: '',
    notes: '',
    profilePhoto: '',
    isActive: true
  });

  // Member attendance status for events
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    if (!user || !hasSecurityLevel(userRole, 3)) {
      setIsLoading(false);
      return;
    }

    loadMembers();
    loadEvents();
  }, [user, userRole]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      if (Platform.OS === 'web') {
        // Web Firebase SDK
        const { collection, getDocs, orderBy, query } = require('firebase/firestore');
        const membersQuery = query(
          collection(firestore(), 'users'),
          orderBy('displayName', 'asc')
        );
        const snapshot = await getDocs(membersQuery);
        const membersData = [];
        snapshot.forEach((doc) => {
          membersData.push({ id: doc.id, ...doc.data() });
        });
        setMembers(membersData);
      } else {
        // React Native Firebase SDK
        const snapshot = await firestore()
          .collection('users')
          .orderBy('displayName', 'asc')
          .get();
        
        const membersData = [];
        snapshot.forEach((doc) => {
          membersData.push({ id: doc.id, ...doc.data() });
        });
        setMembers(membersData);
      }
    } catch (error) {
      console.error('Error loading members:', error);
      Alert.alert('Error', 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      if (Platform.OS === 'web') {
        const { collection, getDocs } = require('firebase/firestore');
        const snapshot = await getDocs(collection(firestore(), 'events'));
        const eventsData = [];
        snapshot.forEach((doc) => {
          eventsData.push({ id: doc.id, ...doc.data() });
        });
        setEvents(eventsData);
      } else {
        const snapshot = await firestore().collection('events').get();
        const eventsData = [];
        snapshot.forEach((doc) => {
          eventsData.push({ id: doc.id, ...doc.data() });
        });
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([loadMembers(), loadEvents()]).finally(() => {
      setRefreshing(false);
    });
  }, []);

  const openMemberForm = (member = null) => {
    if (member) {
      setSelectedMember(member);
      setFormData({
        displayName: member.displayName || '',
        email: member.email || '',
        phone: member.phone || '',
        address: member.address || '',
        emergencyContact: member.emergencyContact || '',
        emergencyPhone: member.emergencyPhone || '',
        role: member.role || HANGAR_ROLES.GUEST,
        joinDate: member.joinDate || '',
        notes: member.notes || '',
        profilePhoto: member.profilePhoto || '',
        isActive: member.isActive !== false
      });
    } else {
      setSelectedMember(null);
      setFormData({
        displayName: '',
        email: '',
        phone: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        role: HANGAR_ROLES.GUEST,
        joinDate: new Date().toISOString().split('T')[0],
        notes: '',
        profilePhoto: '',
        isActive: true
      });
    }
    setShowMemberForm(true);
  };

  const saveMember = async () => {
    if (!formData.displayName || !formData.email) {
      Alert.alert('Error', 'Please fill in required fields (Name and Email)');
      return;
    }

    if (!hasSecurityLevel(userRole, 3)) {
      Alert.alert('Access Denied', 'Leadership privileges required');
      return;
    }

    const memberData = {
      ...formData,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || 'Unknown'
    };

    if (!selectedMember) {
      memberData.createdAt = new Date().toISOString();
      memberData.createdBy = user?.email || 'Unknown';
    }

    try {
      if (Platform.OS === 'web') {
        const { doc, updateDoc, addDoc, collection } = require('firebase/firestore');
        if (selectedMember) {
          const memberRef = doc(firestore(), 'users', selectedMember.id);
          await updateDoc(memberRef, memberData);
          Alert.alert('Success', 'Member updated successfully');
        } else {
          await addDoc(collection(firestore(), 'users'), memberData);
          Alert.alert('Success', 'Member added successfully');
        }
      } else {
        const usersCollection = firestore().collection('users');
        if (selectedMember) {
          await usersCollection.doc(selectedMember.id).update(memberData);
          Alert.alert('Success', 'Member updated successfully');
        } else {
          await usersCollection.add(memberData);
          Alert.alert('Success', 'Member added successfully');
        }
      }

      setShowMemberForm(false);
      loadMembers();
    } catch (error) {
      console.error('Error saving member:', error);
      Alert.alert('Error', 'Failed to save member');
    }
  };

  const updateAttendance = async (memberId, eventId, status) => {
    if (!hasSecurityLevel(userRole, 3)) {
      Alert.alert('Access Denied', 'Leadership privileges required');
      return;
    }

    const attendanceKey = `${eventId}_${memberId}`;
    const attendanceRecord = {
      memberId,
      eventId,
      status, // 'present', 'absent', 'called_in', 'excused'
      recordedAt: new Date().toISOString(),
      recordedBy: user?.email || 'Unknown'
    };

    try {
      if (Platform.OS === 'web') {
        const { doc, setDoc } = require('firebase/firestore');
        const attendanceRef = doc(firestore(), 'attendance', attendanceKey);
        await setDoc(attendanceRef, attendanceRecord);
      } else {
        await firestore()
          .collection('attendance')
          .doc(attendanceKey)
          .set(attendanceRecord);
      }

      setAttendanceData(prev => ({
        ...prev,
        [attendanceKey]: attendanceRecord
      }));

      Alert.alert('Success', 'Attendance recorded');
    } catch (error) {
      console.error('Error updating attendance:', error);
      Alert.alert('Error', 'Failed to record attendance');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const renderMemberCard = ({ item }) => {
    const roleColor = getRoleColor(item.role);
    const roleIcon = getRoleIcon(item.role);
    const securityLevel = SECURITY_LEVELS[item.role] || 0;

    return (
      <TouchableOpacity 
        style={styles.memberCard}
        onPress={() => openMemberForm(item)}
      >
        <View style={styles.memberHeader}>
          <View style={styles.memberPhotoContainer}>
            {item.profilePhoto ? (
              <Image source={{ uri: item.profilePhoto }} style={styles.memberPhoto} />
            ) : (
              <View style={[styles.memberPhotoPlaceholder, { backgroundColor: roleColor }]}>
                <Ionicons name="person-outline" size={32} color="white" />
              </View>
            )}
            <View style={[styles.securityBadge, { backgroundColor: roleColor }]}>
              <Text style={styles.securityBadgeText}>{securityLevel}</Text>
            </View>
          </View>
          
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{item.displayName}</Text>
            <View style={styles.roleContainer}>
              <Ionicons name={roleIcon} size={14} color={roleColor} />
              <Text style={[styles.memberRole, { color: roleColor }]}>
                {getRoleDisplayName(item.role)}
              </Text>
            </View>
            <Text style={styles.memberEmail}>{item.email}</Text>
            {item.phone && (
              <Text style={styles.memberPhone}>📞 {item.phone}</Text>
            )}
          </View>

          <View style={styles.memberActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10dc60' }]}
              onPress={() => {
                setSelectedMember(item);
                setShowAttendanceModal(true);
              }}
            >
              <Ionicons name="checkmark-outline" size={16} color="white" />
            </TouchableOpacity>
            
            <View style={[styles.statusIndicator, { 
              backgroundColor: item.isActive !== false ? '#10dc60' : '#f04141' 
            }]}>
              <Text style={styles.statusText}>
                {item.isActive !== false ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>

        {item.notes && (
          <View style={styles.memberNotes}>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderAttendanceModal = () => (
    <Modal
      visible={showAttendanceModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAttendanceModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            Event Attendance - {selectedMember?.displayName}
          </Text>
          <TouchableOpacity onPress={() => setShowAttendanceModal(false)}>
            <Ionicons name="close-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.eventsList}>
          {events.map((event) => {
            const attendanceKey = `${event.id}_${selectedMember?.id}`;
            const attendance = attendanceData[attendanceKey];

            return (
              <View key={event.id} style={styles.eventAttendanceCard}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date} at {event.time}</Text>
                  <Text style={styles.eventType}>{event.type}</Text>
                </View>

                <View style={styles.attendanceButtons}>
                  {['present', 'called_in', 'excused', 'absent'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.attendanceButton,
                        attendance?.status === status && styles.attendanceButtonSelected,
                        { backgroundColor: getAttendanceColor(status) }
                      ]}
                      onPress={() => updateAttendance(selectedMember.id, event.id, status)}
                    >
                      <Ionicons 
                        name={getAttendanceIcon(status)} 
                        size={14} 
                        color="white" 
                      />
                      <Text style={styles.attendanceButtonText}>
                        {status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );

  const getAttendanceColor = (status) => {
    switch (status) {
      case 'present': return '#10dc60';
      case 'called_in': return '#3880ff';
      case 'excused': return '#ffce00';
      case 'absent': return '#f04141';
      default: return '#999';
    }
  };

  const getAttendanceIcon = (status) => {
    switch (status) {
      case 'present': return 'checkmark-circle-outline';
      case 'called_in': return 'call-outline';
      case 'excused': return 'information-circle-outline';
      case 'absent': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  if (!hasSecurityLevel(userRole, 3)) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="shield-outline" size={48} color="#666" />
        <Text style={styles.errorText}>Leadership Access Required</Text>
        <Text style={styles.errorSubtext}>Level 3+ Leadmen privileges needed</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ORLQB Member Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openMemberForm()}>
          <Ionicons name="person-add-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleFilters}>
          <TouchableOpacity
            style={[styles.filterButton, filterRole === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterRole('all')}
          >
            <Text style={[styles.filterText, filterRole === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          
          {Object.values(HANGAR_ROLES).map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.filterButton, filterRole === role && styles.filterButtonActive]}
              onPress={() => setFilterRole(role)}
            >
              <Text style={[styles.filterText, filterRole === role && styles.filterTextActive]}>
                {getRoleDisplayName(role)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{filteredMembers.length}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {filteredMembers.filter(m => m.isActive !== false).length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {filteredMembers.filter(m => SECURITY_LEVELS[m.role] >= 3).length}
          </Text>
          <Text style={styles.statLabel}>Leadmen</Text>
        </View>
      </View>

      {filteredMembers.length === 0 ? (
        <View style={[styles.centerContent, { flex: 1 }]}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No members found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMembers}
          renderItem={renderMemberCard}
          keyExtractor={(item) => item.id}
          style={styles.membersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {renderAttendanceModal()}
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
    backgroundColor: '#10dc60',
    padding: 10,
    borderRadius: 8,
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  roleFilters: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3880ff',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: 'white',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3880ff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  membersList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  memberCard: {
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
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberPhotoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  memberPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  memberPhotoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  securityBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  memberEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: 12,
    color: '#666',
  },
  memberActions: {
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  memberNotes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 15,
    textAlign: 'center',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  eventsList: {
    flex: 1,
    padding: 15,
  },
  eventAttendanceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
  },
  eventInfo: {
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  eventType: {
    fontSize: 12,
    color: '#3880ff',
    fontWeight: 'bold',
  },
  attendanceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  attendanceButtonSelected: {
    borderWidth: 2,
    borderColor: '#333',
  },
  attendanceButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default MemberManager;