/**
 * Test script to show the Firebase document structure
 */

// Simplified functions for testing
const cleanPhoneNumber = (phone) => {
  if (!phone || phone === '') return '';
  return phone.replace(/\s*\([ch]\)$/, '').trim();
};

const parseName = (fullName) => {
  if (!fullName) return { firstName: '', lastName: '' };
  
  const parts = fullName.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    const lastName = parts[0].trim();
    const firstName = parts[1].trim();
    return { firstName, lastName };
  } else {
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

const generateDisplayName = (fullName, nickname = '') => {
  if (nickname && nickname.trim() !== '') {
    const { firstName, lastName } = parseName(fullName);
    return `${firstName} "${nickname}" ${lastName}`.trim();
  }
  const { firstName } = parseName(fullName);
  return firstName || fullName;
};

const determineMemberRole = (status) => {
  switch (status) {
    case 'A': return 'member';
    case 'I': return 'member';
    case 'U': return 'guest';
    default: return 'guest';
  }
};

const getSecurityLevel = (role) => {
  const levels = {
    'sudo_admin': 5,
    'governor': 4,
    'historian': 4,
    'assistant_governor': 3,
    'keyman': 3,
    'assistant_keyman': 3,
    'beam_man': 3,
    'member': 2,
    'candidate': 1,
    'initiate': 1,
    'guest': 0
  };
  return levels[role] || 0;
};

// Process a single member
const processRosterMember = (rosterMember) => {
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

// Load test data and process
const testData = require('./test_roster_clean.json');
const firstMember = processRosterMember(testData.members[0]);

console.log('=== FIREBASE USER DOCUMENT STRUCTURE ===');
console.log();
console.log('Document ID: qb_' + firstMember.qbNumber);
console.log();
console.log('DOCUMENT FIELDS:');
console.log(JSON.stringify(firstMember, null, 2));
console.log();
console.log('=== FIELD SUMMARY ===');
console.log('Total fields:', Object.keys(firstMember).length);

// Count roster metadata fields
const rosterFields = [
  'status', 'qbNumber', 'name', 'nickname', 'Street', 'city', 'state', 'email', 'email2', 
  'phone', 'phone2', 'beamExpires', 'emergencyContact', 'emergencyPhone', 'emergencyEmail', 
  'emerRelationship', 'DateOfBirth', 'inductingHangar', 'inductingDate', 'certificateNumber', 
  'certifiedPIC/SoloHours', 'soloDate', 'soloLocation', 'sponsor1', 'sponsor2', 'sponsor3', 
  'sponsor4', 'sponsor5', 'goneWest'
];

const systemFields = [
  'createdAt', 'displayName', 'hangar', 'isActive', 'lastLogin', 'role', 'securityLevel', 'uid', 'updatedAt'
];

console.log('Roster metadata fields:', rosterFields.length);
console.log('System compatibility fields:', systemFields.length);
console.log();
console.log('✅ Structure ready for Firebase import!');