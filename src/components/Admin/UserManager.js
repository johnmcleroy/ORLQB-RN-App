/**
 * UserManager - Sudo Admin User Management Interface
 * 
 * This component provides sudo administrators with the ability to:
 * - View all users in the system
 * - Update user roles and permissions
 * - Activate/deactivate user accounts
 * - Monitor user activity and last login times
 * 
 * Only accessible to sudo admin users (hardcoded email addresses)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  FlatList,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { 
  getAllUsers, 
  updateUserRole, 
  USER_ROLES, 
  getRoleDisplayName, 
  getRoleColor,
  canManageSystem,
  ROLE_HIERARCHY
} from '../../utils/userRoles';

const UserManager = () => {
  const { user, userRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState('');

  useEffect(() => {
    if (user && canManageSystem(userRole)) {
      loadUsers();
    } else {
      setIsLoading(false);
    }
  }, [user, userRole]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = await getAllUsers(user);
      if (result.success) {
        setUsers(result.users);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
      console.error('Error loading users:', error);
    }
    setIsLoading(false);
  };

  const handleRoleChange = (userData) => {
    if (userData.role === USER_ROLES.SUDO_ADMIN) {
      Alert.alert(
        'Cannot Modify',
        'Sudo admin status is hardcoded and cannot be changed through the interface.'
      );
      return;
    }

    setSelectedUser(userData);
    setSelectedNewRole(userData.role);
    setShowRoleModal(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser || selectedNewRole === selectedUser.role) {
      setShowRoleModal(false);
      return;
    }

    try {
      const result = await updateUserRole(user, selectedUser.id, selectedNewRole);
      
      if (result.success) {
        Alert.alert('Success', `User role updated to ${getRoleDisplayName(selectedNewRole)}`);
        await loadUsers(); // Refresh the list
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update user role');
      console.error('Error updating role:', error);
    }

    setShowRoleModal(false);
    setSelectedUser(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const renderUserItem = ({ item }) => {
    const roleColor = getRoleColor(item.role);
    const hierarchyLevel = ROLE_HIERARCHY[item.role] || 0;

    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{item.displayName || 'Unknown'}</Text>
              {item.role === USER_ROLES.SUDO_ADMIN && (
                <Ionicons name="shield-checkmark" size={16} color="#ff0000" />
              )}
            </View>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.roleButton, { backgroundColor: roleColor }]}
            onPress={() => handleRoleChange(item)}
            disabled={item.role === USER_ROLES.SUDO_ADMIN}
          >
            <Text style={styles.roleButtonText}>
              {getRoleDisplayName(item.role)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userDetails}>
          <View style={styles.userDetailRow}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.userDetailText}>
              Joined: {formatDate(item.createdAt)}
            </Text>
          </View>
          
          <View style={styles.userDetailRow}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.userDetailText}>
              Last Login: {formatDate(item.lastLogin)}
            </Text>
          </View>

          <View style={styles.userDetailRow}>
            <Ionicons name="stats-chart-outline" size={14} color="#666" />
            <Text style={styles.userDetailText}>
              Access Level: {hierarchyLevel}/5
            </Text>
          </View>
        </View>

        {item.role === USER_ROLES.SUDO_ADMIN && (
          <View style={styles.sudoAdminBadge}>
            <Text style={styles.sudoAdminText}>🛡️ HARDCODED SUDO ADMIN</Text>
          </View>
        )}
      </View>
    );
  };

  const renderRoleModal = () => (
    <Modal
      visible={showRoleModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowRoleModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Change User Role</Text>
          <TouchableOpacity onPress={() => setShowRoleModal(false)}>
            <Ionicons name="close-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.selectedUserInfo}>
            <Text style={styles.selectedUserName}>
              {selectedUser?.displayName || selectedUser?.email}
            </Text>
            <Text style={styles.selectedUserEmail}>
              {selectedUser?.email}
            </Text>
            <Text style={styles.currentRoleText}>
              Current Role: {getRoleDisplayName(selectedUser?.role)}
            </Text>
          </View>

          <Text style={styles.roleSelectionTitle}>Select New Role:</Text>

          <ScrollView style={styles.roleOptions}>
            {Object.values(USER_ROLES)
              .filter(role => role !== USER_ROLES.SUDO_ADMIN) // Can't assign sudo admin
              .map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    { borderColor: getRoleColor(role) },
                    selectedNewRole === role && { backgroundColor: getRoleColor(role) }
                  ]}
                  onPress={() => setSelectedNewRole(role)}
                >
                  <View style={styles.roleOptionContent}>
                    <View>
                      <Text style={[
                        styles.roleOptionTitle,
                        { color: selectedNewRole === role ? 'white' : getRoleColor(role) }
                      ]}>
                        {getRoleDisplayName(role)}
                      </Text>
                      <Text style={[
                        styles.roleOptionDescription,
                        { color: selectedNewRole === role ? 'rgba(255,255,255,0.8)' : '#666' }
                      ]}>
                        Access Level: {ROLE_HIERARCHY[role]}/5
                      </Text>
                    </View>
                    
                    {selectedNewRole === role && (
                      <Ionicons name="checkmark-circle" size={20} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => setShowRoleModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.confirmButton,
              { backgroundColor: selectedNewRole ? getRoleColor(selectedNewRole) : '#ccc' }
            ]} 
            onPress={confirmRoleChange}
            disabled={!selectedNewRole || selectedNewRole === selectedUser?.role}
          >
            <Text style={styles.confirmButtonText}>Update Role</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="hourglass-outline" size={48} color="#666" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  // Show access denied if not sudo admin
  if (!canManageSystem(userRole)) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="shield-outline" size={48} color="#ff0000" />
        <Text style={styles.errorText}>🛡️ SUDO ADMIN ACCESS REQUIRED</Text>
        <Text style={styles.errorSubtext}>
          User management is restricted to sudo administrators only
        </Text>
        <Text style={styles.errorSubtext}>
          Your current role: {getRoleDisplayName(userRole)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👥 User Management</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadUsers}>
          <Ionicons name="refresh-outline" size={20} color="#3880ff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {users.filter(u => u.role === USER_ROLES.ADMIN).length}
          </Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {users.filter(u => u.role === USER_ROLES.MEMBER).length}
          </Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        style={styles.usersList}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={loadUsers}
      />

      {renderRoleModal()}
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
    color: '#ff0000',
    marginTop: 15,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
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
  refreshButton: {
    padding: 8,
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
  usersList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userDetails: {
    gap: 6,
  },
  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userDetailText: {
    fontSize: 12,
    color: '#666',
  },
  sudoAdminBadge: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff9999',
  },
  sudoAdminText: {
    fontSize: 12,
    color: '#cc0000',
    fontWeight: 'bold',
    textAlign: 'center',
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  selectedUserInfo: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 20,
  },
  selectedUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedUserEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  currentRoleText: {
    fontSize: 14,
    color: '#3880ff',
    marginTop: 8,
    fontWeight: '500',
  },
  roleSelectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  roleOptions: {
    flex: 1,
  },
  roleOption: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  roleOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  roleOptionDescription: {
    fontSize: 14,
    marginTop: 2,
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
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserManager;