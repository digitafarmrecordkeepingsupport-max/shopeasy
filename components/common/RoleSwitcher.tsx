import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';
import { Shadows } from '../../constants/spacing';

export const RoleSwitcher: React.FC = () => {
  const { role, switchRole, user } = useAuth();
  const router = useRouter();

  const handleToggle = async () => {
    const nextRole = role === 'admin' ? 'customer' : 'admin';
    await switchRole(nextRole);

    if (nextRole === 'admin') {
      Alert.alert(
        'Store Owner Mode',
        'Switched to Store Owner (Admin). You now have full access to add products, manage catalogue, view sales, and update orders.',
        [
          { text: 'Go to Admin Dashboard', onPress: () => router.push('/admin') },
          { text: 'Stay Here', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        'Customer Mode',
        'Switched to Customer account (Jane Doe). Admin routes are now restricted.',
        [
          { text: 'Go to Shop', onPress: () => router.push('/(tabs)') },
          { text: 'Stay Here', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.pill,
          role === 'admin' ? styles.adminPill : styles.customerPill,
          Shadows.subtle,
        ]}
        activeOpacity={0.85}
        onPress={handleToggle}
      >
        <Ionicons
          name={role === 'admin' ? 'shield-checkmark' : 'person-circle-outline'}
          size={16}
          color={role === 'admin' ? '#FFFFFF' : Colors.primary}
        />
        <Text
          style={[
            styles.text,
            { color: role === 'admin' ? '#FFFFFF' : Colors.primary },
          ]}
        >
          {role === 'admin' ? 'Owner / Admin' : 'Customer Mode'}
        </Text>
        <View style={styles.switchDot}>
          <Text style={styles.switchLabel}>Tap to switch</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  customerPill: {
    backgroundColor: '#F3E8FF',
    borderColor: '#D8B4FE',
  },
  adminPill: {
    backgroundColor: Colors.primary,
    borderColor: Colors.darkPurple,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    marginRight: 6,
  },
  switchDot: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  switchLabel: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
});

export default RoleSwitcher;
