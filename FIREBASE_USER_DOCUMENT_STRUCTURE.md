# Firebase Users Document Structure

This document outlines the simplified structure of user documents in the Firebase `users` collection, containing **only** the essential ORLQB roster metadata fields plus the existing system compatibility fields.

## Document Structure Overview

Each user document in the `users` collection contains exactly **38 fields**:
- **29 roster metadata fields** (from the ORLQB JSON)  
- **9 system compatibility fields** (for app functionality)

Structure:

```javascript
{
  // === ROSTER METADATA FIELDS (29 fields from ORLQB JSON) ===
  "status": "string",                 // Member status (A=Active, I=Inactive, U=Unknown)
  "qbNumber": "string",               // QB membership number
  "name": "string",                   // Full name (Last, First format)
  "nickname": "string",               // Nickname or preferred name
  "Street": "string",                 // Street address
  "city": "string",                   // City of residence
  "state": "string",                  // State of residence
  "email": "string",                  // Email address
  "email2": "string",                 // Secondary email address (if applicable)
  "phone": "string",                  // Primary phone number
  "phone2": "string",                 // Secondary phone number (if applicable)
  "beamExpires": "string",            // Beam magazine expiration status/date
  "emergencyContact": "string",       // Emergency contact name
  "emergencyPhone": "string",         // Emergency contact phone number
  "emergencyEmail": "string",         // Emergency contact email address
  "emerRelationship": "string",       // Relationship to emergency contact
  "DateOfBirth": "string",            // Date of birth (MM/DD/YYYY)
  "inductingHangar": "string",        // Hanger where the member was inducted
  "inductingDate": "string",          // Date of induction into the ORL (MM/DD/YYYY)
  "certificateNumber": "string",      // Certificate number (if applicable)
  "certifiedPIC/SoloHours": "string", // Total hours as Pilot in Command or solo (if applicable)
  "soloDate": "string",               // Date of first solo flight (if applicable, MM/DD/YYYY)
  "soloLocation": "string",           // Location of first solo flight (if applicable)
  "sponsor1": "string",               // First sponsor's name (Last, First qbNumber)
  "sponsor2": "string",               // Second sponsor's name (Last, First qbNumber)
  "sponsor3": "string",               // Third sponsor's name (Last, First qbNumber)
  "sponsor4": "string",               // Fourth sponsor's name (Last, First qbNumber)
  "sponsor5": "string",               // Fifth sponsor's name (Last, First qbNumber)
  "goneWest": "string",               // Date the member went west (if applicable, MM/DD/YYYY)

  // === SYSTEM COMPATIBILITY FIELDS (9 fields for app functionality) ===
  "createdAt": "timestamp",           // Document creation timestamp
  "displayName": "string",            // Formatted display name (e.g., "Johnathan \"JohnnyMac\" McLeroy")
  "hangar": "string",                 // Hangar location (always "Orlando")
  "isActive": boolean,                // Derived from status field (status === 'A')
  "lastLogin": "timestamp",           // Last login timestamp (empty for roster imports)
  "role": "string",                   // ORLQB role (member, guest, etc.)
  "securityLevel": number,            // Security level 0-4 based on role
  "uid": "string",                    // Firebase Auth UID (empty for roster imports)
  "updatedAt": "timestamp"            // Last update timestamp
}
```

## Sample Document Example

Here's an example of a complete user document with all fields populated:

```javascript
{
  "uid": "",
  "qbNumber": "39764",
  "firstName": "Johnathan",
  "lastName": "McLeroy",
  "fullName": "McLeroy, Johnathan",
  "displayName": "Johnathan \"JohnnyMac\" McLeroy",
  "nickname": "JohnnyMac",
  
  "email": "thecaptain@captainspeak.com",
  "email2": "admin@orlqb.org",
  "phone": "321-287-3650",
  "phone2": "",
  
  "address": "4929 Spiral Way",
  "street": "",
  "city": "Saint Cloud",
  "state": "FL",
  
  "emergencyContact": "Robinette",
  "emergencyPhone": "321-438-6180",
  "emergencyEmail": "r@robintettemcleroy.com",
  "emergencyRelationship": "Spouse",
  
  "role": "Admin",
  "status": "A",
  "isActive": true,
  "securityLevel": 4,
  "permissions": [],
  
  "dateOfBirth": "06/08/1962",
  "inductingHangar": "Orlando Hangar",
  "inductionDate": "",
  "joinDate": "",
  
  "certificateNumber": "",
  "pilotHours": "",
  "certifiedPIC/SoloHours": "",
  "soloDate": "",
  "soloLocation": "",
  
  "sponsors": [],
  "sponsor1": "Tex Aaron",
  "sponsor2": "",
  "sponsor3": "",
  "sponsor4": "",
  "sponsor5": "",
  
  "beamExpires": "Aug 2026",
  "beamStatus": "active",
  
  "goneWest": false,
  
  "photoURL": "",
  "profilePhoto": "",
  "isEmailVerified": false,
  
  "notes": "QB Number: 39764 • Nickname: JohnnyMac",
  "accountStatus": "active",
  "membershipType": "roster-import",
  "isPhoneVerified": false,
  
  "preferences": {
    "notifications": true,
    "emailUpdates": true,
    "privacy": "members-only"
  },
  
  "createdAt": "2025-08-06T20:30:00.000Z",
  "createdBy": "roster-import",
  "updatedAt": "2025-08-06T20:30:00.000Z",
  "updatedBy": "roster-import",
  "lastLoginAt": "",
  
  "importSource": "orl_roster_json",
  "importDate": "2025-08-06T20:30:00.000Z",
  "dataVersion": "1.0.0"
}
```

## Document ID Structure

Documents will be created with the following ID patterns:

- **Roster Members**: `qb_{qbNumber}` (e.g., `qb_39764`)
- **Firebase Auth Users**: `{uid}` (e.g., `UCGhDzMoyZYfLATjwgdHgswrVK73`)
- **Merged Users**: Keep original auth UID, merge roster data

## Field Compatibility Matrix

| Field Type | Roster Import | Firebase Auth | Merged User |
|------------|---------------|---------------|-------------|
| qbNumber | ✓ (from roster) | ✗ (empty) | ✓ (from roster) |
| uid | ✗ (empty) | ✓ (from auth) | ✓ (from auth) |
| email | ✓ (roster email) | ✓ (auth email) | ✓ (prefer auth) |
| role | ✓ (determined) | ✓ (assigned) | ✓ (from roster) |
| All roster fields | ✓ (complete) | ✗ (empty) | ✓ (complete) |
| Auth fields | ✗ (default) | ✓ (from auth) | ✓ (from auth) |

## Implementation Steps

1. **Use the MemberDataImporter** in the app to import roster data
2. **Documents will be automatically created** with this exact structure
3. **Existing Firebase Auth users** remain unchanged
4. **Future merging** can be done using the provided utility functions

This structure ensures complete metadata preservation while maintaining full compatibility with existing Firebase Auth users.