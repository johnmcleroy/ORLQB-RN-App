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
import { firestore } from '../services/firebase';

// ORLQB Hangar Role Constants
export const HANGAR_ROLES = {
  // System Administration (Technical)
  SUDO_ADMIN: 'sudo_admin',
  
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
  [HANGAR_ROLES.ASSISTANT_GOVERNOR]: 3,  // Deputy leadership
  [HANGAR_ROLES.KEYMAN]: 3,             // Key holder
  [HANGAR_ROLES.ASSISTANT_KEYMAN]: 3,   // Deputy key holder
  [HANGAR_ROLES.BEAM_MAN]: 3,           // Ceremonial oversight
  [HANGAR_ROLES.GOVERNOR]: 4,           // Hangar commander
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
      const userDoc = await getDoc(doc(firestore(), 'users', user.uid));
      
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
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      
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
      await setDoc(doc(firestore(), 'users', user.uid), userProfile, { merge: true });
    } else {
      await firestore().collection('users').doc(user.uid).set(userProfile, { merge: true });
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
      await updateDoc(doc(firestore(), 'users', targetUserId), updateData);
    } else {
      await firestore().collection('users').doc(targetUserId).update(updateData);
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
      const usersQuery = query(collection(firestore(), 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(usersQuery);
      
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
    } else {
      const snapshot = await firestore()
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
      await setDoc(doc(firestore(), 'users', userData.uid), userProfile, { merge: true });
    } else {
      await firestore().collection('users').doc(userData.uid).set(userProfile, { merge: true });
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
      await setDoc(doc(firestore(), 'users', user.uid), testUserProfile, { merge: true });
    } else {
      await firestore().collection('users').doc(user.uid).set(testUserProfile, { merge: true });
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