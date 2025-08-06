/**
 * Firebase User Document Creation Script
 * 
 * This script demonstrates how to create user documents with the complete
 * ORLQB roster metadata field structure in Firebase Firestore.
 * 
 * Usage:
 * 1. Run this in your Firebase environment (web console, Node.js, etc.)
 * 2. Or use the MemberDataImporter component in the React Native app
 * 3. Or manually create documents using the Firebase console
 */

// Import your Firebase configuration
// import { firestore } from '../src/services/firebase';

/**
 * Example function to create a user document with all fields
 */
const createUserDocumentExample = async () => {
  // This is the complete structure that will be created
  const sampleUserDocument = {
    // === FIREBASE AUTH FIELDS ===
    uid: '',                              // Firebase Auth UID (if applicable)
    email: 'member@example.com',          // Primary email address
    photoURL: '',                         // Profile photo URL
    isEmailVerified: false,               // Email verification status
    lastLoginAt: '',                      // Last login timestamp

    // === BASIC INFORMATION ===
    qbNumber: '12345',                    // QB membership number (from roster)
    firstName: 'John',                    // Parsed first name
    lastName: 'Doe',                      // Parsed last name
    fullName: 'Doe, John',                // Original name from roster (Last, First format)
    displayName: 'John "Johnny" Doe',     // Formatted display name with nickname
    nickname: 'Johnny',                   // Nickname or preferred name

    // === CONTACT INFORMATION ===
    email2: '',                           // Secondary email (roster metadata field)
    phone: '407-123-4567',                // Primary phone (cleaned)
    phone2: '',                           // Secondary phone (roster metadata field)

    // === ADDRESS INFORMATION ===
    address: '123 Main St, Orlando, FL',  // Formatted full address
    street: '123 Main St',                // Street address (normalized)
    Street: '123 Main St',                // Street address (exact roster field)
    city: 'Orlando',                      // City (roster metadata field)
    state: 'FL',                          // State (roster metadata field)

    // === EMERGENCY CONTACTS ===
    emergencyContact: 'Jane Doe',         // Emergency contact name (roster field)
    emergencyPhone: '407-987-6543',       // Emergency contact phone (roster field)
    emergencyEmail: 'jane@example.com',   // Emergency contact email (roster field)
    emergencyRelationship: 'Spouse',      // Normalized relationship field
    emerRelationship: 'Spouse',           // Exact roster metadata field

    // === ORLQB ROLE & STATUS ===
    role: 'member',                       // ORLQB role (governor, member, etc.)
    status: 'A',                          // A=Active, I=Inactive, U=Unknown (exact roster field)
    isActive: true,                       // Derived active status
    securityLevel: 2,                     // Security level 0-4
    permissions: [],                      // Array of permissions

    // === MEMBERSHIP DETAILS ===
    dateOfBirth: '01/15/1980',           // Date of birth (normalized)
    DateOfBirth: '01/15/1980',           // Date of birth (exact roster field MM/DD/YYYY)
    inductingHangar: 'Orlando Hangar',    // Hangar where inducted (roster field)
    inductionDate: '03/20/2020',         // Induction date (normalized)
    inductingDate: '03/20/2020',         // Induction date (exact roster field MM/DD/YYYY)
    joinDate: '03/20/2020',              // Join date (derived field)

    // === AVIATION INFORMATION ===
    certificateNumber: '123456789',       // Certificate number (roster field)
    pilotHours: '1500',                   // Total PIC/Solo hours (normalized)
    'certifiedPIC/SoloHours': '1500',     // Exact roster field name
    soloDate: '06/15/2001',              // First solo date (roster field MM/DD/YYYY)
    soloLocation: 'KORL',                // First solo location (roster field)

    // === SPONSORSHIP INFORMATION ===
    sponsors: ['Smith, Bob 12345', 'Johnson, Mike 67890'], // Array of sponsor names (processed)
    sponsor1: 'Smith, Bob 12345',        // First sponsor (exact roster field)
    sponsor2: 'Johnson, Mike 67890',     // Second sponsor (exact roster field)
    sponsor3: '',                        // Third sponsor (exact roster field)
    sponsor4: '',                        // Fourth sponsor (exact roster field)
    sponsor5: '',                        // Fifth sponsor (exact roster field)

    // === BEAM MAGAZINE ===
    beamExpires: 'Dec 2025',             // Beam expiration (exact roster field)
    beamStatus: 'active',                // active/expired (derived)

    // === MEMORIAL INFORMATION ===
    goneWest: '',                        // Gone West date (exact roster field MM/DD/YYYY)
    isDeceased: false,                   // Derived deceased status

    // === PROFILE & MEDIA ===
    profilePhoto: '',                    // Local profile photo path

    // === SYSTEM FIELDS ===
    notes: 'QB Number: 12345 • Nickname: Johnny', // System notes
    accountStatus: 'active',             // active/suspended/inactive
    membershipType: 'roster-import',     // roster-import/firebase-auth/firebase-auth-merged
    isPhoneVerified: false,              // Phone verification status

    // === USER PREFERENCES ===
    preferences: {
      notifications: true,
      emailUpdates: true,
      privacy: 'members-only'
    },

    // === TIMESTAMPS ===
    createdAt: new Date().toISOString(), // Document creation timestamp
    createdBy: 'roster-import',          // Created by (roster-import/firebase-auth)
    updatedAt: new Date().toISOString(), // Last update timestamp
    updatedBy: 'roster-import',          // Updated by

    // === IMPORT METADATA ===
    importSource: 'orl_roster_json',     // orl_roster_json/firebase-auth
    importDate: new Date().toISOString(), // Import timestamp
    dataVersion: '1.0.0'                 // Data version (1.0.0)
  };

  console.log('Sample User Document Structure:');
  console.log(JSON.stringify(sampleUserDocument, null, 2));

  // To actually create the document in Firebase:
  /*
  try {
    const docId = `qb_${sampleUserDocument.qbNumber}`;
    
    // For web Firebase SDK:
    // await setDoc(doc(firestore, 'users', docId), sampleUserDocument);
    
    // For React Native Firebase SDK:
    // await firestore().collection('users').doc(docId).set(sampleUserDocument);
    
    console.log(`User document created successfully with ID: ${docId}`);
  } catch (error) {
    console.error('Error creating user document:', error);
  }
  */
};

/**
 * Function to create a minimal Firebase Auth user document
 */
const createAuthUserDocumentExample = async (firebaseUser) => {
  const authUserDocument = {
    // Firebase Auth fields
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || '',
    isEmailVerified: firebaseUser.emailVerified || false,
    
    // Basic info from auth
    firstName: firebaseUser.displayName?.split(' ')[0] || '',
    lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
    fullName: firebaseUser.displayName || '',
    displayName: firebaseUser.displayName || '',
    nickname: '',
    
    // Empty roster fields for auth-only users
    qbNumber: '',
    email2: '',
    phone: firebaseUser.phoneNumber || '',
    phone2: '',
    
    // Address fields (empty for auth users)
    address: '',
    street: '',
    Street: '',
    city: '',
    state: '',
    
    // Emergency contacts (empty for auth users)
    emergencyContact: '',
    emergencyPhone: '',
    emergencyEmail: '',
    emergencyRelationship: '',
    emerRelationship: '',
    
    // Role and status
    role: 'guest',  // Default role for auth users
    status: 'U',    // Unknown status
    isActive: true,
    securityLevel: 0,
    permissions: [],
    
    // Membership details (empty for auth users)
    dateOfBirth: '',
    DateOfBirth: '',
    inductingHangar: '',
    inductionDate: '',
    inductingDate: '',
    joinDate: new Date().toISOString(),
    
    // Aviation info (empty for auth users)
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
    
    // Beam magazine (default expired for auth users)
    beamExpires: 'Expired',
    beamStatus: 'expired',
    
    // Memorial (not applicable for auth users)
    goneWest: '',
    isDeceased: false,
    
    // Profile
    profilePhoto: '',
    
    // System fields
    notes: 'Firebase Authentication User',
    accountStatus: 'active',
    membershipType: 'firebase-auth',
    isPhoneVerified: false,
    
    // User preferences
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
    
    // Import metadata
    importSource: 'firebase-auth',
    importDate: new Date().toISOString(),
    dataVersion: '1.0.0'
  };

  console.log('Auth User Document Structure:');
  console.log(JSON.stringify(authUserDocument, null, 2));

  // To create in Firebase, use the user's UID as document ID:
  // await firestore().collection('users').doc(firebaseUser.uid).set(authUserDocument);
};

// Export for use in other scripts
module.exports = {
  createUserDocumentExample,
  createAuthUserDocumentExample
};

// Run example if this script is executed directly
if (require.main === module) {
  createUserDocumentExample();
  
  // Example Firebase user for auth document creation
  const exampleFirebaseUser = {
    uid: 'UCGhDzMoyZYfLATjwgdHgswrVK73',
    email: 'user@example.com',
    displayName: 'John Doe',
    photoURL: '',
    emailVerified: false,
    phoneNumber: ''
  };
  
  createAuthUserDocumentExample(exampleFirebaseUser);
}