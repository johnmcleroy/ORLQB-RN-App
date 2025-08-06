/**
 * ReportsManager - ORLQB Administrative Reporting System
 * 
 * Comprehensive reporting interface for ORLQB leadership documentation:
 * - Attendance Reports: Event participation tracking
 * - Financial Reports: Budget and expense tracking
 * - Meeting Logistics: Planning and execution reports
 * - Meeting Minutes: Official record keeping
 * - Export capabilities and historical data
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  RefreshControl
} from 'react-native';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { hasSecurityLevel } from '../../utils/userRoles';

const ReportsManager = () => {
  const { user, userRole } = useAuth();
  const [reports, setReports] = useState([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeReportType, setActiveReportType] = useState('attendance');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'attendance',
    eventId: '',
    dateRange: {
      start: '',
      end: ''
    },
    content: '',
    attendanceData: [],
    financialData: {
      income: 0,
      expenses: 0,
      balance: 0,
      categories: []
    },
    logisticsData: {
      venue: '',
      capacity: 0,
      setupTime: '',
      resources: [],
      issues: []
    },
    minutesData: {
      meetingType: '',
      chairperson: '',
      attendees: [],
      agenda: [],
      motions: [],
      actionItems: []
    }
  });

  // Report types for ORLQB administrative needs
  const reportTypes = [
    {
      id: 'attendance',
      name: 'Attendance Reports',
      icon: 'people-outline',
      color: '#3880ff',
      description: 'Track member participation across events'
    },
    {
      id: 'financial',
      name: 'Financial Reports',
      icon: 'card-outline',
      color: '#10dc60',
      description: 'Budget tracking and expense reporting'
    },
    {
      id: 'logistics',
      name: 'Meeting Logistics',
      icon: 'settings-outline',
      color: '#ffce00',
      description: 'Event planning and execution details'
    },
    {
      id: 'minutes',
      name: 'Meeting Minutes',
      icon: 'document-text-outline',
      color: '#f04141',
      description: 'Official meeting records and decisions'
    }
  ];

  useEffect(() => {
    if (!user || !hasSecurityLevel(userRole, 3)) {
      setIsLoading(false);
      return;
    }

    loadReports();
  }, [user, userRole]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      if (Platform.OS === 'web') {
        const { collection, getDocs, orderBy, query } = require('firebase/firestore');
        const reportsQuery = query(
          collection(firestore(), 'reports'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(reportsQuery);
        const reportsData = [];
        snapshot.forEach((doc) => {
          reportsData.push({ id: doc.id, ...doc.data() });
        });
        setReports(reportsData);
      } else {
        const snapshot = await firestore()
          .collection('reports')
          .orderBy('createdAt', 'desc')
          .get();
        
        const reportsData = [];
        snapshot.forEach((doc) => {
          reportsData.push({ id: doc.id, ...doc.data() });
        });
        setReports(reportsData);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadReports().finally(() => {
      setRefreshing(false);
    });
  }, []);

  const openReportForm = (report = null, type = 'attendance') => {
    if (report) {
      setSelectedReport(report);
      setFormData(report);
    } else {
      setSelectedReport(null);
      setFormData({
        title: '',
        type: type,
        eventId: '',
        dateRange: {
          start: new Date().toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        content: '',
        attendanceData: [],
        financialData: {
          income: 0,
          expenses: 0,
          balance: 0,
          categories: []
        },
        logisticsData: {
          venue: '',
          capacity: 0,
          setupTime: '',
          resources: [],
          issues: []
        },
        minutesData: {
          meetingType: '',
          chairperson: '',
          attendees: [],
          agenda: [],
          motions: [],
          actionItems: []
        }
      });
    }
    setShowReportForm(true);
  };

  const saveReport = async () => {
    if (!formData.title || !formData.type) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    if (!hasSecurityLevel(userRole, 3)) {
      Alert.alert('Access Denied', 'Leadership privileges required');
      return;
    }

    const reportData = {
      ...formData,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || 'Unknown'
    };

    if (!selectedReport) {
      reportData.createdAt = new Date().toISOString();
      reportData.createdBy = user?.email || 'Unknown';
    }

    try {
      if (Platform.OS === 'web') {
        const { doc, updateDoc, addDoc, collection } = require('firebase/firestore');
        if (selectedReport) {
          const reportRef = doc(firestore(), 'reports', selectedReport.id);
          await updateDoc(reportRef, reportData);
          Alert.alert('Success', 'Report updated successfully');
        } else {
          await addDoc(collection(firestore(), 'reports'), reportData);
          Alert.alert('Success', 'Report created successfully');
        }
      } else {
        const reportsCollection = firestore().collection('reports');
        if (selectedReport) {
          await reportsCollection.doc(selectedReport.id).update(reportData);
          Alert.alert('Success', 'Report updated successfully');
        } else {
          await reportsCollection.add(reportData);
          Alert.alert('Success', 'Report created successfully');
        }
      }

      setShowReportForm(false);
      loadReports();
    } catch (error) {
      console.error('Error saving report:', error);
      Alert.alert('Error', 'Failed to save report');
    }
  };

  const generateAttendanceReport = async () => {
    // This would integrate with the attendance data from events
    Alert.alert(
      'Generate Attendance Report',
      'This will create a comprehensive attendance report for the selected date range.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Generate', onPress: () => openReportForm(null, 'attendance') }
      ]
    );
  };

  const exportReport = (report) => {
    Alert.alert(
      'Export Report',
      `Export "${report.title}" as PDF or CSV?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'PDF', onPress: () => Alert.alert('Coming Soon', 'PDF export functionality') },
        { text: 'CSV', onPress: () => Alert.alert('Coming Soon', 'CSV export functionality') }
      ]
    );
  };

  const filteredReports = reports.filter(report => 
    activeReportType === 'all' || report.type === activeReportType
  );

  const getReportTypeInfo = (type) => {
    return reportTypes.find(t => t.id === type) || reportTypes[0];
  };

  const renderReportCard = ({ item }) => {
    const typeInfo = getReportTypeInfo(item.type);
    
    return (
      <TouchableOpacity 
        style={styles.reportCard}
        onPress={() => openReportForm(item)}
      >
        <View style={styles.reportHeader}>
          <View style={[styles.reportIcon, { backgroundColor: typeInfo.color }]}>
            <Ionicons name={typeInfo.icon} size={20} color="white" />
          </View>
          
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>{item.title}</Text>
            <Text style={styles.reportType}>{typeInfo.name}</Text>
            <Text style={styles.reportDate}>
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.reportActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => exportReport(item)}
            >
              <Ionicons name="download-outline" size={18} color="#3880ff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.reportPreview}>
          {item.type === 'attendance' && (
            <Text style={styles.previewText}>
              Attendance: {item.attendanceData?.length || 0} members tracked
            </Text>
          )}
          {item.type === 'financial' && (
            <Text style={styles.previewText}>
              Balance: ${item.financialData?.balance || 0}
            </Text>
          )}
          {item.type === 'logistics' && (
            <Text style={styles.previewText}>
              Venue: {item.logisticsData?.venue || 'Not specified'}
            </Text>
          )}
          {item.type === 'minutes' && (
            <Text style={styles.previewText}>
              Meeting: {item.minutesData?.meetingType || 'General Meeting'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderReportTypeCard = (reportType) => (
    <TouchableOpacity
      key={reportType.id}
      style={styles.reportTypeCard}
      onPress={() => openReportForm(null, reportType.id)}
    >
      <View style={[styles.reportTypeIcon, { backgroundColor: reportType.color }]}>
        <Ionicons name={reportType.icon} size={32} color="white" />
      </View>
      <Text style={styles.reportTypeName}>{reportType.name}</Text>
      <Text style={styles.reportTypeDescription}>{reportType.description}</Text>
      
      <View style={styles.reportTypeStats}>
        <Text style={[styles.reportTypeCount, { color: reportType.color }]}>
          {reports.filter(r => r.type === reportType.id).length}
        </Text>
        <Text style={styles.reportTypeLabel}>Reports</Text>
      </View>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsList}>
        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: '#3880ff' }]}
          onPress={generateAttendanceReport}
        >
          <Ionicons name="analytics-outline" size={24} color="white" />
          <Text style={styles.quickActionText}>Generate Attendance Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: '#10dc60' }]}
          onPress={() => openReportForm(null, 'financial')}
        >
          <Ionicons name="card-outline" size={24} color="white" />
          <Text style={styles.quickActionText}>New Financial Report</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionCard, { backgroundColor: '#f04141' }]}
          onPress={() => openReportForm(null, 'minutes')}
        >
          <Ionicons name="document-text-outline" size={24} color="white" />
          <Text style={styles.quickActionText}>Meeting Minutes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderBasicReportForm = () => (
    <Modal
      visible={showReportForm}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowReportForm(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {selectedReport ? 'Edit Report' : 'Create New Report'}
          </Text>
          <TouchableOpacity onPress={() => setShowReportForm(false)}>
            <Ionicons name="close-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer}>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Report Title *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter report title"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Report Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
              {reportTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeOption,
                    { borderColor: type.color },
                    formData.type === type.id && { backgroundColor: type.color }
                  ]}
                  onPress={() => setFormData({ ...formData, type: type.id })}
                >
                  <Ionicons 
                    name={type.icon} 
                    size={16} 
                    color={formData.type === type.id ? 'white' : type.color} 
                  />
                  <Text style={[
                    styles.typeOptionText,
                    { color: formData.type === type.id ? 'white' : type.color }
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formField, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.fieldLabel}>Start Date</Text>
              <TextInput
                style={styles.textInput}
                value={formData.dateRange?.start || ''}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  dateRange: { ...formData.dateRange, start: text }
                })}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={[styles.formField, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.fieldLabel}>End Date</Text>
              <TextInput
                style={styles.textInput}
                value={formData.dateRange?.end || ''}
                onChangeText={(text) => setFormData({ 
                  ...formData, 
                  dateRange: { ...formData.dateRange, end: text }
                })}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Report Content</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => setFormData({ ...formData, content: text })}
              placeholder={`Enter ${getReportTypeInfo(formData.type).name.toLowerCase()} details...`}
              multiline
              numberOfLines={10}
            />
          </View>

          {/* Type-specific forms would go here in a full implementation */}
          {formData.type === 'minutes' && (
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Meeting Minutes Details</Text>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Meeting Type</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.minutesData?.meetingType || ''}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    minutesData: { ...formData.minutesData, meetingType: text }
                  })}
                  placeholder="Monthly Meeting, Wing Ding, etc."
                />
              </View>
              
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Chairperson</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.minutesData?.chairperson || ''}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    minutesData: { ...formData.minutesData, chairperson: text }
                  })}
                  placeholder="Meeting chairperson name"
                />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowReportForm(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={saveReport}>
            <Text style={styles.saveButtonText}>
              {selectedReport ? 'Update Report' : 'Create Report'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (!hasSecurityLevel(userRole, 3)) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="shield-outline" size={48} color="#666" />
        <Text style={styles.errorText}>Leadership Access Required</Text>
        <Text style={styles.errorSubtext}>Level 3+ Leadmen privileges needed</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ORLQB Reports</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => openReportForm()}
        >
          <Ionicons name="document-attach-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderQuickActions()}

        <View style={styles.reportTypesSection}>
          <Text style={styles.sectionTitle}>Report Types</Text>
          <View style={styles.reportTypesGrid}>
            {reportTypes.map(renderReportTypeCard)}
          </View>
        </View>

        <View style={styles.recentReportsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reportFilters}>
              <TouchableOpacity
                style={[styles.filterButton, activeReportType === 'all' && styles.filterButtonActive]}
                onPress={() => setActiveReportType('all')}
              >
                <Text style={[styles.filterText, activeReportType === 'all' && styles.filterTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              
              {reportTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.filterButton, 
                    activeReportType === type.id && styles.filterButtonActive
                  ]}
                  onPress={() => setActiveReportType(type.id)}
                >
                  <Text style={[
                    styles.filterText, 
                    activeReportType === type.id && styles.filterTextActive
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {filteredReports.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No reports found</Text>
              <Text style={styles.emptySubtext}>Create your first report to get started</Text>
            </View>
          ) : (
            <FlatList
              data={filteredReports}
              renderItem={renderReportCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>

      {renderBasicReportForm()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#3880ff',
    padding: 10,
    borderRadius: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActionsSection: {
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  quickActionsList: {
    flexDirection: 'row',
  },
  quickActionCard: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 15,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  reportTypesSection: {
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  reportTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  reportTypeCard: {
    width: '47%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reportTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportTypeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  reportTypeDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  reportTypeStats: {
    alignItems: 'center',
  },
  reportTypeCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reportTypeLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  recentReportsSection: {
    padding: 15,
    backgroundColor: 'white',
  },
  sectionHeader: {
    marginBottom: 15,
  },
  reportFilters: {
    flexDirection: 'row',
    marginTop: 10,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3880ff',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: 'white',
  },
  reportCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  reportType: {
    fontSize: 12,
    color: '#3880ff',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 11,
    color: '#666',
  },
  reportActions: {
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  reportPreview: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  previewText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 5,
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 30,
  },
  formField: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 10,
    gap: 4,
  },
  typeOptionText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3880ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReportsManager;