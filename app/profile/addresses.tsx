import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Address } from '../../types';
import { BorderRadius, Shadows } from '../../constants/spacing';

export default function AddressesScreen() {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
      recipient_name: 'Jane Doe',
      phone_number: '+234 801 234 5678',
      street_address: '14 Victoria Island Boulevard',
      city: 'Lagos',
      state: 'Lagos State',
      is_default: true,
    },
    {
      id: 'addr-2',
      recipient_name: 'Jane Doe (Office)',
      phone_number: '+234 802 987 6543',
      street_address: 'Plot 8, Admiralty Way, Lekki Phase 1',
      city: 'Lagos',
      state: 'Lagos State',
      is_default: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Lagos');
  const [state, setState] = useState('Lagos State');

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === id }))
    );
  };

  const handleAddNewAddress = () => {
    if (!recipientName.trim() || !phoneNumber.trim() || !streetAddress.trim()) {
      Alert.alert('Incomplete Fields', 'Please fill in all address details.');
      return;
    }

    const newAddr: Address = {
      id: 'addr-' + Date.now(),
      recipient_name: recipientName.trim(),
      phone_number: phoneNumber.trim(),
      street_address: streetAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      is_default: addresses.length === 0,
    };

    setAddresses([newAddr, ...addresses]);
    setShowAddModal(false);
    setRecipientName('');
    setPhoneNumber('');
    setStreetAddress('');
    Alert.alert('Address Saved', 'New delivery address added successfully.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
              <Text style={styles.recipientName}>{addr.recipient_name}</Text>
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
            <Text style={styles.phoneLine}>Phone: {addr.phone_number}</Text>

            {!addr.is_default && (
              <TouchableOpacity
                onPress={() => handleSetDefault(addr.id)}
                style={styles.makeDefaultButton}
              >
                <Text style={styles.makeDefaultText}>Set as Default</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <Button
          title="+ Add New Address"
          onPress={() => setShowAddModal(true)}
          variant="outline"
          style={{ marginTop: 12 }}
        />
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

            <Input
              label="Recipient Name"
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
              placeholder="Street name & number"
            />
            <Input label="City" value={city} onChangeText={setCity} />
            <Input label="State" value={state} onChangeText={setState} />

            <Button
              title="Save Address"
              onPress={handleAddNewAddress}
              variant="primary"
              style={{ marginTop: 10 }}
            />
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
    paddingBottom: 36,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.2,
    borderColor: Colors.border,
  },
  defaultAddressCard: {
    borderColor: Colors.primary,
    backgroundColor: '#FAF8FD',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  addressLine: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  phoneLine: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 6,
  },
  makeDefaultButton: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F0F9',
  },
  makeDefaultText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 20, 40, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
