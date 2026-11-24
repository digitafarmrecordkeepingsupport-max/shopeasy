import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Logo from '../../components/common/Logo';
import SearchBar from '../../components/common/SearchBar';
import PromoBanner from '../../components/home/PromoBanner';
import CategorySection from '../../components/home/CategorySection';
import ProductCard from '../../components/product/ProductCard';
import Badge from '../../components/common/Badge';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { NotificationService } from '../../services/notification.service';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { products, featuredProducts, categories, refreshProducts, isLoading } = useProducts();
  const { itemCount } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const loadUnread = async () => {
    try {
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadUnread();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshProducts(), loadUnread()]);
    setIsRefreshing(false);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      router.push({
        pathname: '/products',
        params: { search: searchQuery.trim() },
      });
    }
  };

  const displayedProducts = selectedCategory === 'all'
    ? (featuredProducts.length > 0 ? featuredProducts : products.slice(0, 6))
    : products.filter((p) => p.category_id === selectedCategory);

  const recentlyAdded = products
    .filter((p) => !displayedProducts.some((dp) => dp.id === p.id))
    .slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        {/* Left ShopEasy Logo */}
        <Logo variant="dark" size="small" />

        {/* Right Action Icons: Notifications & Cart */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => router.push('/notifications')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
            {unreadCount > 0 && (
              <View style={styles.badgeWrapper}>
                <Badge count={unreadCount} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => router.push('/(tabs)/cart')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="cart-outline" size={24} color={Colors.textPrimary} />
            {itemCount > 0 && (
              <View style={styles.badgeWrapper}>
                <Badge count={itemCount} />
              </View>
            )}
          </TouchableOpacity>
        </View>
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
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          placeholder="Search for products, brands, categories..."
          style={styles.searchBar}
        />

        {/* Promotional Banner */}
        <PromoBanner />

        {/* Shop by Category */}
        <CategorySection
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSelectCategory={(id) => {
            setSelectedCategory(id === selectedCategory ? 'all' : id);
          }}
        />

        {/* Featured Products Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'Featured Products' : 'Products in Category'}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/products')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.seeAllText}>See All →</Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {isLoading && products.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : displayedProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedCategory !== 'all'
                ? 'Try selecting another category or check back later.'
                : 'Products added from the admin dashboard will appear here.'}
            </Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        )}

        {/* Recently Added Section (when in "all" view and more products exist) */}
        {selectedCategory === 'all' && recentlyAdded.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>Recently Added</Text>
              <TouchableOpacity
                onPress={() => router.push('/products')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.seeAllText}>See All →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.productGrid}>
              {recentlyAdded.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          </>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconButton: {
    position: 'relative',
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrapper: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  searchBar: {
    marginTop: 6,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
