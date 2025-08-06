/**
 * ORLQB Roster Processing Utility
 * 
 * Processes the ORL Sign In Roster JSON and creates properly formatted member entries
 * for the ORLQB Member Management System with all required metadata fields.
 */

import { HANGAR_ROLES, SECURITY_LEVELS } from './userRoles';

/**
 * Parse and clean phone number
 */
const cleanPhoneNumber = (phone) => {
  if (!phone || phone === '') return '';
  // Remove extra annotations like (c), (h) 
  return phone.replace(/\s*\([ch]\)$/, '').trim();
};

/**
 * Parse name into first and last name
 */
const parseName = (fullName) => {
  if (!fullName) return { firstName: '', lastName: '' };
  
  // Handle formats like "Last, First" or "Last Jr, First" or "Last III, First"
  const parts = fullName.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    const lastName = parts[0].trim();
    const firstName = parts[1].trim();
    return { firstName, lastName };
  } else {
    // Fallback for names without comma
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length >= 2) {
      return { 
        firstName: nameParts[0], 
        lastName: nameParts.slice(1).join(' ')
      };
    }
    return { firstName: fullName.trim(), lastName: '' };
  }
};

/**
 * Generate display name from full name and nickname
 */
const generateDisplayName = (fullName, nickname = '') => {
  if (nickname && nickname.trim() !== '') {
    // For names like "McLeroy, Johnathan" with nickname "JohnnyMac"
    // Return "Johnathan \"JohnnyMac\" McLeroy"
    const { firstName, lastName } = parseName(fullName);
    return `${firstName} "${nickname}" ${lastName}`.trim();
  }
  // Just return the first name from the full name
  const { firstName } = parseName(fullName);
  return firstName || fullName;
};

/**
 * Determine member role based on status and other factors
 * For now, we'll assign based on status, but this could be enhanced
 * with additional logic for leadership roles
 */
const determineMemberRole = (status, qbNumber = '', name = '') => {
  // These would need to be manually assigned or determined through additional data
  // For demonstration, we'll assign most as members with some exceptions
  
  // Known leadership roles (would need to be manually updated)
  const knownLeadership = {
    '39764': HANGAR_ROLES.GOVERNOR,  // Example: McLeroy as Governor
    // Add other known leadership roles here
  };
  
  if (knownLeadership[qbNumber]) {
    return knownLeadership[qbNumber];
  }
  
  switch (status) {
    case 'A': // Active
      return HANGAR_ROLES.MEMBER;
    case 'I': // Inactive  
      return HANGAR_ROLES.MEMBER; // Still member, just inactive
    case 'U': // Unknown
      return HANGAR_ROLES.GUEST;
    default:
      return HANGAR_ROLES.GUEST;
  }
};

/**
 * Generate comprehensive address from available fields
 */
const generateAddress = (street = '', city = '', state = '') => {
  const addressParts = [street, city, state].filter(part => part && part.trim() !== '');
  return addressParts.join(', ');
};

/**
 * Get security level for a given role
 */
const getSecurityLevel = (role) => {
  return SECURITY_LEVELS[role] || 0;
};

/**
 * Process a single member from the roster JSON
 */
export const processRosterMember = (rosterMember) => {
  const processedMember = {
    // === ROSTER METADATA FIELDS (exact from JSON) ===
    status: rosterMember.status || '', // Member status (A=Active, I=Inactive, U=Unknown)
    qbNumber: rosterMember.qbNumber || '', // QB membership number
    name: rosterMember.name || '', // Full name (Last, First format)
    nickname: rosterMember.nickname || '', // Nickname or preferred name
    Street: rosterMember.Street || '', // Street address
    city: rosterMember.city || '', // City of residence
    state: rosterMember.state || '', // State of residence
    email: rosterMember.email || '', // Email address
    email2: rosterMember.email2 || '', // Secondary email address (if applicable)
    phone: cleanPhoneNumber(rosterMember.phone || ''), // Primary phone number
    phone2: cleanPhoneNumber(rosterMember.phone2 || ''), // Secondary phone number (if applicable)
    beamExpires: rosterMember.beamExpires || '', // Beam magazine expiration status/date
    emergencyContact: rosterMember.emergencyContact || '', // Emergency contact name
    emergencyPhone: rosterMember.emergencyPhone || '', // Emergency contact phone number
    emergencyEmail: rosterMember.emergencyEmail || '', // Emergency contact email address
    emerRelationship: rosterMember.emerRelationship || '', // Relationship to emergency contact
    DateOfBirth: rosterMember.DateOfBirth || '', // Date of birth (MM/DD/YYYY)
    inductingHangar: rosterMember.inductingHangar || '', // Hanger where the member was inducted
    inductingDate: rosterMember.inductingDate || '', // Date of induction into the ORL (MM/DD/YYYY)
    certificateNumber: rosterMember.certificateNumber || '', // Certificate number (if applicable)
    'certifiedPIC/SoloHours': rosterMember['certifiedPIC/SoloHours'] || '', // Total hours as Pilot in Command or solo (if applicable)
    soloDate: rosterMember.soloDate || '', // Date of first solo flight (if applicable, MM/DD/YYYY)
    soloLocation: rosterMember.soloLocation || '', // Location of first solo flight (if applicable)
    sponsor1: rosterMember.sponsor1 || '', // First sponsor's name (Last, First qbNumber)
    sponsor2: rosterMember.sponsor2 || '', // Second sponsor's name (Last, First qbNumber)
    sponsor3: rosterMember.sponsor3 || '', // Third sponsor's name (Last, First qbNumber)
    sponsor4: rosterMember.sponsor4 || '', // Fourth sponsor's name (Last, First qbNumber)
    sponsor5: rosterMember.sponsor5 || '', // Fifth sponsor's name (Last, First qbNumber)
    goneWest: rosterMember.goneWest || '', // Date the member went west (if applicable, MM/DD/YYYY)
    
    // === EXISTING SYSTEM FIELDS (for compatibility) ===
    createdAt: new Date().toISOString(),
    displayName: generateDisplayName(rosterMember.name, rosterMember.nickname),
    hangar: 'Orlando',
    isActive: rosterMember.status === 'A',
    lastLogin: '',
    role: determineMemberRole(rosterMember.status, rosterMember.qbNumber, rosterMember.name),
    securityLevel: getSecurityLevel(determineMemberRole(rosterMember.status, rosterMember.qbNumber, rosterMember.name)),
    uid: '',
    updatedAt: new Date().toISOString()
  };
  
  return processedMember;
};

/**
 * Process the entire ORLQB roster JSON file
 */
export const processORLQBRoster = (rosterData) => {
  if (!rosterData || !rosterData.members || !Array.isArray(rosterData.members)) {
    throw new Error('Invalid roster data format');
  }
  
  const processedMembers = rosterData.members.map(member => processRosterMember(member));
  
  // Generate statistics
  const stats = {
    totalMembers: processedMembers.length,
    activeMembers: processedMembers.filter(m => m.isActive).length,
    inactiveMembers: processedMembers.filter(m => !m.isActive).length,
    membersWithEmail: processedMembers.filter(m => m.email && m.email.trim() !== '').length,
    membersWithPhone: processedMembers.filter(m => m.phone && m.phone.trim() !== '').length,
    membersWithEmergencyContact: processedMembers.filter(m => m.emergencyContact && m.emergencyContact.trim() !== '').length,
    deceased: processedMembers.filter(m => m.isDeceased).length,
    roleDistribution: processedMembers.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {}),
    beamSubscriptions: {
      active: processedMembers.filter(m => m.beamStatus === 'active').length,
      expired: processedMembers.filter(m => m.beamStatus === 'expired').length,
      compLife: processedMembers.filter(m => m.beamExpires && m.beamExpires.toLowerCase().includes('comp life')).length
    }
  };
  
  return {
    members: processedMembers,
    statistics: stats,
    metadata: {
      processedAt: new Date().toISOString(),
      originalData: rosterData.metadata,
      processingVersion: '1.0.0'
    }
  };
};

/**
 * Generate Firebase-compatible member data for seeding
 */
export const generateFirebaseMembers = (processedRosterData) => {
  const firebaseMembers = {};
  
  processedRosterData.members.forEach(member => {
    // Use QB Number as document ID for consistency
    const docId = `qb_${member.qbNumber}`;
    
    // Firebase document contains all fields exactly as processed
    firebaseMembers[docId] = { ...member };
  });
  
  return firebaseMembers;
};

/**
 * Utility to find specific members by criteria
 */
export const findMembers = (processedMembers, criteria) => {
  return processedMembers.filter(member => {
    return Object.entries(criteria).every(([key, value]) => {
      if (typeof value === 'string') {
        return member[key] && member[key].toLowerCase().includes(value.toLowerCase());
      }
      return member[key] === value;
    });
  });
};

/**
 * Merge existing Firebase Auth user with roster data
 * This ensures compatibility between login-based users and roster imports
 */
export const mergeWithExistingUser = (rosterMember, existingUser = null) => {
  if (!existingUser) {
    return rosterMember;
  }
  
  // Preserve Firebase Auth fields and merge with roster data
  return {
    ...rosterMember,
    
    // Preserve Firebase Auth specific fields
    uid: existingUser.uid || rosterMember.uid,
    email: existingUser.email || rosterMember.email, // Prefer auth email
    photoURL: existingUser.photoURL || rosterMember.photoURL,
    isEmailVerified: existingUser.emailVerified || rosterMember.isEmailVerified,
    
    // Preserve existing user timestamps if they exist
    createdAt: existingUser.createdAt || rosterMember.createdAt,
    lastLoginAt: existingUser.lastLoginAt || rosterMember.lastLoginAt,
    
    // Mark as merged user type
    membershipType: 'firebase-auth-merged',
    
    // Preserve existing preferences if available
    preferences: {
      ...rosterMember.preferences,
      ...existingUser.preferences
    },
    
    // Update metadata
    updatedAt: new Date().toISOString(),
    updatedBy: 'roster-merge'
  };
};

/**
 * Generate user document for existing Firebase Auth users without roster data
 * This creates a compatible structure for users who log in but aren't in the roster
 */
export const generateAuthUserDocument = (firebaseUser, assignedRole = HANGAR_ROLES.GUEST) => {
  const { firstName, lastName } = parseName(firebaseUser.displayName || '');
  
  return {
    // Firebase Auth Fields
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || '',
    isEmailVerified: firebaseUser.emailVerified || false,
    
    // Basic Information
    qbNumber: '', // Not available for auth-only users
    firstName: firstName,
    lastName: lastName,
    fullName: firebaseUser.displayName || '',
    displayName: firebaseUser.displayName || `${firstName} ${lastName}`.trim(),
    nickname: '',
    
    // Contact Information (minimal for auth users)
    email2: '',
    phone: firebaseUser.phoneNumber || '',
    phone2: '',
    
    // Address Information (empty for auth users)
    address: '',
    street: '',
    Street: '',
    city: '',
    state: '',
    
    // Emergency Contacts (empty for auth users)
    emergencyContact: '',
    emergencyPhone: '',
    emergencyEmail: '',
    emergencyRelationship: '',
    emerRelationship: '',
    
    // Role and Status
    role: assignedRole,
    status: 'U', // Unknown status for auth-only users
    isActive: true, // Auth users are considered active
    securityLevel: getSecurityLevel(assignedRole),
    permissions: [],
    
    // Membership Details (empty for auth users)
    dateOfBirth: '',
    DateOfBirth: '',
    inductingHangar: '',
    inductionDate: '',
    inductingDate: '',
    joinDate: new Date().toISOString(), // Use current date as join date
    
    // Aviation Information (empty for auth users)
    certificateNumber: '',
    pilotHours: '',
    'certifiedPIC/SoloHours': '',
    soloDate: '',
    soloLocation: '',
    
    // Sponsorship (empty for auth users)
    sponsors: [],
    sponsor1: '',
    sponsor2: '',
    sponsor3: '',
    sponsor4: '',
    sponsor5: '',
    
    // Beam Magazine (default to expired for auth users)
    beamExpires: 'Expired',
    beamStatus: 'expired',
    
    // Memorial (not applicable for auth users)
    goneWest: '',
    isDeceased: false,
    
    // Profile
    profilePhoto: '',
    
    // System Fields
    notes: 'Firebase Authentication User',
    accountStatus: 'active',
    membershipType: 'firebase-auth',
    isPhoneVerified: false,
    
    // User Preferences
    preferences: {
      notifications: true,
      emailUpdates: true,
      privacy: 'members-only'
    },
    
    // Timestamps
    createdAt: new Date().toISOString(),
    createdBy: 'firebase-auth',
    updatedAt: new Date().toISOString(),
    updatedBy: 'firebase-auth',
    lastLoginAt: new Date().toISOString(),
    
    // Import Metadata
    importSource: 'firebase-auth',
    importDate: new Date().toISOString(),
    dataVersion: '1.0.0'
  };
};

/**
 * Export member data to various formats
 */
export const exportMemberData = (processedMembers, format = 'json') => {
  switch (format.toLowerCase()) {
    case 'json':
      return JSON.stringify(processedMembers, null, 2);
    
    case 'csv':
      if (processedMembers.length === 0) return '';
      
      const headers = Object.keys(processedMembers[0]);
      const csvRows = [
        headers.join(','),
        ...processedMembers.map(member => 
          headers.map(header => {
            const value = member[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        )
      ];
      return csvRows.join('\n');
    
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

export default {
  processRosterMember,
  processORLQBRoster,
  generateFirebaseMembers,
  mergeWithExistingUser,
  generateAuthUserDocument,
  findMembers,
  exportMemberData
};