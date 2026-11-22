import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useOrders } from '../../context/OrderContext';
import { formatNaira } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { BorderRadius, Shadows } from '../../constants/spacing';
import { OrderStatus } from '../../types';

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, refreshOrders } = useOrders();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'processing' | 'delivered'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filterTabs: { id: 'all' | 'processing' | 'delivered'; label: string }[] = [
    { id: 'all', label: 'All Orders' },
    { id: 'processing', label: 'Processing' },
    { id: 'delivered', label: 'Delivered' },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setIsRefreshing(false);
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === 'all') return true;
    return order.order_status === selectedFilter;
  });

  const getStatusBadgeConfig = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return {
          bg: '#E6F8ED',
          text: '#16A34A',
          label: 'Delivered',
        };
      case 'shipped':
        return {
          bg: '#E8F2FF',
          text: '#2563EB',
          label: 'Shipped',
        };
      case 'processing':
        return {
          bg: '#FEF3E2',
          text: '#D97706',
          label: 'Processing',
        };
      case 'pending':
        return {
          bg: '#F2EBFD',
          text: '#7C3AED',
          label: 'Pending',
        };
      case 'cancelled':
        return {
          bg: '#FEE2E2',
          text: '#EF4444',
          label: 'Cancelled',
        };
      default:
        return {
          bg: '#F2EBFD',
          text: '#7C3AED',
          label: status,
        };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header matching Reference Screen 3 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#171428" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Orders</Text>

        <View style={styles.headerButton} />
      </View>

      {/* 3 Filter Pills: All Orders, Processing, Delivered */}
      <View style={styles.filterBar}>
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setSelectedFilter(tab.id)}
              style={[styles.filterPill, isActive && styles.activeFilterPill]}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.filterPillText, isActive && styles.activeFilterPillText]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>
              You do not have any orders under "{filterTabs.find((t) => t.id === selectedFilter)?.label}".
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const firstItem = order.items[0];
            const badge = getStatusBadgeConfig(order.order_status as OrderStatus);

            return (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.88}
                onPress={() => router.push(`/orders/${order.id}`)}
                style={[styles.orderCard, Shadows.card]}
              >
                {/* Product Thumbnail */}
                <View style={styles.thumbnailWrapper}>
                  {firstItem?.product_image ? (
                    <Image
                      source={{ uri: firstItem.product_image }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="cube-outline" size={30} color="#77738A" />
                  )}
                </View>

                {/* Middle Info: Order Number, Date, Amount */}
                <View style={styles.detailsContainer}>
                  <Text style={styles.orderNumber}>#{order.order_number}</Text>

                  <View style={styles.dateRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color="#77738A"
                      style={styles.calendarIcon}
                    />
                    <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                  </View>

                  <Text style={styles.orderAmount}>{formatNaira(order.total)}</Text>
                </View>

                {/* Right Column: Chevron Top, Status Badge Bottom */}
                <View style={styles.actionColumn}>
                  <Ionicons name="chevron-forward" size={18} color="#A09CB3" />

                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#171428',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#F7F5FC',
  },
  activeFilterPill: {
    backgroundColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#77738A',
  },
  activeFilterPillText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFEBF6',
  },
  thumbnailWrapper: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: '#F8F6FD',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  orderNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#171428',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  calendarIcon: {
    marginRight: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#77738A',
    fontWeight: '500',
  },
  orderAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#171428',
  },
  actionColumn: {
    height: 68,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 2,
    paddingLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#171428',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#77738A',
    textAlign: 'center',
    lineHeight: 18,
  },
});
