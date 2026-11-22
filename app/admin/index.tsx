import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import StatCard from '../../components/admin/StatCard';
import RevenueChart from '../../components/admin/RevenueChart';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { formatNaira } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { AdminStats, OrderStatus } from '../../types';
import { BorderRadius, Shadows } from '../../constants/spacing';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { switchRole, user } = useAuth();
  const { orders, getAdminStats, refreshOrders } = useOrders();
  const { products, refreshProducts } = useProducts();

  const [stats, setStats] = useState<AdminStats>({
    total_products: 8,
    total_orders: 2,
    pending_orders: 1,
    total_customers: 12,
    total_sales: 98000,
    monthly_revenue: [
      { month: 'Jun', amount: 180000 },
      { month: 'Jul', amount: 240000 },
      { month: 'Aug', amount: 310000 },
      { month: 'Sep', amount: 290000 },
      { month: 'Oct', amount: 420000 },
      { month: 'Nov', amount: 390000 },
    ],
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardStats();
  }, [orders.length, products.length]);

  const loadDashboardStats = async () => {
    const data = await getAdminStats();
    setStats(data);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshOrders(), refreshProducts()]);
    await loadDashboardStats();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Admin Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.ownerBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
            <Text style={styles.ownerBadgeText}>Store Owner</Text>
          </View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
        </View>

        <TouchableOpacity
          onPress={async () => {
            await switchRole('customer');
            router.replace('/(tabs)');
          }}
          style={styles.switchButton}
        >
          <Ionicons name="storefront-outline" size={16} color={Colors.primary} />
          <Text style={styles.switchButtonText}>Customer View</Text>
        </TouchableOpacity>
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
        {/* Quick Action Navigation Grid */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: Colors.primary }]}
            onPress={() => router.push('/admin/add-product')}
            activeOpacity={0.88}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionTitle}>Add Product</Text>
            <Text style={styles.quickActionDesc}>Upload new item</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: '#3B087D' }]}
            onPress={() => router.push('/admin/products')}
            activeOpacity={0.88}
          >
            <Ionicons name="cube-outline" size={24} color="#FFFFFF" />
            <Text style={styles.quickActionTitle}>Catalogue</Text>
            <Text style={styles.quickActionDesc}>{products.length} Products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: Colors.accentOrange }]}
            onPress={() => router.push('/admin/orders')}
            activeOpacity={0.88}
          >
            <Ionicons name="receipt-outline" size={24} color="#171428" />
            <Text style={[styles.quickActionTitle, { color: '#171428' }]}>Orders</Text>
            <Text style={[styles.quickActionDesc, { color: '#171428' }]}>
              {orders.length} Total
            </Text>
          </TouchableOpacity>
        </View>

        {/* Business Metrics Cards */}
        <Text style={styles.sectionHeader}>Performance Overview</Text>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Revenue"
            value={formatNaira(stats.total_sales)}
            icon="cash-outline"
            color={Colors.primary}
            subtext="+18.4% this month"
          />

          <StatCard
            title="Total Orders"
            value={stats.total_orders}
            icon="cart-outline"
            color={Colors.accentOrange}
            subtext={`${stats.pending_orders} pending fulfillment`}
          />

          <StatCard
            title="Active Products"
            value={products.filter((p) => p.is_active).length}
            icon="pricetags-outline"
            color="#2563EB"
            subtext={`${products.length} in catalogue`}
          />

          <StatCard
            title="Total Customers"
            value={stats.total_customers}
            icon="people-outline"
            color="#16A34A"
            subtext="Active buyers"
          />
        </View>

        {/* Sales & Revenue Chart */}
        <RevenueChart data={stats.monthly_revenue} />

        {/* Recent Orders Overview */}
        <View style={styles.recentOrdersHeader}>
          <Text style={styles.sectionHeader}>Recent Customer Orders</Text>
          <TouchableOpacity onPress={() => router.push('/admin/orders')}>
            <Text style={styles.seeAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {orders.slice(0, 3).map((order) => (
          <TouchableOpacity
            key={order.id}
            onPress={() => router.push(`/orders/${order.id}`)}
            style={[styles.recentOrderCard, Shadows.card]}
          >
            <View style={styles.orderTopRow}>
              <View>
                <Text style={styles.recentOrderNumber}>Order #{order.order_number}</Text>
                <Text style={styles.customerName}>
                  {order.customer_name} • {order.customer_phone || order.customer_email}
                </Text>
              </View>
              <Badge variant="status" status={order.order_status as OrderStatus} />
            </View>

            <View style={styles.orderBottomRow}>
              <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
              <Text style={styles.orderTotal}>{formatNaira(order.total)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 4,
  },
  ownerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.pill,
    gap: 6,
  },
  switchButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    marginTop: 6,
  },
  quickActionDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recentOrdersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  recentOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recentOrderNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  customerName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  orderBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F0F9',
  },
  orderDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
});
