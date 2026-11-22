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
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useOrders } from '../../context/OrderContext';
import { formatNaira } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';
import { OrderStatus, Order } from '../../types';
import { BorderRadius, Shadows } from '../../constants/spacing';

export default function AdminOrdersScreen() {
  const router = useRouter();
  const { orders, updateOrderStatus } = useOrders();

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeOrderForModal, setActiveOrderForModal] = useState<Order | null>(null);

  const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const filteredOrders = orders.filter((o) => {
    if (selectedFilter === 'all') return true;
    return o.order_status === selectedFilter;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setActiveOrderForModal(null);
      Alert.alert('Status Updated', `Order #${activeOrderForModal?.order_number} is now ${newStatus}.`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Unable to update order');
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
        <Text style={styles.headerTitle}>Order Management</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            onPress={() => setSelectedFilter('all')}
            style={[styles.filterChip, selectedFilter === 'all' && styles.activeFilterChip]}
          >
            <Text style={[styles.filterChipText, selectedFilter === 'all' && styles.activeFilterChipText]}>
              All ({orders.length})
            </Text>
          </TouchableOpacity>

          {statuses.map((st) => (
            <TouchableOpacity
              key={st}
              onPress={() => setSelectedFilter(st)}
              style={[styles.filterChip, selectedFilter === st && styles.activeFilterChip]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === st && styles.activeFilterChipText,
                ]}
              >
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>There are no orders matching this filter.</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={[styles.orderCard, Shadows.card]}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.orderNumber}>Order #{order.order_number}</Text>
                  <Text style={styles.orderDate}>{formatDateTime(order.created_at)}</Text>
                </View>
                <Badge variant="status" status={order.order_status as OrderStatus} />
              </View>

              <View style={styles.divider} />

              {/* Customer Info */}
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={16} color={Colors.primary} />
                <Text style={styles.infoText}>
                  {order.customer_name} ({order.customer_email})
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={16} color={Colors.primary} />
                <Text style={styles.infoText}>{order.customer_phone || 'No phone'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={Colors.primary} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {order.delivery_address.street_address}, {order.delivery_address.city}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Items Summary */}
              <Text style={styles.itemsSummary}>
                {order.items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
              </Text>

              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.totalLabel}>Total Value</Text>
                  <Text style={styles.totalValue}>{formatNaira(order.total)}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setActiveOrderForModal(order)}
                  style={styles.updateStatusButton}
                >
                  <Text style={styles.updateStatusButtonText}>Update Status ▾</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Status Picker Modal */}
      <Modal
        visible={!!activeOrderForModal}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveOrderForModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.modal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Update Order #{activeOrderForModal?.order_number}
              </Text>
              <TouchableOpacity onPress={() => setActiveOrderForModal(null)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Select new order delivery status:</Text>

            {statuses.map((st) => (
              <TouchableOpacity
                key={st}
                onPress={() => activeOrderForModal && handleUpdateStatus(activeOrderForModal.id, st)}
                style={[
                  styles.statusOption,
                  activeOrderForModal?.order_status === st && styles.activeStatusOption,
                ]}
              >
                <Badge variant="status" status={st} />
                <Text style={styles.statusOptionLabel}>
                  Mark as {st.charAt(0).toUpperCase() + st.slice(1)}
                </Text>
                {activeOrderForModal?.order_status === st && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F5FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
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
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#F7F5FC',
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  orderDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F0F9',
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
  },
  itemsSummary: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F0F9',
  },
  totalLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  updateStatusButton: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.pill,
  },
  updateStatusButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 20, 40, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  activeStatusOption: {
    borderColor: Colors.primary,
    backgroundColor: '#FAF8FD',
  },
  statusOptionLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
