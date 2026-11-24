import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useOrders } from '../../context/OrderContext';
import { formatNaira } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';
import { BorderRadius, Shadows } from '../../constants/spacing';
import { OrderStatus } from '../../types';
import { NotificationService } from '../../services/notification.service';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getOrderById, cancelOrder } = useOrders();

  const orderId = Array.isArray(id) ? id[0] : id;
  const order = orderId ? getOrderById(orderId) : undefined;

  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

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

  // 4-Step tracking progress
  const TRACKING_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'pending', label: 'Order Placed', desc: 'We received your order request' },
    { key: 'processing', label: 'Processing & Packaging', desc: 'Preparing items in the warehouse' },
    { key: 'shipped', label: 'Out for Delivery', desc: 'Courier is delivering your parcel in Nigeria' },
    { key: 'delivered', label: 'Delivered', desc: 'Package safely received by customer' },
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
  const canCancel = order.order_status === 'pending' || order.order_status === 'processing';

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      Alert.alert('Reason Required', 'Please provide a brief reason for cancelling your order.');
      return;
    }

    setIsCancelling(true);
    try {
      await cancelOrder(order.id, cancelReason.trim());

      // Send in-app notification
      await NotificationService.addNotification({
        customer_id: order.customer_id,
        title: `Order #${order.order_number} Cancelled`,
        message: `Your cancellation request was processed. Reason: ${cancelReason.trim()}`,
        type: 'order',
        related_id: order.id,
      });

      setIsCancelModalVisible(false);
      Alert.alert('Order Cancelled', 'Your order has been cancelled.');
    } catch (e: any) {
      Alert.alert('Cancellation Error', e.message || 'Unable to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleContactSupport = () => {
    router.push({
      pathname: '/support',
      params: { orderNumber: order.order_number },
    });
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
        </View>

        {/* Step-by-Step Delivery Tracking Timeline */}
        <View style={[styles.timelineCard, Shadows.card]}>
          <Text style={styles.cardHeading}>Tracking Timeline</Text>

          {order.order_status === 'cancelled' ? (
            <View style={styles.cancelledBox}>
              <Ionicons name="close-circle" size={36} color={Colors.error} />
              <Text style={styles.cancelledTitle}>This order has been cancelled.</Text>
              {order.cancellation_reason && (
                <Text style={styles.cancelledReason}>Reason: {order.cancellation_reason}</Text>
              )}
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
                source={{ uri: item.product_image || 'https://via.placeholder.com/150' }}
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

          {order.discount && order.discount > 0 ? (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: Colors.success }]}>Promo Discount</Text>
              <Text style={[styles.priceValue, { color: Colors.success }]}>
                -{formatNaira(order.discount)}
              </Text>
            </View>
          ) : null}

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

        {/* Actions Row: Support & Cancel */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Ionicons name="chatbubbles-outline" size={18} color={Colors.primary} />
            <Text style={styles.supportButtonText}>Need Help with this Order?</Text>
          </TouchableOpacity>

          {canCancel && (
            <TouchableOpacity
              style={styles.cancelOrderButton}
              onPress={() => setIsCancelModalVisible(true)}
            >
              <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
              <Text style={styles.cancelOrderButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Cancel Order Modal */}
      <Modal
        visible={isCancelModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cancel Order #{order.order_number}</Text>
              <TouchableOpacity onPress={() => setIsCancelModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Please tell us why you want to cancel this order:
            </Text>

            <TextInput
              style={styles.modalTextInput}
              placeholder="e.g., Ordered by mistake, changed delivery address..."
              placeholderTextColor={Colors.textLight}
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <Button
                title="Keep Order"
                onPress={() => setIsCancelModalVisible(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title="Confirm Cancellation"
                onPress={handleConfirmCancel}
                variant="primary"
                isLoading={isCancelling}
                style={{ flex: 1, backgroundColor: Colors.error }}
              />
            </View>
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
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 16,
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
    paddingLeft: 6,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  nodeColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  timelineNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F3F0F9',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: Colors.textMuted,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#EDE9FE',
    marginVertical: 4,
  },
  completedLine: {
    backgroundColor: Colors.primary,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 14,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  completedStepLabel: {
    color: Colors.textPrimary,
  },
  stepDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cancelledBox: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  cancelledTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
    marginTop: 8,
  },
  cancelledReason: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F5FC',
  },
  itemThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F0F9',
  },
  itemInfo: {
    flex: 1,
    marginHorizontal: 12,
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
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F0F9',
    marginVertical: 12,
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
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  recipientName: {
    fontSize: 14,
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
  },
  actionButtonsContainer: {
    gap: 12,
    marginTop: 4,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.button,
    backgroundColor: '#EDE9FE',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  cancelOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.button,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  cancelOrderButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 80,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
