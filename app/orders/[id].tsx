import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { formatNaira } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';
import { BorderRadius, Shadows } from '../../constants/spacing';
import { OrderStatus } from '../../types';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getOrderById, updateOrderStatus } = useOrders();
  const { role } = useAuth();

  const orderId = Array.isArray(id) ? id[0] : id;
  const order = orderId ? getOrderById(orderId) : undefined;

  if (!order) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.notFoundTitle}>Order Not Found</Text>
        <Button
          title="Back to Orders"
          onPress={() => router.back()}
          variant="primary"
          style={{ marginTop: 16 }}
        />
      </SafeAreaView>
    );
  }

  // Steps for tracking progress
  const TRACKING_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'pending', label: 'Order Placed', desc: 'We received your order request' },
    { key: 'processing', label: 'Processing & Packaging', desc: 'Preparing items in the warehouse' },
    { key: 'shipped', label: 'Out for Delivery', desc: 'Courier is delivering your parcel' },
    { key: 'delivered', label: 'Delivered', desc: 'Package received by customer' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order.order_status as OrderStatus);

  const handleAdminUpdateStatus = (newStatus: OrderStatus) => {
    Alert.alert('Update Status', `Change order status to ${newStatus}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          await updateOrderStatus(order.id, newStatus);
          Alert.alert('Updated', `Order status is now ${newStatus}`);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.order_number}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Header Card */}
        <View style={[styles.statusCard, Shadows.card]}>
          <View style={styles.statusHeaderRow}>
            <View>
              <Text style={styles.statusOrderNumber}>Order #{order.order_number}</Text>
              <Text style={styles.statusDate}>{formatDateTime(order.created_at)}</Text>
            </View>
            <Badge variant="status" status={order.order_status as OrderStatus} />
          </View>

          {/* Admin Fast Status Controls */}
          {role === 'admin' && (
            <View style={styles.adminControlsBox}>
              <Text style={styles.adminControlsTitle}>Owner Quick Status Controls:</Text>
              <View style={styles.statusButtonsRow}>
                {(['pending', 'processing', 'shipped', 'delivered'] as OrderStatus[]).map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => handleAdminUpdateStatus(st)}
                    style={[
                      styles.statusSelectButton,
                      order.order_status === st && styles.activeStatusSelectButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusSelectButtonText,
                        order.order_status === st && styles.activeStatusSelectButtonText,
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Step-by-Step Delivery Tracking Timeline */}
        <View style={[styles.timelineCard, Shadows.card]}>
          <Text style={styles.cardHeading}>Tracking Timeline</Text>

          {order.order_status === 'cancelled' ? (
            <View style={styles.cancelledBox}>
              <Ionicons name="close-circle" size={32} color={Colors.error} />
              <Text style={styles.cancelledTitle}>This order has been cancelled.</Text>
            </View>
          ) : (
            <View style={styles.timelineList}>
              {TRACKING_STEPS.map((step, idx) => {
                const isCompleted = currentStep >= idx;
                const isCurrent = currentStep === idx;

                return (
                  <View key={step.key} style={styles.timelineRow}>
                    {/* Node Indicator */}
                    <View style={styles.nodeColumn}>
                      <View
                        style={[
                          styles.timelineNode,
                          isCompleted && styles.completedNode,
                          isCurrent && styles.currentNode,
                        ]}
                      >
                        {isCompleted ? (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        ) : (
                          <View style={styles.pendingDot} />
                        )}
                      </View>
                      {idx < TRACKING_STEPS.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            currentStep > idx && styles.completedLine,
                          ]}
                        />
                      )}
                    </View>

                    {/* Step Content */}
                    <View style={styles.stepContent}>
                      <Text
                        style={[
                          styles.stepLabel,
                          isCompleted && styles.completedStepLabel,
                        ]}
                      >
                        {step.label}
                      </Text>
                      <Text style={styles.stepDesc}>{step.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Ordered Items List */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <Text style={styles.cardHeading}>Items Ordered ({order.items.length})</Text>

          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image
                source={{ uri: item.product_image }}
                style={styles.itemThumbnail}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product_name}
                </Text>
                <Text style={styles.itemQuantity}>
                  Quantity: {item.quantity} × {formatNaira(item.unit_price)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>{formatNaira(item.total)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>{formatNaira(order.subtotal)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={styles.priceValue}>{formatNaira(order.delivery_fee)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>{formatNaira(order.total)}</Text>
          </View>
        </View>

        {/* Delivery Address Details */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <Text style={styles.cardHeading}>Delivery Details</Text>
          <Text style={styles.recipientName}>{order.delivery_address.recipient_name}</Text>
          <Text style={styles.addressLine}>{order.delivery_address.street_address}</Text>
          <Text style={styles.addressLine}>
            {order.delivery_address.city}, {order.delivery_address.state}
          </Text>
          <Text style={styles.phoneLine}>Phone: {order.delivery_address.phone_number}</Text>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusOrderNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statusDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  adminControlsBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F0F9',
  },
  adminControlsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusSelectButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
  },
  activeStatusSelectButton: {
    backgroundColor: Colors.primary,
  },
  statusSelectButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  activeStatusSelectButtonText: {
    color: '#FFFFFF',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  timelineList: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  nodeColumn: {
    alignItems: 'center',
    width: 28,
  },
  timelineNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  completedNode: {
    backgroundColor: Colors.primary,
  },
  currentNode: {
    backgroundColor: Colors.accentOrange,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#EAE6F3',
    marginVertical: 4,
  },
  completedLine: {
    backgroundColor: Colors.primary,
  },
  stepContent: {
    flex: 1,
    marginLeft: 12,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  completedStepLabel: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  stepDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F8F6FC',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemQuantity: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F0F9',
    marginVertical: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addressLine: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  phoneLine: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  cancelledBox: {
    alignItems: 'center',
    padding: 18,
  },
  cancelledTitle: {
    fontSize: 15,
    color: Colors.error,
    fontWeight: '700',
    marginTop: 8,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
});
