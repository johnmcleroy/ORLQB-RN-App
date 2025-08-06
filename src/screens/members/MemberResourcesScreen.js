/**
 * MemberResourcesScreen - ORLQB Documents and Guidelines
 * 
 * Features:
 * - ORLQB documents and guidelines
 * - Downloadable resources
 * - Quick access to important information
 * - Categorized resource sections
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Linking,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ORLQBPhotos } from '../../constants/images';

const MemberResourcesScreen = ({ navigation }) => {
  const [activeCategory, setActiveCategory] = useState('documents');

  const resourceCategories = [
    { key: 'documents', title: 'Documents', icon: 'document-text-outline' },
    { key: 'guidelines', title: 'Guidelines', icon: 'list-outline' },
    { key: 'forms', title: 'Forms', icon: 'clipboard-outline' },
    { key: 'contacts', title: 'Contacts', icon: 'people-outline' },
  ];

  const resources = {
    documents: [
      {
        id: '1',
        title: 'ORLQB Constitution and Bylaws',
        description: 'Official ORLQB governing documents',
        fileType: 'PDF',
        size: '2.5 MB',
        lastUpdated: '2024-01-15',
        downloadUrl: null,
        category: 'Official Documents'
      },
      {
        id: '2',
        title: 'Meeting Minutes Archive',
        description: 'Historical meeting records and minutes',
        fileType: 'PDF Collection',
        size: 'Various',
        lastUpdated: '2024-03-01',
        downloadUrl: null,
        category: 'Official Documents'
      },
      {
        id: '3',
        title: 'ORLQB Handbook',
        description: 'Complete member handbook and procedures',
        fileType: 'PDF',
        size: '5.2 MB',
        lastUpdated: '2023-12-01',
        downloadUrl: null,
        category: 'Reference Materials'
      }
    ],
    guidelines: [
      {
        id: '4',
        title: 'Safety Procedures',
        description: 'Hangar and aviation safety guidelines',
        fileType: 'PDF',
        size: '1.8 MB',
        lastUpdated: '2024-02-15',
        downloadUrl: null,
        category: 'Safety'
      },
      {
        id: '5',
        title: 'Event Planning Guide',
        description: 'Guidelines for organizing ORLQB events',
        fileType: 'PDF',
        size: '3.1 MB',
        lastUpdated: '2024-01-30',
        downloadUrl: null,
        category: 'Events'
      },
      {
        id: '6',
        title: 'Member Conduct Guidelines',
        description: 'Code of conduct and behavioral expectations',
        fileType: 'PDF',
        size: '1.2 MB',
        lastUpdated: '2023-11-15',
        downloadUrl: null,
        category: 'Member Relations'
      }
    ],
    forms: [
      {
        id: '7',
        title: 'Membership Application',
        description: 'New member application form',
        fileType: 'PDF',
        size: '850 KB',
        lastUpdated: '2024-01-01',
        downloadUrl: null,
        category: 'Membership'
      },
      {
        id: '8',
        title: 'Event Registration Form',
        description: 'Registration form for ORLQB events',
        fileType: 'PDF',
        size: '625 KB',
        lastUpdated: '2024-02-01',
        downloadUrl: null,
        category: 'Events'
      },
      {
        id: '9',
        title: 'Emergency Contact Update',
        description: 'Form to update emergency contact information',
        fileType: 'PDF',
        size: '425 KB',
        lastUpdated: '2024-01-15',
        downloadUrl: null,
        category: 'Member Information'
      }
    ],
    contacts: [
      {
        id: '10',
        title: 'ORLQB Leadership Directory',
        description: 'Contact information for ORLQB leadership',
        phone: '(407) 555-0123',
        email: 'leadership@orlqb.org',
        category: 'Leadership'
      },
      {
        id: '11',
        title: 'Hangar Coordinator',
        description: 'Orlando Executive Airport hangar operations',
        phone: '(407) 555-0124',
        email: 'hangar@orlqb.org',
        category: 'Operations'
      },
      {
        id: '12',
        title: 'Membership Secretary',
        description: 'Membership questions and updates',
        phone: '(407) 555-0125',
        email: 'membership@orlqb.org',
        category: 'Membership'
      },
      {
        id: '13',
        title: 'Safety Officer',
        description: 'Safety concerns and incident reporting',
        phone: '(407) 555-0126',
        email: 'safety@orlqb.org',
        category: 'Safety'
      }
    ]
  };

  const handleResourcePress = (resource) => {
    if (activeCategory === 'contacts') {
      Alert.alert(
        resource.title,
        resource.description,
        [
          {
            text: 'Call',
            onPress: () => Linking.openURL(`tel:${resource.phone}`)
          },
          {
            text: 'Email',
            onPress: () => Linking.openURL(`mailto:${resource.email}`)
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else if (resource.downloadUrl) {
      Linking.openURL(resource.downloadUrl);
    } else {
      Alert.alert(
        'Document Not Available',
        `${resource.title} will be available for download soon.`,
        [{ text: 'OK' }]
      );
    }
  };

  const renderCategoryTabs = () => (
    <View style={styles.categoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {resourceCategories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryTab,
              activeCategory === category.key && styles.activeCategoryTab
            ]}
            onPress={() => setActiveCategory(category.key)}
          >
            <Ionicons
              name={category.icon}
              size={20}
              color={activeCategory === category.key ? '#3880ff' : '#666'}
            />
            <Text style={[
              styles.categoryText,
              activeCategory === category.key && styles.activeCategoryText
            ]}>
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderResourceItem = ({ item }) => {
    const isContact = activeCategory === 'contacts';
    
    return (
      <TouchableOpacity
        style={styles.resourceCard}
        onPress={() => handleResourcePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.resourceHeader}>
          <View style={styles.resourceIcon}>
            <Ionicons
              name={isContact ? 'person' : 'document-text'}
              size={24}
              color="#3880ff"
            />
          </View>
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceTitle}>{item.title}</Text>
            <Text style={styles.resourceDescription}>{item.description}</Text>
            <Text style={styles.resourceCategory}>{item.category}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </View>

        {!isContact && (
          <View style={styles.resourceMeta}>
            <View style={styles.resourceMetaItem}>
              <Ionicons name="document-outline" size={14} color="#666" />
              <Text style={styles.resourceMetaText}>{item.fileType}</Text>
            </View>
            <View style={styles.resourceMetaItem}>
              <Ionicons name="archive-outline" size={14} color="#666" />
              <Text style={styles.resourceMetaText}>{item.size}</Text>
            </View>
            <View style={styles.resourceMetaItem}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.resourceMetaText}>Updated {item.lastUpdated}</Text>
            </View>
          </View>
        )}

        {isContact && (
          <View style={styles.contactActions}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL(`tel:${item.phone}`)}
            >
              <Ionicons name="call" size={16} color="#22c55e" />
              <Text style={styles.contactButtonText}>{item.phone}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL(`mailto:${item.email}`)}
            >
              <Ionicons name="mail" size={16} color="#3880ff" />
              <Text style={styles.contactButtonText}>{item.email}</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const currentResources = resources[activeCategory] || [];

  return (
    <ImageBackground
      source={ORLQBPhotos.HANGAR_INTERIOR}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Member Resources</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Category Tabs */}
      {renderCategoryTabs()}

      {/* Resources List */}
      <FlatList
        data={currentResources}
        renderItem={renderResourceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.7)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 224, 224, 0.7)',
  },
  categoryScroll: {
    paddingHorizontal: 15,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  activeCategoryTab: {
    backgroundColor: 'rgba(56, 128, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#3880ff',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeCategoryText: {
    color: '#3880ff',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  resourceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 15,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 128, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  resourceCategory: {
    fontSize: 12,
    color: '#3880ff',
    fontWeight: '500',
  },
  resourceMeta: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resourceMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resourceMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  contactActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  contactButtonText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
});

export default MemberResourcesScreen;