/**
 * ORLQB Roster Processing Utility
 * 
 * Processes the ORL Sign In Roster JSON and creates properly formatted member entries
 * for the ORLQB Member Management System with all required metadata fields.
 */

import { HANGAR_ROLES } from './userRoles';

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
 * Generate display name from parsed name
 */
const generateDisplayName = (firstName, lastName, nickname = '') => {
  if (nickname && nickname.trim() !== '') {
    return `${firstName} "${nickname}" ${lastName}`.trim();
  }
  return `${firstName} ${lastName}`.trim();
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
 * Process a single member from the roster JSON
 */
export const processRosterMember = (rosterMember) => {
  const { firstName, lastName } = parseName(rosterMember.name || '');
  
  const processedMember = {
    // Basic Information
    qbNumber: rosterMember.qbNumber || '',
    firstName: firstName,
    lastName: lastName,
    displayName: generateDisplayName(firstName, lastName, rosterMember.nickname),
    nickname: rosterMember.nickname || '',
    
    // Contact Information
    email: rosterMember.email || '',
    email2: rosterMember.email2 || '',
    phone: cleanPhoneNumber(rosterMember.phone || ''),
    phone2: cleanPhoneNumber(rosterMember.phone2 || ''),
    
    // Address Information
    address: generateAddress(rosterMember.Street, rosterMember.city, rosterMember.state),
    street: rosterMember.Street || '',
    city: rosterMember.city || '',
    state: rosterMember.state || '',
    
    // Emergency Contact Information
    emergencyContact: rosterMember.emergencyContact || '',
    emergencyPhone: rosterMember.emergencyPhone || '',
    emergencyEmail: rosterMember.emergencyEmail || '',
    emergencyRelationship: rosterMember.emerRelationship || '',
    
    // ORLQB Specific Information
    role: determineMemberRole(rosterMember.status, rosterMember.qbNumber, rosterMember.name),
    status: rosterMember.status, // A=Active, I=Inactive, U=Unknown
    isActive: rosterMember.status === 'A',
    
    // Membership Details
    dateOfBirth: rosterMember.DateOfBirth || '',
    inductingHangar: rosterMember.inductingHangar || 'Orlando Hangar', // Default to Orlando
    inductionDate: rosterMember.inductingDate || '',
    joinDate: rosterMember.inductingDate || '', // Use induction date as join date
    
    // Aviation Information
    certificateNumber: rosterMember.certificateNumber || '',
    pilotHours: rosterMember['certifiedPIC/SoloHours'] || '',
    soloDate: rosterMember.soloDate || '',
    soloLocation: rosterMember.soloLocation || '',
    
    // Sponsorship Information
    sponsors: [
      rosterMember.sponsor1,
      rosterMember.sponsor2, 
      rosterMember.sponsor3,
      rosterMember.sponsor4,
      rosterMember.sponsor5
    ].filter(sponsor => sponsor && sponsor.trim() !== ''),
    
    // Magazine and Membership Status
    beamExpires: rosterMember.beamExpires || 'Expired',
    beamStatus: rosterMember.beamExpires && rosterMember.beamExpires !== 'Expired' ? 'active' : 'expired',
    
    // Memorial Information
    goneWest: rosterMember.goneWest || '',
    isDeceased: !!(rosterMember.goneWest && rosterMember.goneWest.trim() !== ''),
    
    // System Fields
    notes: `QB Number: ${rosterMember.qbNumber}${rosterMember.nickname ? ` • Nickname: ${rosterMember.nickname}` : ''}`,
    profilePhoto: '', // Would need to be added separately
    
    // Metadata
    createdAt: new Date().toISOString(),
    createdBy: 'roster-import',
    updatedAt: new Date().toISOString(),
    updatedBy: 'roster-import',
    importSource: 'orl_roster_json',
    importDate: new Date().toISOString()
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
    
    // Remove fields that shouldn't go to Firebase
    const { importSource, importDate, processingVersion, ...firebaseMember } = member;
    
    firebaseMembers[docId] = firebaseMember;
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
  findMembers,
  exportMemberData
};