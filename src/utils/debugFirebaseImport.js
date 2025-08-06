/**
 * Debug Firebase Import Utility
 * 
 * Simplified version to test Firebase connectivity and import functionality
 */

import { Platform } from 'react-native';
import { firestore } from '../services/firebase';
import { HANGAR_ROLES, SECURITY_LEVELS } from './userRoles';

/**
 * Simple test to verify Firebase connection
 */
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    console.log('Platform:', Platform.OS);
    
    if (Platform.OS === 'web') {
      const { collection, getDocs } = require('firebase/firestore');
      const testQuery = await getDocs(collection(firestore(), 'users'));
      console.log('Web Firebase connection successful. Users collection size:', testQuery.size);
    } else {
      const testQuery = await firestore().collection('users').get();
      console.log('Native Firebase connection successful. Users collection size:', testQuery.size);
    }
    
    return { success: true, message: 'Firebase connection working' };
  } catch (error) {
    console.error('Firebase connection failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create a single test user document
 */
export const createTestUser = async () => {
  try {
    console.log('Creating test user document...');
    
    const testUser = {
      qbNumber: 'TEST001',
      firstName: 'Test',
      lastName: 'User',
      displayName: 'Test User',
      email: 'test@example.com',
      phone: '407-123-4567',
      role: HANGAR_ROLES.MEMBER,
      status: 'A',
      isActive: true,
      securityLevel: SECURITY_LEVELS[HANGAR_ROLES.MEMBER] || 2,
      membershipType: 'test-import',
      createdAt: new Date().toISOString(),
      createdBy: 'debug-test',
      importSource: 'debug-test'
    };
    
    const docId = `test_${Date.now()}`;
    
    if (Platform.OS === 'web') {
      const { doc, setDoc } = require('firebase/firestore');
      await setDoc(doc(firestore(), 'users', docId), testUser);
    } else {
      await firestore().collection('users').doc(docId).set(testUser);
    }
    
    console.log('Test user created successfully with ID:', docId);
    return { success: true, docId, message: 'Test user created successfully' };
    
  } catch (error) {
    console.error('Test user creation failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Simple roster processing test
 */
export const testRosterProcessing = (rosterData) => {
  try {
    console.log('Testing roster data processing...');
    
    if (!rosterData || !rosterData.members || !Array.isArray(rosterData.members)) {
      throw new Error('Invalid roster data format');
    }
    
    console.log('Total members in roster:', rosterData.members.length);
    
    // Process first member as test
    const firstMember = rosterData.members[0];
    console.log('First member raw data:', firstMember);
    
    // Simple processing
    const processed = {
      qbNumber: firstMember.qbNumber || '',
      name: firstMember.name || '',
      email: firstMember.email || '',
      phone: firstMember.phone || '',
      status: firstMember.status || '',
      nickname: firstMember.nickname || ''
    };
    
    console.log('First member processed:', processed);
    
    return {
      success: true,
      totalMembers: rosterData.members.length,
      sampleProcessed: processed,
      message: 'Roster processing test successful'
    };
    
  } catch (error) {
    console.error('Roster processing test failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Import a single member (simplified)
 */
export const importSingleMember = async (memberData) => {
  try {
    console.log('Importing single member:', memberData.name);
    
    const processedMember = {
      // Basic fields only for testing
      qbNumber: memberData.qbNumber || '',
      firstName: memberData.name?.split(',')[1]?.trim() || '',
      lastName: memberData.name?.split(',')[0]?.trim() || '',
      displayName: memberData.name || '',
      nickname: memberData.nickname || '',
      email: memberData.email || '',
      phone: memberData.phone || '',
      
      // ORLQB fields
      role: HANGAR_ROLES.MEMBER,
      status: memberData.status || 'U',
      isActive: memberData.status === 'A',
      securityLevel: SECURITY_LEVELS[HANGAR_ROLES.MEMBER] || 2,
      
      // Beam status
      beamExpires: memberData.beamExpires || 'Expired',
      beamStatus: (memberData.beamExpires && memberData.beamExpires !== 'Expired') ? 'active' : 'expired',
      
      // System fields
      membershipType: 'roster-import',
      createdAt: new Date().toISOString(),
      createdBy: 'debug-import',
      importSource: 'debug-test',
      dataVersion: '1.0.0'
    };
    
    const docId = `qb_${memberData.qbNumber}`;
    
    if (Platform.OS === 'web') {
      const { doc, setDoc } = require('firebase/firestore');
      await setDoc(doc(firestore(), 'users', docId), processedMember);
    } else {
      await firestore().collection('users').doc(docId).set(processedMember);
    }
    
    console.log('Member imported successfully:', docId);
    return { success: true, docId, member: processedMember };
    
  } catch (error) {
    console.error('Member import failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Run all debug tests
 */
export const runDebugTests = async (rosterData = null) => {
  const results = {
    connectionTest: null,
    testUserCreation: null,
    rosterProcessing: null,
    singleImport: null
  };
  
  try {
    // Test 1: Firebase Connection
    console.log('=== Running Debug Tests ===');
    results.connectionTest = await testFirebaseConnection();
    
    // Test 2: Create Test User
    if (results.connectionTest.success) {
      results.testUserCreation = await createTestUser();
    }
    
    // Test 3: Roster Processing
    if (rosterData) {
      results.rosterProcessing = testRosterProcessing(rosterData);
      
      // Test 4: Single Member Import
      if (results.rosterProcessing.success && rosterData.members.length > 0) {
        results.singleImport = await importSingleMember(rosterData.members[0]);
      }
    }
    
    console.log('=== Debug Test Results ===');
    console.log(JSON.stringify(results, null, 2));
    
    return results;
    
  } catch (error) {
    console.error('Debug tests failed:', error);
    return { ...results, error: error.message };
  }
};

export default {
  testFirebaseConnection,
  createTestUser,
  testRosterProcessing,
  importSingleMember,
  runDebugTests
};