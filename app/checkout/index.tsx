import React, { useState } from 'react';
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
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { formatNaira } from '../../utils/currency';
import { PaymentMethod, Address } from '../../types';
import { BorderRadius, Shadows } from '../../constants/spacing';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { placeOrder } = useOrders();

  // Address State
  const [recipientName, setRecipientName] = useState(user?.full_name || 'Jane Doe');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '+234 801 234 5678');
  const [streetAddress, setStreetAddress] = useState('14 Victoria Island Boulevard');
  const [city, setCity] = useState('Lagos');
  const [state, setState] = useState('Lagos State');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);

  const paymentOptions: { id: PaymentMethod; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
    {
      id: 'paystack',
      label: 'Paystack (Cards, Bank Transfer, USSD)',
      icon: 'shield-checkmark-outline',
      desc: 'Secured instant payment (Nigeria)',
    },
    {
      id: 'card',
      label: 'Credit / Debit Card',
      icon: 'card-outline',
      desc: 'Mastercard, Visa, Verve',
    },
    {
      id: 'transfer',
      label: 'Direct Bank Transfer',
      icon: 'business-outline',
      desc: 'Transfer directly to ShopEasy bank account',
    },
    {
      id: 'cash_on_delivery',
      label: 'Cash on Delivery',
      icon: 'cash-outline',
      desc: 'Pay cash upon package arrival',
    },
  ];

  const handleStartCheckout = () => {
    if (!recipientName.trim() || !phoneNumber.trim() || !streetAddress.trim()) {
      Alert.alert('Incomplete Address', 'Please provide recipient name, phone, and delivery address.');
      return;
    }

    setShowSimulatedModal(true);
  };

  const handleConfirmSimulatedPayment = async () => {
    setIsProcessing(true);

    try {
      const address: Address = {
        id: 'addr-' + Date.now(),
        customer_id: user?.id,
        recipient_name: recipientName.trim(),
        phone_number: phoneNumber.trim(),
        street_address: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        is_default: true,
      };

      const orderItems = items.map((i) => ({
        id: 'oi-' + i.product.id,
        product_id: i.product.id,
        product_name: i.product.name,
        product_image: i.product.image_urls[0],
        unit_price: i.product.price,
        quantity: i.quantity,
        total: i.product.price * i.quantity,
      }));

      const newOrder = await placeOrder({
        customer_id: user?.id || 'usr-customer-jane',
        customer_name: recipientName.trim(),
        customer_email: user?.email || 'jane.doe@gmail.com',
        customer_phone: phoneNumber.trim(),
        items: orderItems,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
        order_status: 'processing',
        delivery_address: address,
      });

      clearCart();
      setShowSimulatedModal(false);

      Alert.alert(
        'Order Placed Successfully! 🎉',
        `Your order #${newOrder.order_number} has been confirmed. You can track its delivery status anytime.`,
        [
          {
            text: 'Track Order',
            onPress: () => router.replace(`/orders/${newOrder.id}`),
          },
          {
            text: 'Return to Home',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Checkout Error', e.message || 'Unable to place order');
    } finally {
      setIsProcessing(false);
    }
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address Section */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>

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

          <View style={styles.twoColumnRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="City"
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Lagos"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="State"
                value={state}
                onChangeText={setState}
                placeholder="e.g. Lagos State"
              />
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="card-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          {paymentOptions.map((opt) => {
            const isSelected = paymentMethod === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setPaymentMethod(opt.id)}
                style={[
                  styles.paymentOption,
                  isSelected && styles.selectedPaymentOption,
                ]}
              >
                <View style={styles.paymentIconBox}>
                  <Ionicons
                    name={opt.icon}
                    size={22}
                    color={isSelected ? Colors.primary : Colors.textSecondary}
                  />
                </View>

                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentLabel}>{opt.label}</Text>
                  <Text style={styles.paymentDesc}>{opt.desc}</Text>
                </View>

                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Order Review Section */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>

          {items.map((i) => (
            <View key={i.id} style={styles.summaryItemRow}>
              <Text style={styles.summaryItemTitle} numberOfLines={1}>
                {i.quantity}x {i.product.name}
              </Text>
              <Text style={styles.summaryItemPrice}>
                {formatNaira(i.product.price * i.quantity)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Subtotal</Text>
            <Text style={styles.breakdownValue}>{formatNaira(subtotal)}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Delivery Fee</Text>
            <Text style={styles.breakdownValue}>
              {deliveryFee === 0 ? 'FREE' : formatNaira(deliveryFee)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatNaira(total)}</Text>
          </View>
        </View>

        {/* Place Order CTA */}
        <Button
          title={`Confirm Order • ${formatNaira(total)}`}
          onPress={handleStartCheckout}
          variant="primary"
          style={styles.confirmButton}
        />
      </ScrollView>

      {/* Simulated Payment Flow Modal (Clearly Labeled Demo Mode) */}
      <Modal
        visible={showSimulatedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSimulatedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.modal]}>
            <View style={styles.modalBadge}>
              <Text style={styles.modalBadgeText}>DEMO PAYMENT GATEWAY</Text>
            </View>

            <Ionicons
              name={paymentMethod === 'paystack' ? 'shield-checkmark' : 'card'}
              size={48}
              color={Colors.primary}
            />

            <Text style={styles.modalTitle}>
              {paymentMethod === 'paystack'
                ? 'Simulated Paystack Gateway'
                : paymentMethod === 'cash_on_delivery'
                ? 'Cash on Delivery Confirmation'
                : 'Simulated Card Payment'}
            </Text>

            <Text style={styles.modalNotice}>
              Notice: This is a simulated checkout demo. No actual money will be charged.
              Paystack API secret integration will process live cards once connected to Supabase.
            </Text>

            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Total to Pay</Text>
              <Text style={styles.amountValue}>{formatNaira(total)}</Text>
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowSimulatedModal(false)}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title={isProcessing ? 'Processing...' : 'Authorize Payment'}
                onPress={handleConfirmSimulatedPayment}
                variant="primary"
                isLoading={isProcessing}
                style={{ flex: 1.4 }}
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
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  selectedPaymentOption: {
    borderColor: Colors.primary,
    backgroundColor: '#FAF7FD',
  },
  paymentIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  paymentDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryItemTitle: {
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F0F9',
    marginVertical: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  confirmButton: {
    marginTop: 8,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 20, 40, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  modalBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 10,
    textAlign: 'center',
  },
  modalNotice: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginVertical: 12,
  },
  amountBox: {
    backgroundColor: '#F7F5FC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginVertical: 14,
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
  },
});
