/**
 * ProfileCard - Reusable Profile Card Component
 * 
 * Displays comprehensive member information from Firebase user documents
 * Used in Member Directory and individual profile views
 */

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MemberPhotos } from '../constants/images';

const ProfileCard = ({ member, onClose, compact = false }) => {
  const memberPhoto = member?.qbNumber ? MemberPhotos.getMemberPhoto(member.qbNumber) : MemberPhotos.DEFAULT_AVATAR;
  
  const formatStatus = (status) => {
    switch (status) {
      case 'A': return 'Active';
      case 'I': return 'Inactive';
      case 'U': return 'Unknown';
      default: return status || 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'A': return '#22c55e';
      case 'I': return '#ef4444';
      case 'U': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const handlePhonePress = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmailPress = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const parseName = (fullName) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const parts = fullName.split(', ');
    return {
      lastName: parts[0] || '',
      firstName: parts[1] || ''
    };
  };

  const { firstName, lastName } = parseName(member?.name);

  if (compact) {
    return (
      <View style={styles.compactCard}>
        <Image source={memberPhoto} style={styles.compactAvatar} />
        <View style={styles.compactInfo}>
          <Text style={styles.compactName}>
            {firstName} {lastName}
          </Text>
          <Text style={styles.compactDetail}>QB #{member?.qbNumber}</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(member?.status) }]} />
            <Text style={styles.statusText}>{formatStatus(member?.status)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#999" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.fullCard}>
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      )}

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={memberPhoto} style={styles.avatar} />
          <View style={styles.avatarBorder} />
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={styles.fullName}>{firstName} {lastName}</Text>
          {member?.nickname && (
            <Text style={styles.nickname}>"{member.nickname}"</Text>
          )}
          
          <View style={styles.qbContainer}>
            <Ionicons name="shield-outline" size={16} color="#FFD700" />
            <Text style={styles.qbNumber}>QB #{member?.qbNumber}</Text>
          </View>
          
          <View style={[styles.statusBadge, styles.headerStatus]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(member?.status) }]} />
            <Text style={styles.statusText}>{formatStatus(member?.status)}</Text>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        {member?.email && (
          <TouchableOpacity style={styles.contactItem} onPress={() => handleEmailPress(member.email)}>
            <Ionicons name="mail-outline" size={20} color="#3880ff" />
            <Text style={styles.contactText}>{member.email}</Text>
            <Ionicons name="open-outline" size={16} color="#999" />
          </TouchableOpacity>
        )}
        
        {member?.email2 && (
          <TouchableOpacity style={styles.contactItem} onPress={() => handleEmailPress(member.email2)}>
            <Ionicons name="mail-outline" size={20} color="#3880ff" />
            <Text style={styles.contactText}>{member.email2}</Text>
            <Text style={styles.contactLabel}>(Secondary)</Text>
          </TouchableOpacity>
        )}
        
        {member?.phone && (
          <TouchableOpacity style={styles.contactItem} onPress={() => handlePhonePress(member.phone)}>
            <Ionicons name="call-outline" size={20} color="#3880ff" />
            <Text style={styles.contactText}>{member.phone}</Text>
            <Ionicons name="open-outline" size={16} color="#999" />
          </TouchableOpacity>
        )}
        
        {member?.phone2 && (
          <TouchableOpacity style={styles.contactItem} onPress={() => handlePhonePress(member.phone2)}>
            <Ionicons name="call-outline" size={20} color="#3880ff" />
            <Text style={styles.contactText}>{member.phone2}</Text>
            <Text style={styles.contactLabel}>(Secondary)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Address Information */}
      {(member?.Street || member?.city || member?.state) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {[member?.Street, member?.city, member?.state].filter(Boolean).join(', ')}
            </Text>
          </View>
        </View>
      )}

      {/* ORLQB Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ORLQB Information</Text>
        
        {member?.inductingHangar && (
          <View style={styles.infoItem}>
            <Ionicons name="business-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{member.inductingHangar}</Text>
            <Text style={styles.infoLabel}>Inducting Hangar</Text>
          </View>
        )}
        
        {member?.inductingDate && (
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{member.inductingDate}</Text>
            <Text style={styles.infoLabel}>Induction Date</Text>
          </View>
        )}
        
        {member?.DateOfBirth && (
          <View style={styles.infoItem}>
            <Ionicons name="gift-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{member.DateOfBirth}</Text>
            <Text style={styles.infoLabel}>Date of Birth</Text>
          </View>
        )}
      </View>

      {/* Aviation Information */}
      {(member?.certificateNumber || member?.['certifiedPIC/SoloHours'] || member?.soloDate) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aviation Information</Text>
          
          {member?.certificateNumber && (
            <View style={styles.infoItem}>
              <Ionicons name="card-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{member.certificateNumber}</Text>
              <Text style={styles.infoLabel}>Certificate Number</Text>
            </View>
          )}
          
          {member?.['certifiedPIC/SoloHours'] && (
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{member['certifiedPIC/SoloHours']} hours</Text>
              <Text style={styles.infoLabel}>PIC/Solo Hours</Text>
            </View>
          )}
          
          {member?.soloDate && (
            <View style={styles.infoItem}>
              <Ionicons name="airplane-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{member.soloDate}</Text>
              <Text style={styles.infoLabel}>Solo Date</Text>
            </View>
          )}
          
          {member?.soloLocation && (
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{member.soloLocation}</Text>
              <Text style={styles.infoLabel}>Solo Location</Text>
            </View>
          )}
        </View>
      )}

      {/* Sponsors */}
      {(member?.sponsor1 || member?.sponsor2 || member?.sponsor3 || member?.sponsor4 || member?.sponsor5) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sponsors</Text>
          {[member?.sponsor1, member?.sponsor2, member?.sponsor3, member?.sponsor4, member?.sponsor5]
            .filter(Boolean)
            .map((sponsor, index) => (
              <View key={index} style={styles.infoItem}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{sponsor}</Text>
              </View>
            ))}
        </View>
      )}

      {/* Emergency Contact */}
      {(member?.emergencyContact || member?.emergencyPhone || member?.emergencyEmail) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          
          {member?.emergencyContact && (
            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{member.emergencyContact}</Text>
              {member?.emerRelationship && (
                <Text style={styles.infoLabel}>({member.emerRelationship})</Text>
              )}
            </View>
          )}
          
          {member?.emergencyPhone && (
            <TouchableOpacity style={styles.contactItem} onPress={() => handlePhonePress(member.emergencyPhone)}>
              <Ionicons name="call-outline" size={20} color="#e74c3c" />
              <Text style={styles.contactText}>{member.emergencyPhone}</Text>
              <Ionicons name="open-outline" size={16} color="#999" />
            </TouchableOpacity>
          )}
          
          {member?.emergencyEmail && (
            <TouchableOpacity style={styles.contactItem} onPress={() => handleEmailPress(member.emergencyEmail)}>
              <Ionicons name="mail-outline" size={20} color="#e74c3c" />
              <Text style={styles.contactText}>{member.emergencyEmail}</Text>
              <Ionicons name="open-outline" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Additional Information */}
      {(member?.beamExpires || member?.goneWest) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          {member?.beamExpires && (
            <View style={styles.infoItem}>
              <Ionicons name="newspaper-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{member.beamExpires}</Text>
              <Text style={styles.infoLabel}>Beam Magazine</Text>
            </View>
          )}
          
          {member?.goneWest && (
            <View style={styles.infoItem}>
              <Ionicons name="ribbon-outline" size={20} color="#666" />
              <Text style={styles.infoText}>{member.goneWest}</Text>
              <Text style={styles.infoLabel}>Gone West</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  compactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  compactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  compactDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  fullCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 15,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 30,
    alignItems: 'center',
    marginTop: 50,
    marginHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  avatarBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  headerInfo: {
    alignItems: 'center',
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  nickname: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  qbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  qbNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  headerStatus: {
    marginTop: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactText: {
    flex: 1,
    fontSize: 16,
    color: '#3880ff',
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
});

export default ProfileCard;