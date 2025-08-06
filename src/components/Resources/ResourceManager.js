/**
 * ResourceManager - ORLQB Hangar Inventory Management
 * 
 * Administrative interface for tracking Hangar resources and supplies:
 * - Food, Beverages, Snacks inventory
 * - Chairs, Tables, Equipment tracking
 * - Audio, Video equipment management
 * - Signage and promotional materials
 * - Supply requests and procurement tracking
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
  Switch,
  RefreshControl
} from 'react-native';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { firestore } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { hasSecurityLevel } from '../../utils/userRoles';

const ResourceManager = () => {
  const { user, userRole } = useAuth();
  const [resources, setResources] = useState([]);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'food_beverage',
    currentStock: 0,
    minStockLevel: 5,
    maxStockLevel: 50,
    unit: 'items',
    location: '',
    supplier: '',
    lastRestocked: '',
    notes: '',
    isActive: true,
    needsReorder: false
  });

  // Resource categories with ORLQB-specific inventory
  const resourceCategories = [
    {
      id: 'food_beverage',
      name: 'Food & Beverages',
      icon: 'restaurant-outline',
      color: '#10dc60',
      items: ['Coffee', 'Tea', 'Water', 'Snacks', 'Appetizers', 'Main Course Items']
    },
    {
      id: 'furniture',
      name: 'Furniture & Setup',
      icon: 'business-outline',
      color: '#3880ff',
      items: ['Chairs', 'Tables', 'Podium', 'Display Stands', 'Staging']
    },
    {
      id: 'av_equipment',
      name: 'Audio/Video',
      icon: 'videocam-outline',
      color: '#ffce00',
      items: ['Microphones', 'Speakers', 'Projectors', 'Cables', 'Lighting']
    },
    {
      id: 'signage',
      name: 'Signage & Materials',
      icon: 'reader-outline',
      color: '#f04141',
      items: ['Banners', 'Signs', 'Programs', 'Certificates', 'Name Tags']
    },
    {
      id: 'ceremonial',
      name: 'Ceremonial Items',
      icon: 'ribbon-outline',
      color: '#7044ff',
      items: ['Robes', 'Ceremonial Items', 'Decorations', 'Awards', 'Memorabilia']
    },
    {
      id: 'supplies',
      name: 'General Supplies',
      icon: 'cube-outline',
      color: '#ff8c00',
      items: ['Paper Goods', 'Cleaning Supplies', 'Office Supplies', 'Tools', 'Storage']
    }
  ];

  useEffect(() => {
    if (!user || !hasSecurityLevel(userRole, 3)) {
      setIsLoading(false);
      return;
    }

    loadResources();
  }, [user, userRole]);

  const loadResources = async () => {
    setIsLoading(true);
    try {
      if (Platform.OS === 'web') {
        const { collection, getDocs, orderBy, query } = require('firebase/firestore');
        const resourcesQuery = query(
          collection(firestore(), 'resources'),
          orderBy('name', 'asc')
        );
        const snapshot = await getDocs(resourcesQuery);
        const resourcesData = [];
        snapshot.forEach((doc) => {
          resourcesData.push({ id: doc.id, ...doc.data() });
        });
        setResources(resourcesData);
      } else {
        const snapshot = await firestore()
          .collection('resources')
          .orderBy('name', 'asc')
          .get();
        
        const resourcesData = [];
        snapshot.forEach((doc) => {
          resourcesData.push({ id: doc.id, ...doc.data() });
        });
        setResources(resourcesData);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      Alert.alert('Error', 'Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadResources().finally(() => {
      setRefreshing(false);
    });
  }, []);

  const openResourceForm = (resource = null) => {
    if (resource) {
      setSelectedResource(resource);
      setFormData({
        name: resource.name || '',
        category: resource.category || 'food_beverage',
        currentStock: resource.currentStock || 0,
        minStockLevel: resource.minStockLevel || 5,
        maxStockLevel: resource.maxStockLevel || 50,
        unit: resource.unit || 'items',
        location: resource.location || '',
        supplier: resource.supplier || '',
        lastRestocked: resource.lastRestocked || '',
        notes: resource.notes || '',
        isActive: resource.isActive !== false,
        needsReorder: resource.needsReorder || false
      });
    } else {
      setSelectedResource(null);
      setFormData({
        name: '',
        category: 'food_beverage',
        currentStock: 0,
        minStockLevel: 5,
        maxStockLevel: 50,
        unit: 'items',
        location: '',
        supplier: '',
        lastRestocked: new Date().toISOString().split('T')[0],
        notes: '',
        isActive: true,
        needsReorder: false
      });
    }
    setShowResourceForm(true);
  };

  const saveResource = async () => {
    if (!formData.name || !formData.category) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    if (!hasSecurityLevel(userRole, 3)) {
      Alert.alert('Access Denied', 'Leadership privileges required');
      return;
    }

    const resourceData = {
      ...formData,
      currentStock: parseInt(formData.currentStock) || 0,
      minStockLevel: parseInt(formData.minStockLevel) || 5,
      maxStockLevel: parseInt(formData.maxStockLevel) || 50,
      needsReorder: parseInt(formData.currentStock) <= parseInt(formData.minStockLevel),
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || 'Unknown'
    };

    if (!selectedResource) {
      resourceData.createdAt = new Date().toISOString();
      resourceData.createdBy = user?.email || 'Unknown';
    }

    try {
      if (Platform.OS === 'web') {
        const { doc, updateDoc, addDoc, collection } = require('firebase/firestore');
        if (selectedResource) {
          const resourceRef = doc(firestore(), 'resources', selectedResource.id);
          await updateDoc(resourceRef, resourceData);
          Alert.alert('Success', 'Resource updated successfully');
        } else {
          await addDoc(collection(firestore(), 'resources'), resourceData);
          Alert.alert('Success', 'Resource added successfully');
        }
      } else {
        const resourcesCollection = firestore().collection('resources');
        if (selectedResource) {
          await resourcesCollection.doc(selectedResource.id).update(resourceData);
          Alert.alert('Success', 'Resource updated successfully');
        } else {
          await resourcesCollection.add(resourceData);
          Alert.alert('Success', 'Resource added successfully');
        }
      }

      setShowResourceForm(false);
      loadResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      Alert.alert('Error', 'Failed to save resource');
    }
  };

  const updateStock = async (resourceId, newStock, operation) => {
    if (!hasSecurityLevel(userRole, 3)) {
      Alert.alert('Access Denied', 'Leadership privileges required');
      return;
    }

    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    const stockData = {
      currentStock: parseInt(newStock),
      needsReorder: parseInt(newStock) <= resource.minStockLevel,
      lastUpdated: new Date().toISOString(),
      lastOperation: operation, // 'restock', 'usage', 'adjustment'
      updatedBy: user?.email || 'Unknown'
    };

    try {
      if (Platform.OS === 'web') {
        const { doc, updateDoc } = require('firebase/firestore');
        const resourceRef = doc(firestore(), 'resources', resourceId);
        await updateDoc(resourceRef, stockData);
      } else {
        await firestore().collection('resources').doc(resourceId).update(stockData);
      }

      loadResources();
      Alert.alert('Success', 'Stock updated successfully');
    } catch (error) {
      console.error('Error updating stock:', error);
      Alert.alert('Error', 'Failed to update stock');
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (categoryId) => {
    return resourceCategories.find(cat => cat.id === categoryId) || resourceCategories[0];
  };

  const getStockStatus = (resource) => {
    if (resource.currentStock <= 0) return { status: 'out_of_stock', color: '#f04141', text: 'Out of Stock' };
    if (resource.currentStock <= resource.minStockLevel) return { status: 'low_stock', color: '#ffce00', text: 'Low Stock' };
    if (resource.currentStock >= resource.maxStockLevel) return { status: 'overstocked', color: '#ff8c00', text: 'Overstocked' };
    return { status: 'in_stock', color: '#10dc60', text: 'In Stock' };
  };

  const renderResourceCard = ({ item }) => {
    const categoryInfo = getCategoryInfo(item.category);
    const stockStatus = getStockStatus(item);

    return (
      <TouchableOpacity 
        style={styles.resourceCard}
        onPress={() => openResourceForm(item)}
      >
        <View style={styles.resourceHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color }]}>
            <Ionicons name={categoryInfo.icon} size={20} color="white" />
          </View>
          
          <View style={styles.resourceInfo}>
            <Text style={styles.resourceName}>{item.name}</Text>
            <Text style={styles.resourceCategory}>{categoryInfo.name}</Text>
            {item.location && (
              <Text style={styles.resourceLocation}>📍 {item.location}</Text>
            )}
          </View>

          <View style={styles.stockInfo}>
            <Text style={[styles.stockCount, { color: stockStatus.color }]}>
              {item.currentStock}
            </Text>
            <Text style={styles.stockUnit}>{item.unit}</Text>
            <View style={[styles.stockStatus, { backgroundColor: stockStatus.color }]}>
              <Text style={styles.stockStatusText}>{stockStatus.text}</Text>
            </View>
          </View>
        </View>

        <View style={styles.stockControls}>
          <TouchableOpacity
            style={[styles.stockButton, { backgroundColor: '#f04141' }]}
            onPress={() => {
              Alert.prompt(
                'Use Stock',
                `Current stock: ${item.currentStock} ${item.unit}\nHow many to use?`,
                (value) => {
                  const used = parseInt(value) || 0;
                  if (used > 0 && used <= item.currentStock) {
                    updateStock(item.id, item.currentStock - used, 'usage');
                  }
                },
                'plain-text',
                '1'
              );
            }}
          >
            <Ionicons name="remove-outline" size={16} color="white" />
            <Text style={styles.stockButtonText}>Use</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.stockButton, { backgroundColor: '#10dc60' }]}
            onPress={() => {
              Alert.prompt(
                'Restock Item',
                `Current stock: ${item.currentStock} ${item.unit}\nHow many to add?`,
                (value) => {
                  const added = parseInt(value) || 0;
                  if (added > 0) {
                    updateStock(item.id, item.currentStock + added, 'restock');
                  }
                },
                'plain-text',
                '10'
              );
            }}
          >
            <Ionicons name="add-outline" size={16} color="white" />
            <Text style={styles.stockButtonText}>Restock</Text>
          </TouchableOpacity>

          {item.needsReorder && (
            <View style={styles.reorderAlert}>
              <Ionicons name="warning-outline" size={14} color="#ffce00" />
              <Text style={styles.reorderText}>Needs Reorder</Text>
            </View>
          )}
        </View>

        {item.supplier && (
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierText}>Supplier: {item.supplier}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderResourceForm = () => (
    <Modal
      visible={showResourceForm}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowResourceForm(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {selectedResource ? 'Edit Resource' : 'Add New Resource'}
          </Text>
          <TouchableOpacity onPress={() => setShowResourceForm(false)}>
            <Ionicons name="close-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer}>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Resource Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter resource name"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelector}>
              {resourceCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    { borderColor: category.color },
                    formData.category === category.id && { backgroundColor: category.color }
                  ]}
                  onPress={() => setFormData({ ...formData, category: category.id })}
                >
                  <Ionicons 
                    name={category.icon} 
                    size={18} 
                    color={formData.category === category.id ? 'white' : category.color} 
                  />
                  <Text style={[
                    styles.categoryOptionText,
                    { color: formData.category === category.id ? 'white' : category.color }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formField, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.fieldLabel}>Current Stock</Text>
              <TextInput
                style={styles.textInput}
                value={formData.currentStock.toString()}
                onChangeText={(text) => setFormData({ ...formData, currentStock: text })}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            <View style={[styles.formField, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.fieldLabel}>Unit</Text>
              <TextInput
                style={styles.textInput}
                value={formData.unit}
                onChangeText={(text) => setFormData({ ...formData, unit: text })}
                placeholder="items, boxes, bottles"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formField, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.fieldLabel}>Min Stock Level</Text>
              <TextInput
                style={styles.textInput}
                value={formData.minStockLevel.toString()}
                onChangeText={(text) => setFormData({ ...formData, minStockLevel: text })}
                keyboardType="numeric"
                placeholder="5"
              />
            </View>
            <View style={[styles.formField, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.fieldLabel}>Max Stock Level</Text>
              <TextInput
                style={styles.textInput}
                value={formData.maxStockLevel.toString()}
                onChangeText={(text) => setFormData({ ...formData, maxStockLevel: text })}
                keyboardType="numeric"
                placeholder="50"
              />
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Storage Location</Text>
            <TextInput
              style={styles.textInput}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="Kitchen, Storage Room, AV Cabinet"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Supplier</Text>
            <TextInput
              style={styles.textInput}
              value={formData.supplier}
              onChangeText={(text) => setFormData({ ...formData, supplier: text })}
              placeholder="Company name or contact"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Additional notes or instructions"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.switchField}>
            <Text style={styles.switchLabel}>Active Item</Text>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => setFormData({ ...formData, isActive: value })}
            />
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowResourceForm(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={saveResource}>
            <Text style={styles.saveButtonText}>
              {selectedResource ? 'Update Resource' : 'Add Resource'}
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
        <Text style={styles.title}>ORLQB Resource Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openResourceForm()}>
          <Ionicons name="add-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilters}>
          <TouchableOpacity
            style={[styles.filterButton, selectedCategory === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.filterText, selectedCategory === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          
          {resourceCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterButton, 
                selectedCategory === category.id && styles.filterButtonActive,
                { borderColor: category.color }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon} 
                size={14} 
                color={selectedCategory === category.id ? 'white' : category.color} 
              />
              <Text style={[
                styles.filterText, 
                selectedCategory === category.id && styles.filterTextActive,
                { color: selectedCategory === category.id ? 'white' : category.color }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{filteredResources.length}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#f04141' }]}>
            {filteredResources.filter(r => r.needsReorder).length}
          </Text>
          <Text style={styles.statLabel}>Need Reorder</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#ffce00' }]}>
            {filteredResources.filter(r => r.currentStock <= r.minStockLevel).length}
          </Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
      </View>

      {filteredResources.length === 0 ? (
        <View style={[styles.centerContent, { flex: 1 }]}>
          <Ionicons name="cube-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No resources found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredResources}
          renderItem={renderResourceCard}
          keyExtractor={(item) => item.id}
          style={styles.resourcesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {renderResourceForm()}
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
    backgroundColor: '#10dc60',
    padding: 10,
    borderRadius: 8,
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  categoryFilters: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: '#3880ff',
    borderColor: '#3880ff',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: 'white',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 15,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3880ff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  resourcesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  resourceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  resourceCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  resourceLocation: {
    fontSize: 12,
    color: '#3880ff',
  },
  stockInfo: {
    alignItems: 'center',
  },
  stockCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  stockUnit: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  stockStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  stockStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  stockControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  stockButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reorderAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  reorderText: {
    fontSize: 10,
    color: '#856404',
    fontWeight: 'bold',
  },
  supplierInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  supplierText: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 15,
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
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    gap: 4,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
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

export default ResourceManager;