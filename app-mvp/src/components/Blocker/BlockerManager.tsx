import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  Switch,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import blockerService, { BlockedItem, BlockerConfig } from '../../services/blockerService';
import { addBlockedItem, removeBlockedItem, updateBlockedItem } from '../../store/slices/blockerSlice';

interface BlockerManagerProps {
  visible: boolean;
  onClose: () => void;
}

const BlockerManager: React.FC<BlockerManagerProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const [blockedItems, setBlockedItems] = useState<BlockedItem[]>([]);
  const [config, setConfig] = useState<BlockerConfig>({
    isEnabled: true,
    workModeEnabled: true,
    breakModeEnabled: false,
    syncWithExtension: true,
  });
  const [newItemName, setNewItemName] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [selectedType, setSelectedType] = useState<'app' | 'website'>('website');
  const [showAddModal, setShowAddModal] = useState(false);

  // Load blocked items and config on mount
  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const items = blockerService.getBlockedItems();
      const currentConfig = blockerService.getConfig();
      setBlockedItems(items);
      setConfig(currentConfig);
    } catch (error) {
      console.error('Failed to load blocker data:', error);
    }
  };

  // Add new blocked item
  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Please enter a name for the blocked item');
      return;
    }

    if (selectedType === 'website' && !newItemUrl.trim()) {
      Alert.alert('Error', 'Please enter a URL for the website');
      return;
    }

    try {
      const newItem = await blockerService.addBlockedItem({
        name: newItemName.trim(),
        type: selectedType,
        url: selectedType === 'website' ? newItemUrl.trim() : undefined,
        isActive: true,
      });

      setBlockedItems(prev => [...prev, newItem]);
      setNewItemName('');
      setNewItemUrl('');
      setShowAddModal(false);
      
      Alert.alert('Success', `${newItem.name} has been added to blocked items`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add blocked item');
    }
  };

  // Remove blocked item
  const handleRemoveItem = async (itemId: string) => {
    Alert.alert(
      'Remove Blocked Item',
      'Are you sure you want to remove this item from the blocked list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockerService.removeBlockedItem(itemId);
              setBlockedItems(prev => prev.filter(item => item.id !== itemId));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove blocked item');
            }
          },
        },
      ]
    );
  };

  // Toggle item active status
  const handleToggleItem = async (itemId: string, isActive: boolean) => {
    try {
      await blockerService.updateBlockedItem(itemId, { isActive: !isActive });
      setBlockedItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, isActive: !isActive } : item
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update blocked item');
    }
  };

  // Update configuration
  const handleConfigChange = async (key: keyof BlockerConfig, value: boolean) => {
    try {
      const newConfig = { ...config, [key]: value };
      await blockerService.updateConfig(newConfig);
      setConfig(newConfig);
    } catch (error) {
      Alert.alert('Error', 'Failed to update configuration');
    }
  };

  // Render blocked item
  const renderBlockedItem = ({ item }: { item: BlockedItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemType}>{item.type}</Text>
        {item.url && <Text style={styles.itemUrl}>{item.url}</Text>}
      </View>
      
      <View style={styles.itemActions}>
        <Switch
          value={item.isActive}
          onValueChange={(value) => handleToggleItem(item.id, value)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={item.isActive ? '#f5dd4b' : '#f4f3f4'}
        />
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Blocker Manager</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Configuration Section */}
        <View style={styles.configSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Enable Blocker</Text>
            <Switch
              value={config.isEnabled}
              onValueChange={(value) => handleConfigChange('isEnabled', value)}
            />
          </View>
          
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Block during Work Mode</Text>
            <Switch
              value={config.workModeEnabled}
              onValueChange={(value) => handleConfigChange('workModeEnabled', value)}
            />
          </View>
          
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Block during Break Mode</Text>
            <Switch
              value={config.breakModeEnabled}
              onValueChange={(value) => handleConfigChange('breakModeEnabled', value)}
            />
          </View>
          
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Sync with Chrome Extension</Text>
            <Switch
              value={config.syncWithExtension}
              onValueChange={(value) => handleConfigChange('syncWithExtension', value)}
            />
          </View>
        </View>

        {/* Blocked Items Section */}
        <View style={styles.itemsSection}>
          <View style={styles.itemsHeader}>
            <Text style={styles.sectionTitle}>Blocked Items</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={blockedItems}
            renderItem={renderBlockedItem}
            keyExtractor={(item) => item.id}
            style={styles.itemsList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Add Item Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Blocked Item</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'website' && styles.typeButtonActive
                  ]}
                  onPress={() => setSelectedType('website')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    selectedType === 'website' && styles.typeButtonTextActive
                  ]}>Website</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'app' && styles.typeButtonActive
                  ]}
                  onPress={() => setSelectedType('app')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    selectedType === 'app' && styles.typeButtonTextActive
                  ]}>App</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="Enter name"
                autoCapitalize="none"
              />
              
              {selectedType === 'website' && (
                <>
                  <Text style={styles.inputLabel}>URL</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newItemUrl}
                    onChangeText={setNewItemUrl}
                    placeholder="https://example.com"
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </>
              )}
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddItem}
              >
                <Text style={styles.saveButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
  },
  configSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  configLabel: {
    fontSize: 16,
    color: '#374151',
  },
  itemsSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  itemsList: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  itemType: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  itemUrl: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  removeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  typeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  typeButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BlockerManager; 