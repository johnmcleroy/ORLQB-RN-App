/**
 * Firebase User Document Service
 * 
 * Handles CRUD operations for ORLQB user documents in Firestore
 * with the complete metadata structure including member information
 */

import { Platform } from 'react-native';
import { auth, firestore } from './firebase';

// Platform-specific Firestore functions
let collection, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, getDocs, addDoc, serverTimestamp;

if (Platform.OS === 'web') {
  const firestoreFunctions = require('firebase/firestore');
  collection = firestoreFunctions.collection;
  doc = firestoreFunctions.doc;
  getDoc = firestoreFunctions.getDoc;
  setDoc = firestoreFunctions.setDoc;
  updateDoc = firestoreFunctions.updateDoc;
  deleteDoc = firestoreFunctions.deleteDoc;
  query = firestoreFunctions.query;
  where = firestoreFunctions.where;
  orderBy = firestoreFunctions.orderBy;
  getDocs = firestoreFunctions.getDocs;
  addDoc = firestoreFunctions.addDoc;
  serverTimestamp = firestoreFunctions.serverTimestamp;
} else {
  // React Native Firebase uses different import pattern
  const firestoreInstance = firestore();
  collection = (db, path) => firestoreInstance.collection(path);
  doc = (db, path, id) => firestoreInstance.collection(path).doc(id);
  getDoc = (docRef) => docRef.get();
  setDoc = (docRef, data, options) => docRef.set(data, options);
  updateDoc = (docRef, data) => docRef.update(data);
  deleteDoc = (docRef) => docRef.delete();
  query = (collectionRef, ...constraints) => collectionRef.where(...constraints);
  where = (field, operator, value) => ({ field, operator, value });
  orderBy = (field, direction = 'asc') => ({ field, direction });
  getDocs = (queryRef) => queryRef.get();
  addDoc = (collectionRef, data) => collectionRef.add(data);
  serverTimestamp = () => firestore.FieldValue.serverTimestamp();
}

/**
 * Creates a new user document with full ORLQB metadata structure
 * @param {string} uid - Firebase Auth UID
 * @param {Object} userData - User data object matching the schema
 * @returns {Promise<void>}
 */
export const createUserDocument = async (uid, userData) => {
  try {
    const db = firestore();
    const userRef = doc(db, 'users', uid);
    
    const defaultUserData = {
      // Core ORLQB member fields
      status: userData.status || 'U', // A=Active, I=Inactive, U=Unknown
      qbNumber: userData.qbNumber || '',
      name: userData.name || '',
      nickname: userData.nickname || '',
      Street: userData.Street || '',
      city: userData.city || '',
      state: userData.state || '',
      email: userData.email || '',
      email2: userData.email2 || '',
      phone: userData.phone || '',
      phone2: userData.phone2 || '',
      beamExpires: userData.beamExpires || '',
      emergencyContact: userData.emergencyContact || '',
      emergencyPhone: userData.emergencyPhone || '',
      emergencyEmail: userData.emergencyEmail || '',
      emerRelationship: userData.emerRelationship || '',
      DateOfBirth: userData.DateOfBirth || '',
      inductingHangar: userData.inductingHangar || '',
      inductingDate: userData.inductingDate || '',
      certificateNumber: userData.certificateNumber || '',
      'certifiedPIC/SoloHours': userData['certifiedPIC/SoloHours'] || '',
      soloDate: userData.soloDate || '',
      soloLocation: userData.soloLocation || '',
      sponsor1: userData.sponsor1 || '',
      sponsor2: userData.sponsor2 || '',
      sponsor3: userData.sponsor3 || '',
      sponsor4: userData.sponsor4 || '',
      sponsor5: userData.sponsor5 || '',
      goneWest: userData.goneWest || '',

      // System compatibility fields
      createdAt: serverTimestamp(),
      displayName: userData.displayName || generateDisplayName(userData.name, userData.nickname),
      hangar: userData.hangar || 'Orlando',
      isActive: userData.status === 'A',
      lastLogin: userData.lastLogin || null,
      role: userData.role || 'member',
      securityLevel: userData.securityLevel || getSecurityLevel(userData.role || 'member'),
      uid: uid,
      updatedAt: serverTimestamp()
    };

    await setDoc(userRef, defaultUserData);
    console.log('User document created successfully:', uid);
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

/**
 * Updates an existing user document
 * @param {string} uid - Firebase Auth UID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateUserDocument = async (uid, updates) => {
  try {
    const db = firestore();
    const userRef = doc(db, 'users', uid);
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // If status is being updated, update isActive accordingly
    if (updates.status) {
      updateData.isActive = updates.status === 'A';
    }

    // If name or nickname is being updated, regenerate displayName
    if (updates.name || updates.nickname) {
      const currentDoc = await getDoc(userRef);
      if (currentDoc.exists()) {
        const currentData = currentDoc.data();
        const name = updates.name || currentData.name;
        const nickname = updates.nickname || currentData.nickname;
        updateData.displayName = generateDisplayName(name, nickname);
      }
    }

    // If role is being updated, update securityLevel
    if (updates.role) {
      updateData.securityLevel = getSecurityLevel(updates.role);
    }

    await updateDoc(userRef, updateData);
    console.log('User document updated successfully:', uid);
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }
};

/**
 * Gets a user document by UID
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<Object|null>} User data or null if not found
 */
export const getUserDocument = async (uid) => {
  try {
    const db = firestore();
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user document:', error);
    throw error;
  }
};

/**
 * Gets all active members
 * @returns {Promise<Array>} Array of active member documents
 */
export const getActiveMembers = async () => {
  try {
    const db = firestore();
    const usersRef = collection(db, 'users');
    
    let queryRef;
    if (Platform.OS === 'web') {
      queryRef = query(usersRef, where('isActive', '==', true), orderBy('name'));
    } else {
      queryRef = usersRef.where('isActive', '==', true).orderBy('name');
    }
    
    const querySnap = await getDocs(queryRef);
    const members = [];
    
    querySnap.forEach((doc) => {
      members.push({ id: doc.id, ...doc.data() });
    });
    
    return members;
  } catch (error) {
    console.error('Error getting active members:', error);
    throw error;
  }
};

/**
 * Gets members by QB number
 * @param {string} qbNumber - QB membership number
 * @returns {Promise<Object|null>} Member document or null if not found
 */
export const getMemberByQBNumber = async (qbNumber) => {
  try {
    const db = firestore();
    const usersRef = collection(db, 'users');
    
    let queryRef;
    if (Platform.OS === 'web') {
      queryRef = query(usersRef, where('qbNumber', '==', qbNumber));
    } else {
      queryRef = usersRef.where('qbNumber', '==', qbNumber);
    }
    
    const querySnap = await getDocs(queryRef);
    
    if (!querySnap.empty) {
      const doc = querySnap.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting member by QB number:', error);
    throw error;
  }
};

/**
 * Updates user's last login timestamp
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<void>}
 */
export const updateLastLogin = async (uid) => {
  try {
    const db = firestore();
    const userRef = doc(db, 'users', uid);
    
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
};

/**
 * Deletes a user document (soft delete by setting status to inactive)
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<void>}
 */
export const deleteUserDocument = async (uid) => {
  try {
    const db = firestore();
    const userRef = doc(db, 'users', uid);
    
    await updateDoc(userRef, {
      status: 'I',
      isActive: false,
      updatedAt: serverTimestamp()
    });
    
    console.log('User document deactivated:', uid);
  } catch (error) {
    console.error('Error deactivating user document:', error);
    throw error;
  }
};

/**
 * Helper function to generate display name from name and nickname
 * @param {string} name - Full name (Last, First format)
 * @param {string} nickname - Nickname or preferred name
 * @returns {string} Formatted display name
 */
const generateDisplayName = (name, nickname) => {
  if (!name) return nickname || '';
  if (!nickname) return name;
  
  // Convert "Last, First" to "First Last" format if needed
  const nameParts = name.includes(',') ? name.split(',').reverse().join(' ').trim() : name;
  return `${nameParts} "${nickname}"`;
};

/**
 * Helper function to get security level based on role
 * @param {string} role - User role
 * @returns {number} Security level (0-4)
 */
const getSecurityLevel = (role) => {
  const roleLevels = {
    'guest': 0,
    'member': 1,
    'leadman': 2,
    'admin': 3,
    'superadmin': 4
  };
  
  return roleLevels[role] || 1;
};

/**
 * Bulk import members from roster data
 * @param {Array} memberData - Array of member objects
 * @returns {Promise<Array>} Array of results with success/error status
 */
export const bulkImportMembers = async (memberData) => {
  const results = [];
  
  for (const member of memberData) {
    try {
      // Generate a document ID if no UID provided
      const db = firestore();
      const usersRef = collection(db, 'users');
      const docRef = await addDoc(usersRef, {
        ...member,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        uid: '', // Empty for roster imports
        lastLogin: null,
        displayName: generateDisplayName(member.name, member.nickname),
        hangar: 'Orlando',
        isActive: member.status === 'A',
        securityLevel: getSecurityLevel(member.role || 'member')
      });
      
      results.push({
        success: true,
        id: docRef.id,
        qbNumber: member.qbNumber,
        name: member.name
      });
    } catch (error) {
      results.push({
        success: false,
        error: error.message,
        qbNumber: member.qbNumber,
        name: member.name
      });
    }
  }
  
  return results;
};