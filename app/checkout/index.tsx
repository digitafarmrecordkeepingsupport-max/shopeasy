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
  TextInput,
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
import { PaymentMethod, Address, Coupon } from '../../types';
import { BorderRadius, Shadows } from '../../constants/spacing';
import { AddressService } from '../../services/address.service';
import { CouponService } from '../../services/coupon.service';
import { NotificationService } from '../../services/notification.service';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, deliveryFee: baseDeliveryFee, clearCart } = useCart();
  const { placeOrder } = useOrders();

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('custom');

  // Form Address State
  const [recipientName, setRecipientName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Lagos');
  const [state, setState] = useState('Lagos State');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);

  useEffect(() => {
    loadSavedAddresses();
  }, [user?.id]);

  const loadSavedAddresses = async () => {
    try {
      const addresses = await AddressService.getAddresses(user?.id);
      setSavedAddresses(addresses);

      if (addresses.length > 0) {
        const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
        setSelectedAddressId(defaultAddr.id);
        populateAddressFields(defaultAddr);
      }
    } catch (e) {
      console.warn('Error loading addresses in checkout:', e);
    }
  };

  const populateAddressFields = (addr: Address) => {
    setRecipientName(addr.recipient_name);
    setPhoneNumber(addr.phone_number);
    setStreetAddress(addr.street_address);
    setCity(addr.city);
    setState(addr.state);
  };

  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    populateAddressFields(addr);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const result = CouponService.validateCoupon(couponCode.trim(), subtotal, baseDeliveryFee);
      if (!result.isValid || !result.coupon) {
        setCouponError(result.message);
        setAppliedCoupon(null);
        setDiscountAmount(0);
      } else {
        setAppliedCoupon(result.coupon);
        setDiscountAmount(result.discountAmount);
        setCouponError('');
        Alert.alert('Promo Code Applied!', `${result.coupon.code}: ${result.message}`);
      }
    } catch {
      setCouponError('Unable to apply coupon.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    await CouponService.removeAppliedCoupon();
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    setCouponError('');
  };

  // Calculations
  const deliveryFee = appliedCoupon?.type === 'free_delivery' ? 0 : baseDeliveryFee;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

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
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before proceeding to checkout.');
      return;
    }

    if (!recipientName.trim() || !phoneNumber.trim() || !streetAddress.trim()) {
      Alert.alert('Incomplete Address', 'Please provide recipient name, phone, and delivery address.');
      return;
    }

    setShowSimulatedModal(true);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);

    try {
      const address: Address = {
        id: selectedAddressId !== 'custom' ? selectedAddressId : 'addr-' + Date.now(),
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
        product_image: i.product.image_urls[0] || 'https://via.placeholder.com/150',
        unit_price: i.product.price,
        quantity: i.quantity,
        total: i.product.price * i.quantity,
      }));

      const newOrder = await placeOrder({
        customer_id: user?.id || 'usr-customer-jane',
        customer_name: recipientName.trim(),
        customer_email: user?.email || 'customer@shopeasy.ng',
        customer_phone: phoneNumber.trim(),
        items: orderItems,
        subtotal,
        delivery_fee: deliveryFee,
        discount: discountAmount,
        total,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
        order_status: 'processing',
        delivery_address: address,
      });

      // Dispatch in-app notification
      try {
        await NotificationService.addNotification({
          customer_id: user?.id,
          title: `Order #${newOrder.order_number} Placed! 🎉`,
          message: `Your payment of ${formatNaira(total)} was received. We are now preparing your order.`,
          type: 'order',
          related_id: newOrder.id,
        });
      } catch (nErr) {
        console.warn('Could not dispatch notification:', nErr);
      }

      clearCart();
      await CouponService.removeAppliedCoupon();
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

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.emptyCartBox}>
          <Ionicons name="cart-outline" size={64} color={Colors.textLight} />
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtitle}>
            Looks like you haven't added anything yet.
          </Text>
          <Button
            title="Start Shopping"
            onPress={() => router.replace('/(tabs)')}
            variant="primary"
            style={{ marginTop: 20, width: 200 }}
          />
        </View>
      </SafeAreaView>
    );
  }

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
        {/* Saved Addresses Selector (if user has saved addresses) */}
        {savedAddresses.length > 0 && (
          <View style={[styles.sectionCard, Shadows.card]}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="bookmarks-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Saved Addresses</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedAddrScroll}>
              {savedAddresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    onPress={() => handleSelectAddress(addr)}
                    style={[
                      styles.savedAddrChip,
                      isSelected && styles.savedAddrChipSelected,
                    ]}
                  >
                    <View style={styles.chipHeader}>
                      <Text style={[styles.chipName, isSelected && { color: Colors.primary }]}>
                        {addr.recipient_name}
                      </Text>
                      {addr.is_default && (
                        <View style={styles.defaultChipBadge}>
                          <Text style={styles.defaultChipText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.chipAddress} numberOfLines={2}>
                      {addr.street_address}, {addr.city}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                onPress={() => setSelectedAddressId('custom')}
                style={[
                  styles.savedAddrChip,
                  selectedAddressId === 'custom' && styles.savedAddrChipSelected,
                  { justifyContent: 'center', alignItems: 'center' },
                ]}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={selectedAddressId === 'custom' ? Colors.primary : Colors.textSecondary}
                />
                <Text style={styles.customAddrText}>New Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Delivery Address Form */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>
              {selectedAddressId === 'custom' ? 'Delivery Address' : 'Selected Address Details'}
            </Text>
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

        {/* Promo / Coupon Code Section */}
        <View style={[styles.sectionCard, Shadows.card]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="pricetag-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Promotions & Discount</Text>
          </View>

          {appliedCoupon ? (
            <View style={styles.appliedCouponBox}>
              <View style={styles.appliedCouponInfo}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.appliedCouponCode}>{appliedCoupon.code}</Text>
                  <Text style={styles.appliedCouponDesc}>{appliedCoupon.description}</Text>
                </View>
                <Text style={styles.appliedDiscountValue}>
                  -{formatNaira(discountAmount)}
                </Text>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeCouponBtn}>
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter Promo Code (e.g. EASY10)"
                  placeholderTextColor={Colors.textLight}
                  value={couponCode}
                  onChangeText={(t) => {
                    setCouponCode(t.toUpperCase());
                    setCouponError('');
                  }}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.applyCouponBtn}
                  onPress={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                >
                  {isApplyingCoupon ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.applyCouponText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>

              {couponError ? <Text style={styles.couponErrorText}>{couponError}</Text> : null}

              {/* Coupon hints */}
              <View style={styles.couponHintsRow}>
                <Text style={styles.couponHintLabel}>Available codes:</Text>
                {['EASY10', 'EASY20', 'FREESHIP'].map((code) => (
                  <TouchableOpacity
                    key={code}
                    onPress={() => setCouponCode(code)}
                    style={styles.couponHintPill}
                  >
                    <Text style={styles.couponHintText}>{code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
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

          {discountAmount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: Colors.success }]}>
                Discount ({appliedCoupon?.code})
              </Text>
              <Text style={[styles.breakdownValue, { color: Colors.success }]}>
                -{formatNaira(discountAmount)}
              </Text>
            </View>
          )}

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

      {/* Simulated Payment Flow Modal */}
      <Modal
        visible={showSimulatedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSimulatedModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.modal]}>
            <View style={styles.modalBadge}>
              <Text style={styles.modalBadgeText}>PAYMENT GATEWAY</Text>
            </View>

            <Ionicons
              name={paymentMethod === 'paystack' ? 'shield-checkmark' : 'card'}
              size={48}
              color={Colors.primary}
            />

            <Text style={styles.modalTitle}>
              {paymentMethod === 'paystack'
                ? 'Paystack Nigeria Gateway'
                : paymentMethod === 'cash_on_delivery'
                ? 'Cash on Delivery Confirmation'
                : 'Card Payment Confirmation'}
            </Text>

            <Text style={styles.modalNotice}>
              {paymentMethod === 'cash_on_delivery'
                ? 'You will pay in cash or via POS when your package arrives at your delivery address.'
                : 'Secured via ShopEasy Payment System. Confirm to finalize your order.'}
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
                style={{ flex: 1 }}
              />

              <Button
                title={isProcessing ? 'Processing...' : 'Authorize & Pay'}
                onPress={handleConfirmPayment}
                variant="primary"
                isLoading={isProcessing}
                style={{ flex: 1 }}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F0F9',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  savedAddrScroll: {
    marginBottom: 8,
  },
  savedAddrChip: {
    width: 170,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: 10,
    backgroundColor: '#FAFAFC',
  },
  savedAddrChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F5F0FC',
  },
  chipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chipName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  defaultChipBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
  },
  chipAddress: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  customAddrText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  twoColumnRow: {
    flexDirection: 'row',
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.input,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  applyCouponBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    height: 48,
    borderRadius: BorderRadius.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyCouponText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  couponErrorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  couponHintsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  couponHintLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  couponHintPill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  couponHintText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  appliedCouponBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
  },
  appliedCouponInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appliedCouponCode: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.success,
  },
  appliedCouponDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  appliedDiscountValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.success,
  },
  removeCouponBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  removeCouponText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1EFF6',
    marginBottom: 8,
  },
  selectedPaymentOption: {
    borderColor: Colors.primary,
    backgroundColor: '#FBF9FE',
  },
  paymentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F0F9',
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
    paddingVertical: 6,
  },
  summaryItemTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 10,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F0F9',
    marginVertical: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  confirmButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  emptyCartBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptyCartSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  modalBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 14,
  },
  modalBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 12,
    textAlign: 'center',
  },
  modalNotice: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  amountBox: {
    backgroundColor: '#FAFAFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F0F9',
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
});
