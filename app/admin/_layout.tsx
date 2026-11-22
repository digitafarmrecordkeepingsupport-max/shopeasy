import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Colors from '../../constants/colors';

export default function AdminLayout() {
  const { role, switchRole } = useAuth();
  const router = useRouter();

  // Role Protection Guard: Block customer access to administrative functions
  if (role !== 'admin') {
    return (
      <SafeAreaView style={styles.restrictedContainer}>
        <View style={styles.restrictedIconBox}>
          <Ionicons name="lock-closed" size={48} color={Colors.error} />
        </View>
        <Text style={styles.restrictedTitle}>Access Restricted</Text>
        <Text style={styles.restrictedMessage}>
          Only the authorized store owner has permission to manage products, pricing, and orders.
          Customers do not have access to administrative functions.
        </Text>

        <Button
          title="Switch to Store Owner Mode"
          onPress={async () => {
            await switchRole('admin');
          }}
          variant="primary"
          style={{ width: '100%', marginBottom: 12 }}
        />

        <Button
          title="Return to Customer Shop"
          onPress={() => router.replace('/(tabs)')}
          variant="outline"
          style={{ width: '100%' }}
        />
      </SafeAreaView>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F7F5FC' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="products" />
      <Stack.Screen name="add-product" />
      <Stack.Screen name="edit-product" />
      <Stack.Screen name="orders" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  restrictedContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  restrictedIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  restrictedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  restrictedMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
});
