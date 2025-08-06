/**
 * MemberDataImporter - ORLQB Member Data Import Interface
 * 
 * Administrative component for importing ORLQB roster data into the member
 * management system. Processes JSON roster files and seeds Firestore database.
 * 
 * Features:
 * - Import roster JSON files
 * - Process member data with all metadata fields
 * - Batch upload to Firestore
 * - Progress tracking and error handling
 * - Data verification and statistics
 * - Role assignment interface
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { hasSecurityLevel, HANGAR_ROLES, getRoleDisplayName } from '../../utils/userRoles';
import { 
  seedMemberData, 
  clearMemberData, 
  updateMemberRoles, 
  verifyMemberData,
  canSeedData,
  SAMPLE_ROSTER_DATA 
} from '../../utils/seedMemberData';
import { processORLQBRoster } from '../../utils/processORLQBRoster';

const MemberDataImporter = ({ visible, onClose }) => {
  const { user, userRole } = useAuth();
  const [importProgress, setImportProgress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rosterData, setRosterData] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importStats, setImportStats] = useState(null);

  const handleJsonInput = () => {
    try {
      if (!jsonInput.trim()) {
        Alert.alert('Error', 'Please paste the ORLQB roster JSON data');
        return;
      }

      const parsedData = JSON.parse(jsonInput);
      
      if (!parsedData.members || !Array.isArray(parsedData.members)) {
        Alert.alert('Error', 'Invalid roster format. Expected JSON with members array.');
        return;
      }

      setRosterData(parsedData);
      
      // Process data for preview
      const processed = processORLQBRoster(parsedData);
      setProcessedData(processed);
      
      Alert.alert(
        'Roster Data Loaded',
        `Successfully loaded ${processed.members.length} members from roster.\n\nActive: ${processed.statistics.activeMembers}\nInactive: ${processed.statistics.inactiveMembers}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      Alert.alert('Error', `Failed to parse JSON data: ${error.message}`);
    }
  };

  const handleUseSampleData = () => {
    Alert.alert(
      'Use Sample Data',
      'This will load sample ORLQB member data for testing. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load Sample',
          onPress: () => {
            setRosterData(SAMPLE_ROSTER_DATA);
            const processed = processORLQBRoster(SAMPLE_ROSTER_DATA);
            setProcessedData(processed);
            Alert.alert('Sample Data Loaded', `Loaded ${processed.members.length} sample members`);
          }
        }
      ]
    );
  };

  const handleImportData = async () => {
    if (!rosterData) {
      Alert.alert('Error', 'Please load roster data first');
      return;
    }

    if (!canSeedData(userRole)) {
      Alert.alert('Access Denied', 'Governor/Historian level required for data import');
      return;
    }

    Alert.alert(
      'Import Member Data',
      `This will import ${processedData?.members.length || 0} members into the database. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          style: 'destructive',
          onPress: performImport
        }
      ]
    );
  };

  const performImport = async () => {
    setIsProcessing(true);
    setImportProgress(null);

    try {
      const result = await seedMemberData(
        rosterData,
        userRole,
        (progress) => {
          setImportProgress(progress);
        }
      );

      setImportStats(result);

      if (result.success) {
        Alert.alert(
          'Import Successful',
          `Successfully imported ${result.membersProcessed} members to the database.`,
          [
            {
              text: 'Verify Data',
              onPress: handleVerifyData
            },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('Import Failed', result.message || 'Unknown error occurred');
      }
    } catch (error) {
      Alert.alert('Import Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyData = async () => {
    setIsProcessing(true);
    
    try {
      const result = await verifyMemberData();
      
      if (result.success) {
        const verification = result.verification;
        Alert.alert(
          'Data Verification',
          `Total Members: ${verification.totalMembers}\n` +
          `Active Members: ${verification.activeMembers}\n` +
          `With Email: ${verification.membersWithEmail}\n` +
          `With Phone: ${verification.membersWithPhone}\n` +
          `Missing Required Fields: ${verification.missingRequiredFields}\n` +
          `Duplicate QB Numbers: ${verification.duplicateQBNumbers.length}`
        );
      } else {
        Alert.alert('Verification Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Verification Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      '⚠️ DANGER: Clear All Data',
      'This will permanently delete ALL member data from the database. This action cannot be undone!\n\nSudo Admin access required.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'CLEAR ALL DATA',
          style: 'destructive',
          onPress: performClearData
        }
      ]
    );
  };

  const performClearData = async () => {
    setIsProcessing(true);
    
    try {
      const result = await clearMemberData(userRole);
      
      if (result.success) {
        Alert.alert('Data Cleared', 'All member data has been removed from the database.');
      } else {
        Alert.alert('Clear Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Clear Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderProgressBar = () => {
    if (!importProgress) return null;

    const percentage = importProgress.total > 0 
      ? Math.round((importProgress.processed / importProgress.total) * 100) 
      : 0;

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {importProgress.message}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.progressStats}>
          {importProgress.processed} / {importProgress.total} ({percentage}%)
        </Text>
      </View>
    );
  };

  const renderDataPreview = () => {
    if (!processedData) return null;

    const stats = processedData.statistics;

    return (
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Data Preview</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalMembers}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#10dc60' }]}>{stats.activeMembers}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#f04141' }]}>{stats.inactiveMembers}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#3880ff' }]}>{stats.membersWithEmail}</Text>
            <Text style={styles.statLabel}>With Email</Text>
          </View>
        </View>

        <View style={styles.beamStats}>
          <Text style={styles.beamTitle}>Beam Subscriptions</Text>
          <Text style={styles.beamStat}>Active: {stats.beamSubscriptions.active}</Text>
          <Text style={styles.beamStat}>Expired: {stats.beamSubscriptions.expired}</Text>
          <Text style={styles.beamStat}>Comp Life: {stats.beamSubscriptions.compLife}</Text>
        </View>

        <View style={styles.sampleMembers}>
          <Text style={styles.sampleTitle}>Sample Members (First 3)</Text>
          {processedData.members.slice(0, 3).map((member, index) => (
            <View key={index} style={styles.sampleMember}>
              <Text style={styles.memberName}>{member.displayName}</Text>
              <Text style={styles.memberDetails}>
                QB #{member.qbNumber} • {getRoleDisplayName(member.role)}
              </Text>
              <Text style={styles.memberContact}>{member.email}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (!hasSecurityLevel(userRole, 3)) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Access Denied</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.centerContent}>
            <Ionicons name="shield-outline" size={64} color="#666" />
            <Text style={styles.errorText}>Leadership Access Required</Text>
            <Text style={styles.errorSubtext}>Level 3+ Leadmen privileges needed</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>ORLQB Member Data Import</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* JSON Input Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Load Roster Data</Text>
            
            <TextInput
              style={styles.jsonInput}
              multiline
              placeholder="Paste ORLQB roster JSON data here..."
              value={jsonInput}
              onChangeText={setJsonInput}
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]}
                onPress={handleJsonInput}
              >
                <Ionicons name="document-text-outline" size={16} color="white" />
                <Text style={styles.buttonText}>Parse JSON</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]}
                onPress={handleUseSampleData}
              >
                <Ionicons name="flask-outline" size={16} color="#3880ff" />
                <Text style={[styles.buttonText, { color: '#3880ff' }]}>Use Sample</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Data Preview */}
          {renderDataPreview()}

          {/* Import Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Import to Database</Text>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.importButton,
                (!rosterData || isProcessing) && styles.disabledButton
              ]}
              onPress={handleImportData}
              disabled={!rosterData || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="cloud-upload-outline" size={16} color="white" />
              )}
              <Text style={styles.buttonText}>
                {isProcessing ? 'Importing...' : 'Import Member Data'}
              </Text>
            </TouchableOpacity>

            {renderProgressBar()}
          </View>

          {/* Verification Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Data Management</Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.verifyButton]}
                onPress={handleVerifyData}
                disabled={isProcessing}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                <Text style={styles.buttonText}>Verify Data</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.dangerButton]}
                onPress={handleClearData}
                disabled={isProcessing}
              >
                <Ionicons name="trash-outline" size={16} color="white" />
                <Text style={styles.buttonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Import Statistics */}
          {importStats && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Import Results</Text>
              <View style={styles.resultsContainer}>
                <Text style={styles.resultText}>
                  Status: {importStats.success ? '✅ Success' : '❌ Failed'}
                </Text>
                {importStats.membersProcessed && (
                  <Text style={styles.resultText}>
                    Members Processed: {importStats.membersProcessed}
                  </Text>
                )}
                <Text style={styles.resultText}>
                  Message: {importStats.message}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  jsonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 120,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#3880ff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3880ff',
  },
  importButton: {
    backgroundColor: '#10dc60',
    justifyContent: 'center',
  },
  verifyButton: {
    backgroundColor: '#ffce00',
  },
  dangerButton: {
    backgroundColor: '#f04141',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10dc60',
    borderRadius: 4,
  },
  progressStats: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  previewContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  beamStats: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
  beamTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  beamStat: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  sampleMembers: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
  },
  sampleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sampleMember: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  memberDetails: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  memberContact: {
    fontSize: 11,
    color: '#3880ff',
    marginTop: 2,
  },
  resultsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MemberDataImporter;