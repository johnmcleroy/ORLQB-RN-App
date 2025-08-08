/**
 * ORLQB Orlando Hangar Role Management System
 * 
 * Authentic ORLQB Organizational Structure:
 * 
 * Orlando Hangar Leadership Roles (Leadmen):
 * - Governor (Level 4): Highest hangar authority
 * - Historian (Level 4): Historical records and traditions keeper
 * - Assistant Governor (Level 3): Deputy hangar leadership
 * - Keyman (Level 3): Membership and key holder
 * - Assistant Keyman (Level 3): Deputy membership management
 * - Beam Man (Level 3): Ceremonial and ritual oversight
 * 
 * General Membership:
 * - Member (Level 2): Full active member
 * - Candidate/Initiate (Level 1): Prospective members
 * - Guest (Level 0): Visitors and public
 * 
 * System Administration:
 * - Sudo Admin: Technical system administration (outside hangar hierarchy)
 */

import { Platform } from 'react-native';
import { db } from '../services/firebase';

// ORLQB Hangar Role Constants
export const HANGAR_ROLES = {
  // System Administration (Technical)
  SUDO_ADMIN: 'sudo_admin', // Level 5 - Technical system administrator (outside hierarchy)
  
  // Hangar Leadership (Leadmen) - Level 4
  GOVERNOR: 'governor',
  HISTORIAN: 'historian',
  
  // Hangar Leadership (Leadmen) - Level 3
  ASSISTANT_GOVERNOR: 'assistant_governor',
  KEYMAN: 'keyman',
  ASSISTANT_KEYMAN: 'assistant_keyman',
  BEAM_MAN: 'beam_man',
  
  // General Membership
  MEMBER: 'member',                    // Level 2
  CANDIDATE: 'candidate',              // Level 1
  INITIATE: 'initiate',               // Level 1
  GUEST: 'guest'                      // Level 0
};

// ORLQB Security Authorization Levels (0 = lowest, 4 = highest)
export const SECURITY_LEVELS = {
  [HANGAR_ROLES.GUEST]: 0,              // Visitors, public access
  [HANGAR_ROLES.CANDIDATE]: 1,          // Prospective members
  [HANGAR_ROLES.INITIATE]: 1,           // New initiates
  [HANGAR_ROLES.MEMBER]: 2,             // Full active members
  [HANGAR_ROLES.ASSISTANT_GOVERNOR]: 3,  // Deputy Leadman
  [HANGAR_ROLES.KEYMAN]: 3,             // Key holder
  [HANGAR_ROLES.ASSISTANT_KEYMAN]: 3,   // Deputy Keyman
  [HANGAR_ROLES.BEAM_MAN]: 3,           // Ceremonial reporting and oversight
  [HANGAR_ROLES.GOVERNOR]: 4,           // Hangar Commander
  [HANGAR_ROLES.HISTORIAN]: 4,          // Historical keeper
  [HANGAR_ROLES.SUDO_ADMIN]: 5          // Technical admin (outside hierarchy)
};

// Leadmen Personas (Level 3 & 4 roles)
export const LEADMEN_ROLES = [
  HANGAR_ROLES.GOVERNOR,
  HANGAR_ROLES.HISTORIAN,
  HANGAR_ROLES.ASSISTANT_GOVERNOR,
  HANGAR_ROLES.KEYMAN,
  HANGAR_ROLES.ASSISTANT_KEYMAN,
  HANGAR_ROLES.BEAM_MAN
];

// Level 3 Leadmen (Deputy Leadership)
export const LEVEL_3_LEADMEN = [
  HANGAR_ROLES.ASSISTANT_GOVERNOR,
  HANGAR_ROLES.KEYMAN,
  HANGAR_ROLES.ASSISTANT_KEYMAN,
  HANGAR_ROLES.BEAM_MAN
];

// Level 4 Leadmen (Senior Leadership)
export const LEVEL_4_LEADMEN = [
  HANGAR_ROLES.GOVERNOR,
  HANGAR_ROLES.HISTORIAN
];

// Predefined sudo admin users (hardcoded for security)
export const SUDO_ADMIN_EMAILS = [
  'thecaptain@captainspeak.com',
  // Add more sudo admin emails here if needed
];

/**
 * Check if user has specific security level or higher
 */
export const hasSecurityLevel = (userRole, requiredLevel) => {
  const userLevel = SECURITY_LEVELS[userRole] || 0;
  return userLevel >= requiredLevel;
};

/**
 * Check if user has specific role or equivalent security level
 */
export const hasRole = (userRole, requiredRole) => {
  const userLevel = SECURITY_LEVELS[userRole] || 0;
  const requiredLevel = SECURITY_LEVELS[requiredRole] || 0;
  return userLevel >= requiredLevel;
};

/**
 * Check if user is sudo admin (hardcoded emails)
 */
export const isSudoAdmin = (email) => {
  if (!email) return false;
  return SUDO_ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Get user role from Firestore or determine from email patterns
 */
export const getUserRole = async (user) => {
  if (!user || !user.email) {
    console.log('getUserRole: No user or email provided');
    return HANGAR_ROLES.GUEST;
  }

  console.log(`getUserRole: Checking role for user ${user.email} (UID: ${user.uid})`);

  // Check if user is hardcoded sudo admin
  if (isSudoAdmin(user.email)) {
    console.log(`getUserRole: User ${user.email} is hardcoded sudo admin`);
    return HANGAR_ROLES.SUDO_ADMIN;
  }

  try {
    // Get user role from Firestore
    if (Platform.OS === 'web') {
      const { doc, getDoc } = require('firebase/firestore');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      console.log(`getUserRole: Firestore lookup for ${user.email} - Document exists: ${userDoc.exists()}`);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role || HANGAR_ROLES.GUEST;
        console.log(`getUserRole: Found Firestore role for ${user.email}: ${role}`);
        console.log(`getUserRole: User document data:`, userData);
        return role;
      } else {
        console.log(`getUserRole: No Firestore document found for ${user.email} (${user.uid})`);
      }
    } else {
      const userDoc = await db.collection('users').doc(user.uid).get();
      
      console.log(`getUserRole: Native Firestore lookup for ${user.email} - Document exists: ${userDoc.exists}`);
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        const role = userData.role || HANGAR_ROLES.GUEST;
        console.log(`getUserRole: Found native Firestore role for ${user.email}: ${role}`);
        console.log(`getUserRole: User document data:`, userData);
        return role;
      } else {
        console.log(`getUserRole: No native Firestore document found for ${user.email} (${user.uid})`);
      }
    }

    // Default role determination based on email patterns
    const email = user.email.toLowerCase();
    
    // ORLQB Hangar Leadership email patterns
    if (email.includes('governor') && !email.includes('assistant')) {
      return HANGAR_ROLES.GOVERNOR;
    } else if (email.includes('assistant') && email.includes('governor')) {
      return HANGAR_ROLES.ASSISTANT_GOVERNOR;
    } else if (email.includes('historian')) {
      return HANGAR_ROLES.HISTORIAN;
    } else if (email.includes('keyman') && !email.includes('assistant')) {
      return HANGAR_ROLES.KEYMAN;
    } else if (email.includes('assistant') && email.includes('keyman')) {
      return HANGAR_ROLES.ASSISTANT_KEYMAN;
    } else if (email.includes('beam') || email.includes('beamman')) {
      return HANGAR_ROLES.BEAM_MAN;
    } else if (email.includes('candidate')) {
      return HANGAR_ROLES.CANDIDATE;
    } else if (email.includes('initiate')) {
      return HANGAR_ROLES.INITIATE;
    } else if (email.includes('@orlqb.org') || email === 'test@example.com' || email === 'test@test.com') {
      console.log(`getUserRole: Email pattern match for ${email} - assigning MEMBER role`);
      return HANGAR_ROLES.MEMBER;
    }
    
    return HANGAR_ROLES.GUEST;

  } catch (error) {
    console.error('Error getting user role:', error);
    return HANGAR_ROLES.GUEST;
  }
};

/**
 * Create or update user profile in Firestore
 */
export const createUserProfile = async (user, role = HANGAR_ROLES.MEMBER) => {
  if (!user) return { success: false, error: 'No user provided' };

  try {
    const userProfile = {
      uid: user.uid,
      email: user.email,
      role: isSudoAdmin(user.email) ? HANGAR_ROLES.SUDO_ADMIN : role,
      displayName: user.displayName || user.email.split('@')[0],
      hangar: 'Orlando', // ORLQB Orlando Hangar
      securityLevel: SECURITY_LEVELS[role] || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      lastLogin: new Date().toISOString()
    };

    if (Platform.OS === 'web') {
      const { doc, setDoc } = require('firebase/firestore');
      await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });
    } else {
      await db.collection('users').doc(user.uid).set(userProfile, { merge: true });
    }

    return { success: true, role: userProfile.role };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user role (sudo admin only)
 */
export const updateUserRole = async (currentUser, targetUserId, newRole) => {
  if (!currentUser) return { success: false, error: 'Not authenticated' };

  // Only sudo admins can change roles
  const currentUserRole = await getUserRole(currentUser);
  if (currentUserRole !== HANGAR_ROLES.SUDO_ADMIN) {
    return { success: false, error: 'Insufficient permissions' };
  }

  // Cannot change sudo admin status (hardcoded)
  if (newRole === HANGAR_ROLES.SUDO_ADMIN) {
    return { success: false, error: 'Sudo admin status is hardcoded and cannot be changed' };
  }

  // Validate new role exists in HANGAR_ROLES
  if (!Object.values(HANGAR_ROLES).includes(newRole)) {
    return { success: false, error: 'Invalid role specified' };
  }

  try {
    const updateData = {
      role: newRole,
      securityLevel: SECURITY_LEVELS[newRole] || 0,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.email
    };

    if (Platform.OS === 'web') {
      const { doc, updateDoc } = require('firebase/firestore');
      await updateDoc(doc(db, 'users', targetUserId), updateData);
    } else {
      await db.collection('users').doc(targetUserId).update(updateData);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all users (admin/sudo admin only)
 */
export const getAllUsers = async (currentUser) => {
  if (!currentUser) return { success: false, error: 'Not authenticated' };

  const currentUserRole = await getUserRole(currentUser);
  if (!hasSecurityLevel(currentUserRole, 3)) { // Level 3+ can view users
    return { success: false, error: 'Insufficient permissions' };
  }

  try {
    const users = [];

    if (Platform.OS === 'web') {
      const { collection, getDocs, orderBy, query } = require('firebase/firestore');
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(usersQuery);
      
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
    } else {
      const snapshot = await db
        .collection('users')
        .orderBy('createdAt', 'desc')
        .get();
      
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
    }

    return { success: true, users };
  } catch (error) {
    console.error('Error getting users:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ORLQB Permission Checking Functions
 */

// Event Management (Level 3+ Leadmen)
export const canManageEvents = (userRole) => {
  return hasSecurityLevel(userRole, 3) || userRole === HANGAR_ROLES.SUDO_ADMIN;
};

// User Management (Sudo Admin only)
export const canManageUsers = (userRole) => {
  return userRole === HANGAR_ROLES.SUDO_ADMIN;
};

// System Management (Sudo Admin only)
export const canManageSystem = (userRole) => {
  return userRole === HANGAR_ROLES.SUDO_ADMIN;
};

// View Member Data (Level 3+ Leadmen)
export const canViewMemberData = (userRole) => {
  return hasSecurityLevel(userRole, 3) || userRole === HANGAR_ROLES.SUDO_ADMIN;
};

// Access Member Resources (Level 2+ Members)
export const canAccessMemberResources = (userRole) => {
  return hasSecurityLevel(userRole, 2) || userRole === HANGAR_ROLES.SUDO_ADMIN;
};

// Access Leadership Functions (Level 3+ Leadmen)
export const canAccessLeadershipFeatures = (userRole) => {
  return hasSecurityLevel(userRole, 3) || userRole === HANGAR_ROLES.SUDO_ADMIN;
};

// Access Senior Leadership Functions (Level 4 only)
export const canAccessSeniorLeadership = (userRole) => {
  return hasSecurityLevel(userRole, 4) || userRole === HANGAR_ROLES.SUDO_ADMIN;
};

// Check if user is Leadman (Level 3 or 4)
export const isLeadman = (userRole) => {
  return LEADMEN_ROLES.includes(userRole);
};

// Check if user is Level 3 Leadman
export const isLevel3Leadman = (userRole) => {
  return LEVEL_3_LEADMEN.includes(userRole);
};

// Check if user is Level 4 Leadman  
export const isLevel4Leadman = (userRole) => {
  return LEVEL_4_LEADMEN.includes(userRole);
};

/**
 * ORLQB Role Display Helpers
 */
export const getRoleDisplayName = (role) => {
  switch (role) {
    // System Administration
    case HANGAR_ROLES.SUDO_ADMIN: return 'System Administrator';
    
    // Level 4 Leadership
    case HANGAR_ROLES.GOVERNOR: return 'Governor';
    case HANGAR_ROLES.HISTORIAN: return 'Historian';
    
    // Level 3 Leadership
    case HANGAR_ROLES.ASSISTANT_GOVERNOR: return 'Assistant Governor';
    case HANGAR_ROLES.KEYMAN: return 'Keyman';
    case HANGAR_ROLES.ASSISTANT_KEYMAN: return 'Assistant Keyman';
    case HANGAR_ROLES.BEAM_MAN: return 'Beam Man';
    
    // General Membership
    case HANGAR_ROLES.MEMBER: return 'Member';
    case HANGAR_ROLES.CANDIDATE: return 'Candidate';
    case HANGAR_ROLES.INITIATE: return 'Initiate';
    case HANGAR_ROLES.GUEST: return 'Guest';
    
    default: return 'Unknown';
  }
};

export const getRoleColor = (role) => {
  switch (role) {
    // System Administration
    case HANGAR_ROLES.SUDO_ADMIN: return '#ff0000'; // Red
    
    // Level 4 Leadership - Gold/Purple
    case HANGAR_ROLES.GOVERNOR: return '#8B4513'; // Brown/Gold
    case HANGAR_ROLES.HISTORIAN: return '#7B68EE'; // Medium Slate Blue
    
    // Level 3 Leadership - Blue variations  
    case HANGAR_ROLES.ASSISTANT_GOVERNOR: return '#4682B4'; // Steel Blue
    case HANGAR_ROLES.KEYMAN: return '#1E90FF'; // Dodger Blue
    case HANGAR_ROLES.ASSISTANT_KEYMAN: return '#6495ED'; // Cornflower Blue
    case HANGAR_ROLES.BEAM_MAN: return '#0000CD'; // Medium Blue
    
    // General Membership - Green variations
    case HANGAR_ROLES.MEMBER: return '#228B22'; // Forest Green
    case HANGAR_ROLES.CANDIDATE: return '#FFA500'; // Orange
    case HANGAR_ROLES.INITIATE: return '#FF8C00'; // Dark Orange
    case HANGAR_ROLES.GUEST: return '#999999'; // Gray
    
    default: return '#999999';
  }
};

export const getRoleIcon = (role) => {
  switch (role) {
    // System Administration
    case HANGAR_ROLES.SUDO_ADMIN: return 'shield-checkmark-outline';
    
    // Level 4 Leadership
    case HANGAR_ROLES.GOVERNOR: return 'star-outline';
    case HANGAR_ROLES.HISTORIAN: return 'book-outline';
    
    // Level 3 Leadership
    case HANGAR_ROLES.ASSISTANT_GOVERNOR: return 'ribbon-outline';
    case HANGAR_ROLES.KEYMAN: return 'key-outline';
    case HANGAR_ROLES.ASSISTANT_KEYMAN: return 'keypad-outline';
    case HANGAR_ROLES.BEAM_MAN: return 'construct-outline';
    
    // General Membership
    case HANGAR_ROLES.MEMBER: return 'person-outline';
    case HANGAR_ROLES.CANDIDATE: return 'person-add-outline';
    case HANGAR_ROLES.INITIATE: return 'school-outline';
    case HANGAR_ROLES.GUEST: return 'eye-outline';
    
    default: return 'help-outline';
  }
};

/**
 * Create a specific user document in Firestore (admin function)
 */
export const createSpecificUserDocument = async (currentUser, userData) => {
  if (!currentUser) return { success: false, error: 'Not authenticated' };

  // Only sudo admins can create specific user documents
  const currentUserRole = await getUserRole(currentUser);
  if (currentUserRole !== HANGAR_ROLES.SUDO_ADMIN) {
    return { success: false, error: 'Insufficient permissions' };
  }

  if (!userData.email || !userData.uid || !userData.role) {
    return { success: false, error: 'Missing required user data (email, uid, role)' };
  }

  try {
    const userProfile = {
      uid: userData.uid,
      email: userData.email,
      role: userData.role,
      displayName: userData.displayName || userData.email.split('@')[0],
      hangar: 'Orlando',
      securityLevel: SECURITY_LEVELS[userData.role] || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser.email,
      isActive: true,
      lastLogin: new Date().toISOString()
    };

    if (Platform.OS === 'web') {
      const { doc, setDoc } = require('firebase/firestore');
      await setDoc(doc(db, 'users', userData.uid), userProfile, { merge: true });
    } else {
      await db.collection('users').doc(userData.uid).set(userProfile, { merge: true });
    }

    console.log(`✅ User document created: ${userData.email} as ${userData.role}`);
    return { success: true, userProfile };
  } catch (error) {
    console.error('Error creating user document:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Initialize test user document for test@test.com
 */
export const initializeTestUser = async (user) => {
  if (!user || user.email !== 'test@test.com') return;

  try {
    // Create test user profile as SUDO_ADMIN for testing
    const testUserProfile = {
      uid: user.uid,
      email: user.email,
      role: HANGAR_ROLES.SUDO_ADMIN, // Make test user sudo admin for testing
      displayName: 'Test Administrator',
      hangar: 'Orlando',
      securityLevel: SECURITY_LEVELS[HANGAR_ROLES.SUDO_ADMIN],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      lastLogin: new Date().toISOString()
    };

    if (Platform.OS === 'web') {
      const { doc, setDoc } = require('firebase/firestore');
      await setDoc(doc(db, 'users', user.uid), testUserProfile, { merge: true });
    } else {
      await db.collection('users').doc(user.uid).set(testUserProfile, { merge: true });
    }

    console.log(`✅ Test user initialized: ${user.email} as ${HANGAR_ROLES.SUDO_ADMIN}`);
  } catch (error) {
    console.error('Error initializing test user:', error);
  }
};

/**
 * Initialize sudo admin user on first login
 */
export const initializeSudoAdmin = async (user) => {
  if (!user || !isSudoAdmin(user.email)) return;

  try {
    // Create/update sudo admin profile
    await createUserProfile(user, HANGAR_ROLES.SUDO_ADMIN);
    console.log(`✅ ORLQB System Administrator initialized: ${user.email}`);
  } catch (error) {
    console.error('Error initializing sudo admin:', error);
  }
};

/**
 * ADMINISTRATOR MONITORING SYSTEM
 * 
 * These functions provide visibility tracking for component access,
 * allowing administrators to monitor which users are accessing 
 * which restricted components and pages.
 */

// In-memory storage for visibility events (production should use Firebase)
let visibilityEventLog = [];
const MAX_LOG_ENTRIES = 1000; // Keep last 1000 events in memory

/**
 * Log a visibility event for administrator monitoring
 */
export const logVisibilityEvent = (eventData) => {
  try {
    const event = {
      id: generateEventId(),
      ...eventData,
      timestamp: eventData.timestamp || new Date().toISOString()
    };

    // Add to in-memory log
    visibilityEventLog.unshift(event);
    
    // Keep only the most recent entries
    if (visibilityEventLog.length > MAX_LOG_ENTRIES) {
      visibilityEventLog = visibilityEventLog.slice(0, MAX_LOG_ENTRIES);
    }

    // In production, this should also write to Firestore for persistent monitoring
    // TODO: Add Firestore persistence for admin monitoring
    if (eventData.userRole === HANGAR_ROLES.SUDO_ADMIN || eventData.userLevel >= 4) {
      console.log('📊 Admin Access Event:', {
        component: event.componentName,
        user: event.userEmail,
        role: event.userRole,
        granted: event.accessGranted,
        reason: event.accessReason
      });
    }

  } catch (error) {
    console.error('Error logging visibility event:', error);
  }
};

/**
 * Generate unique event ID
 */
const generateEventId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Get visibility events for administrator dashboard (sudo admin only)
 */
export const getVisibilityEvents = async (currentUser, filters = {}) => {
  if (!currentUser) return { success: false, error: 'Not authenticated' };

  const currentUserRole = await getUserRole(currentUser);
  if (currentUserRole !== HANGAR_ROLES.SUDO_ADMIN) {
    return { success: false, error: 'Insufficient permissions - Sudo Admin required' };
  }

  try {
    let filteredEvents = [...visibilityEventLog];

    // Apply filters
    if (filters.userEmail) {
      filteredEvents = filteredEvents.filter(event => 
        event.userEmail.toLowerCase().includes(filters.userEmail.toLowerCase())
      );
    }

    if (filters.componentName) {
      filteredEvents = filteredEvents.filter(event => 
        event.componentName.toLowerCase().includes(filters.componentName.toLowerCase())
      );
    }

    if (filters.userRole) {
      filteredEvents = filteredEvents.filter(event => event.userRole === filters.userRole);
    }

    if (filters.accessGranted !== undefined) {
      filteredEvents = filteredEvents.filter(event => event.accessGranted === filters.accessGranted);
    }

    if (filters.dateFrom) {
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.timestamp) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.timestamp) <= new Date(filters.dateTo)
      );
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    const limit = filters.limit || 100;
    filteredEvents = filteredEvents.slice(0, limit);

    return { 
      success: true, 
      events: filteredEvents,
      totalCount: visibilityEventLog.length
    };
  } catch (error) {
    console.error('Error getting visibility events:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get visibility statistics for administrator dashboard
 */
export const getVisibilityStatistics = async (currentUser) => {
  if (!currentUser) return { success: false, error: 'Not authenticated' };

  const currentUserRole = await getUserRole(currentUser);
  if (currentUserRole !== HANGAR_ROLES.SUDO_ADMIN) {
    return { success: false, error: 'Insufficient permissions - Sudo Admin required' };
  }

  try {
    const stats = {
      totalEvents: visibilityEventLog.length,
      accessGranted: 0,
      accessDenied: 0,
      uniqueUsers: new Set(),
      uniqueComponents: new Set(),
      roleBreakdown: {},
      denialReasons: {},
      recentActivity: []
    };

    // Calculate statistics
    visibilityEventLog.forEach(event => {
      if (event.accessGranted) {
        stats.accessGranted++;
      } else {
        stats.accessDenied++;
        stats.denialReasons[event.accessReason] = (stats.denialReasons[event.accessReason] || 0) + 1;
      }

      stats.uniqueUsers.add(event.userEmail);
      stats.uniqueComponents.add(event.componentName);
      
      stats.roleBreakdown[event.userRole] = (stats.roleBreakdown[event.userRole] || 0) + 1;
    });

    // Get recent activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    stats.recentActivity = visibilityEventLog.filter(event => 
      new Date(event.timestamp) > yesterday
    ).slice(0, 20); // Last 20 recent events

    // Convert Sets to counts
    stats.uniqueUsers = stats.uniqueUsers.size;
    stats.uniqueComponents = stats.uniqueComponents.size;

    return { success: true, statistics: stats };
  } catch (error) {
    console.error('Error getting visibility statistics:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear visibility event log (sudo admin only)
 */
export const clearVisibilityLog = async (currentUser) => {
  if (!currentUser) return { success: false, error: 'Not authenticated' };

  const currentUserRole = await getUserRole(currentUser);
  if (currentUserRole !== HANGAR_ROLES.SUDO_ADMIN) {
    return { success: false, error: 'Insufficient permissions - Sudo Admin required' };
  }

  try {
    const clearedCount = visibilityEventLog.length;
    visibilityEventLog = [];
    
    // Log the clear action
    logVisibilityEvent({
      componentName: 'Admin Monitor - Log Cleared',
      userEmail: currentUser.email,
      userRole: currentUserRole,
      userLevel: SECURITY_LEVELS[currentUserRole],
      accessGranted: true,
      accessReason: 'admin_log_cleared',
      metadata: { clearedCount }
    });

    return { success: true, message: `Cleared ${clearedCount} events from visibility log` };
  } catch (error) {
    console.error('Error clearing visibility log:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export visibility events to JSON (sudo admin only)
 */
export const exportVisibilityEvents = async (currentUser, filters = {}) => {
  if (!currentUser) return { success: false, error: 'Not authenticated' };

  const currentUserRole = await getUserRole(currentUser);
  if (currentUserRole !== HANGAR_ROLES.SUDO_ADMIN) {
    return { success: false, error: 'Insufficient permissions - Sudo Admin required' };
  }

  try {
    const result = await getVisibilityEvents(currentUser, filters);
    if (!result.success) return result;

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser.email,
      filters,
      totalEvents: result.totalCount,
      exportedEvents: result.events.length,
      events: result.events
    };

    return { success: true, exportData };
  } catch (error) {
    console.error('Error exporting visibility events:', error);
    return { success: false, error: error.message };
  }
};