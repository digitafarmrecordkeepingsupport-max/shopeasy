import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Address } from '../../types';
import { BorderRadius, Shadows } from '../../constants/spacing';
import { AddressService } from '../../services/address.service';
import { useAuth } from '../../context/AuthContext';

export default function AddressesScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Address Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [recipientName, setRecipientName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Lagos');
  const [state, setState] = useState('Lagos State');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, [user?.id]);

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await AddressService.getAddresses(user?.id);
      setAddresses(data);
    } catch (e) {
      console.warn('Error loading addresses:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    await AddressService.setDefault(id, user?.id);
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === id }))
    );
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await AddressService.deleteAddress(id, user?.id);
          setAddresses((prev) => prev.filter((a) => a.id !== id));
        },
      },
    ]);
  };

  const handleAddNewAddress = async () => {
    if (!recipientName.trim() || !phoneNumber.trim() || !streetAddress.trim()) {
      Alert.alert('Incomplete Fields', 'Please fill in recipient name, phone number, and street address.');
      return;
    }

    setIsSaving(true);
    try {
      const created = await AddressService.addAddress(
        {
          recipient_name: recipientName.trim(),
          phone_number: phoneNumber.trim(),
          street_address: streetAddress.trim(),
          city: city.trim() || 'Lagos',
          state: state.trim() || 'Lagos State',
          is_default: addresses.length === 0,
        },
        user?.id
      );

      setAddresses((prev) => [created, ...prev]);
      setShowAddModal(false);
      setStreetAddress('');
      Alert.alert('Address Saved', 'New delivery address added successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Unable to save address.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={styles.addButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={26} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={56} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Saved Addresses</Text>
            <Text style={styles.emptySubtitle}>
              Save your delivery addresses for rapid checkout.
            </Text>
            <Button
              title="+ Add Your First Address"
              onPress={() => setShowAddModal(true)}
              variant="primary"
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          <>
            {addresses.map((addr) => (
              <View
                key={addr.id}
                style={[
                  styles.addressCard,
                  addr.is_default && styles.defaultAddressCard,
                  Shadows.card,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recipientName}>{addr.recipient_name}</Text>
                    <Text style={styles.phoneLine}>Phone: {addr.phone_number}</Text>
                  </View>
                  {addr.is_default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.addressLine}>{addr.street_address}</Text>
                <Text style={styles.addressLine}>
                  {addr.city}, {addr.state}
                </Text>

                <View style={styles.cardActionsRow}>
                  {!addr.is_default ? (
                    <TouchableOpacity
                      onPress={() => handleSetDefault(addr.id)}
                      style={styles.makeDefaultButton}
                    >
                      <Text style={styles.makeDefaultText}>Set as Default</Text>
                    </TouchableOpacity>
                  ) : (
                    <View />
                  )}

                  <TouchableOpacity
                    onPress={() => handleDeleteAddress(addr.id)}
                    style={styles.deleteButton}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <Button
              title="+ Add Another Address"
              onPress={() => setShowAddModal(true)}
              variant="outline"
              style={{ marginTop: 8 }}
            />
          </>
        )}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.modal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Recipient Full Name"
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder="e.g. Jane Doe"
              />
              <Input
                label="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+234 801 234 5678"
                keyboardType="phone-pad"
              />
              <Input
                label="Street Address"
                value={streetAddress}
                onChangeText={setStreetAddress}
                placeholder="House/Plot number, street name"
              />
              <Input label="City" value={city} onChangeText={setCity} placeholder="e.g. Lagos" />
              <Input label="State" value={state} onChangeText={setState} placeholder="e.g. Lagos State" />

              <Button
                title="Save Address"
                onPress={handleAddNewAddress}
                variant="primary"
                isLoading={isSaving}
                style={{ marginTop: 14, marginBottom: 10 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addButton: {
    width: 38,
    height: 38,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3F0F9',
  },
  defaultAddressCard: {
    borderColor: Colors.primary,
    backgroundColor: '#FAF5FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  phoneLine: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  addressLine: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F0F9',
  },
  makeDefaultButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  makeDefaultText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
});
