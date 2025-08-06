/**
 * ORLQB Member Data Seeding Utility
 * 
 * Seeds the Firebase Firestore database with processed ORLQB member data
 * from the roster JSON file. Handles batch operations and error recovery.
 */

import { firestore } from '../services/firebase';
import { Platform } from 'react-native';
import { processORLQBRoster, generateFirebaseMembers } from './processORLQBRoster';
import { hasSecurityLevel, HANGAR_ROLES } from './userRoles';

// Sample ORLQB roster data for testing (subset of actual data)
const SAMPLE_ROSTER_DATA = {
  "metadata": {
    "title": "ORL Sign In Roster",
    "extractedDate": "August 5, 2025",
    "totalRecords": 5,
    "statusDistribution": {
      "A": 5,
      "I": 0,
      "U": 0
    }
  },
  "members": [
    {
      "status": "A",
      "qbNumber": "39764",
      "name": "McLeroy, Johnathan",
      "nickname": "JohnnyMac",
      "email": "thecaptain@captainspeak.com",
      "phone": "321-287-3650",
      "beamExpires": "Aug 2026"
    },
    {
      "status": "A",
      "qbNumber": "44937",
      "name": "Andrade, Edison",
      "nickname": "Eddy",
      "email": "eagledriver.zoe@gmail.com",
      "phone": "407-984-0636 (c)",
      "beamExpires": "Sep 2026(eMag only)"
    },
    {
      "status": "A",
      "qbNumber": "28218",
      "name": "Barrett, Joseph",
      "nickname": "Joe",
      "email": "mmbarrett6776@gmail.com",
      "phone": "407-473-7431 (c)",
      "beamExpires": "Expired"
    },
    {
      "status": "A",
      "qbNumber": "46057",
      "name": "Bielecki, Gerald",
      "nickname": "Gerry",
      "email": "gerryb1@bellsouth.net",
      "phone": "772-559-7809 (c)",
      "beamExpires": "Sep 2028"
    },
    {
      "status": "A",
      "qbNumber": "44943",
      "name": "Cartagena, Alfonso",
      "nickname": "Fonz",
      "email": "alfonso@flying-tech.com",
      "phone": "407-690-0506 (c)",
      "beamExpires": "Sep 2026"
    }
  ]
};

/**
 * Batch size for Firestore operations (max 500 per batch)
 */
const BATCH_SIZE = 100;

/**
 * Check if user has permission to seed data
 */
export const canSeedData = (userRole) => {
  return hasSecurityLevel(userRole, 4); // Governor/Historian level required
};

/**
 * Seed member data to Firestore
 */
export const seedMemberData = async (rosterData = null, userRole = '', onProgress = null) => {
  try {
    // Permission check
    if (!canSeedData(userRole)) {
      throw new Error('Insufficient permissions. Governor/Historian level required.');
    }

    // Use provided data or sample data
    const dataToProcess = rosterData || SAMPLE_ROSTER_DATA;
    
    // Process the roster data
    console.log('Processing ORLQB roster data...');
    const processedData = processORLQBRoster(dataToProcess);
    const firebaseMembers = generateFirebaseMembers(processedData);
    
    console.log(`Processed ${processedData.members.length} members for seeding`);
    
    if (onProgress) {
      onProgress({
        stage: 'processing',
        processed: processedData.members.length,
        total: processedData.members.length,
        message: 'Data processed successfully'
      });
    }

    // Convert to array for batch processing
    const memberEntries = Object.entries(firebaseMembers);
    const totalMembers = memberEntries.length;
    let processedCount = 0;
    
    console.log(`Starting batch upload of ${totalMembers} members...`);

    // Process in batches
    for (let i = 0; i < memberEntries.length; i += BATCH_SIZE) {
      const batch = memberEntries.slice(i, i + BATCH_SIZE);
      
      try {
        if (Platform.OS === 'web') {
          // Web Firebase SDK
          const { writeBatch, doc } = require('firebase/firestore');
          const batchWrite = writeBatch(firestore());
          
          batch.forEach(([docId, memberData]) => {
            const memberRef = doc(firestore(), 'users', docId);
            batchWrite.set(memberRef, memberData);
          });
          
          await batchWrite.commit();
          
        } else {
          // React Native Firebase SDK
          const batch_rn = firestore().batch();
          
          batch.forEach(([docId, memberData]) => {
            const memberRef = firestore().collection('users').doc(docId);
            batch_rn.set(memberRef, memberData);
          });
          
          await batch_rn.commit();
        }
        
        processedCount += batch.length;
        
        console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} completed: ${processedCount}/${totalMembers}`);
        
        if (onProgress) {
          onProgress({
            stage: 'uploading',
            processed: processedCount,
            total: totalMembers,
            message: `Uploaded batch ${Math.floor(i / BATCH_SIZE) + 1}`
          });
        }
        
      } catch (batchError) {
        console.error(`Error in batch ${Math.floor(i / BATCH_SIZE) + 1}:`, batchError);
        throw new Error(`Batch upload failed: ${batchError.message}`);
      }
    }
    
    console.log('Member data seeding completed successfully');
    
    // Final progress update
    if (onProgress) {
      onProgress({
        stage: 'completed',
        processed: totalMembers,
        total: totalMembers,
        message: 'All member data uploaded successfully',
        statistics: processedData.statistics
      });
    }
    
    return {
      success: true,
      membersProcessed: totalMembers,
      statistics: processedData.statistics,
      message: 'Member data seeded successfully'
    };
    
  } catch (error) {
    console.error('Error seeding member data:', error);
    
    if (onProgress) {
      onProgress({
        stage: 'error',
        processed: 0,
        total: 0,
        message: error.message,
        error: error
      });
    }
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to seed member data'
    };
  }
};

/**
 * Clear existing member data (use with caution)
 */
export const clearMemberData = async (userRole = '') => {
  try {
    // Permission check - requires Sudo Admin
    if (userRole !== HANGAR_ROLES.SUDO_ADMIN) {
      throw new Error('Insufficient permissions. Sudo Admin level required.');
    }
    
    console.log('Clearing existing member data...');
    
    if (Platform.OS === 'web') {
      // Web Firebase SDK
      const { collection, getDocs, deleteDoc } = require('firebase/firestore');
      const usersSnapshot = await getDocs(collection(firestore(), 'users'));
      
      const deletePromises = [];
      usersSnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
      
    } else {
      // React Native Firebase SDK
      const usersSnapshot = await firestore().collection('users').get();
      
      const batch = firestore().batch();
      usersSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    }
    
    console.log('Member data cleared successfully');
    
    return {
      success: true,
      message: 'Member data cleared successfully'
    };
    
  } catch (error) {
    console.error('Error clearing member data:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to clear member data'
    };
  }
};

/**
 * Update member role assignments
 */
export const updateMemberRoles = async (roleAssignments = [], userRole = '') => {
  try {
    // Permission check
    if (!hasSecurityLevel(userRole, 4)) {
      throw new Error('Insufficient permissions. Governor/Historian level required.');
    }
    
    console.log(`Updating roles for ${roleAssignments.length} members...`);
    
    if (Platform.OS === 'web') {
      // Web Firebase SDK
      const { writeBatch, doc } = require('firebase/firestore');
      const batch = writeBatch(firestore());
      
      roleAssignments.forEach(({ qbNumber, role }) => {
        const docId = `qb_${qbNumber}`;
        const memberRef = doc(firestore(), 'users', docId);
        batch.update(memberRef, { 
          role, 
          updatedAt: new Date().toISOString() 
        });
      });
      
      await batch.commit();
      
    } else {
      // React Native Firebase SDK
      const batch = firestore().batch();
      
      roleAssignments.forEach(({ qbNumber, role }) => {
        const docId = `qb_${qbNumber}`;
        const memberRef = firestore().collection('users').doc(docId);
        batch.update(memberRef, { 
          role, 
          updatedAt: new Date().toISOString() 
        });
      });
      
      await batch.commit();
    }
    
    console.log('Member roles updated successfully');
    
    return {
      success: true,
      updated: roleAssignments.length,
      message: 'Member roles updated successfully'
    };
    
  } catch (error) {
    console.error('Error updating member roles:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to update member roles'
    };
  }
};

/**
 * Verify data integrity after seeding
 */
export const verifyMemberData = async () => {
  try {
    console.log('Verifying member data integrity...');
    
    let usersSnapshot;
    let members = [];
    
    if (Platform.OS === 'web') {
      // Web Firebase SDK
      const { collection, getDocs } = require('firebase/firestore');
      usersSnapshot = await getDocs(collection(firestore(), 'users'));
      usersSnapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() });
      });
    } else {
      // React Native Firebase SDK
      usersSnapshot = await firestore().collection('users').get();
      usersSnapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() });
      });
    }
    
    // Generate verification statistics
    const verification = {
      totalMembers: members.length,
      membersWithEmail: members.filter(m => m.email && m.email.trim() !== '').length,
      membersWithPhone: members.filter(m => m.phone && m.phone.trim() !== '').length,
      activeMembers: members.filter(m => m.isActive).length,
      roleDistribution: members.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {}),
      duplicateQBNumbers: checkForDuplicates(members, 'qbNumber'),
      missingRequiredFields: members.filter(m => 
        !m.qbNumber || !m.firstName || !m.lastName
      ).length
    };
    
    console.log('Data verification completed:', verification);
    
    return {
      success: true,
      verification,
      message: 'Data verification completed'
    };
    
  } catch (error) {
    console.error('Error verifying member data:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to verify member data'
    };
  }
};

/**
 * Helper function to check for duplicates
 */
const checkForDuplicates = (array, field) => {
  const seen = new Set();
  const duplicates = new Set();
  
  array.forEach(item => {
    const value = item[field];
    if (value && seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  });
  
  return Array.from(duplicates);
};

export default {
  seedMemberData,
  clearMemberData,
  updateMemberRoles,
  verifyMemberData,
  canSeedData,
  SAMPLE_ROSTER_DATA
};