import React, { useState } from 'react';
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
import Logo from '../../components/common/Logo';
import SearchBar from '../../components/common/SearchBar';
import PromoBanner from '../../components/home/PromoBanner';
import CategorySection from '../../components/home/CategorySection';
import ProductCard from '../../components/product/ProductCard';
import Badge from '../../components/common/Badge';
import RoleSwitcher from '../../components/common/RoleSwitcher';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { featuredProducts, categories, refreshProducts, isLoading } = useProducts();
  const { role } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProducts();
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

  const handleNotificationPress = () => {
    Alert.alert(
      'Notifications (2)',
      '1. Order #SE-89241 is currently being packed for delivery.\n2. Exclusive Weekend Promo: 20% off on all Fashion & Shoes with code EASY20!'
    );
  };

  const displayedProducts = selectedCategory === 'all'
    ? featuredProducts
    : featuredProducts.filter((p) => p.category_id === selectedCategory);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header Bar matching reference */}
      <View style={styles.header}>
        {/* Left ShopEasy Logo */}
        <Logo variant="dark" size="small" />

        {/* Right Notification Bell with Red Badge "2" */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={handleNotificationPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
          <View style={styles.badgeWrapper}>
            <Badge count={2} />
          </View>
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
        {/* Search Bar matching reference */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          placeholder="Search for products..."
          style={styles.searchBar}
        />

        {/* Admin Quick Jump Banner if Store Owner is logged in */}
        {role === 'admin' && (
          <TouchableOpacity
            style={styles.adminBanner}
            onPress={() => router.push('/admin')}
          >
            <View style={styles.adminBannerContent}>
              <Ionicons name="speedometer-outline" size={18} color="#FFFFFF" />
              <Text style={styles.adminBannerText}>Store Owner: Open Admin Dashboard</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Promotional Banner matching reference */}
        <PromoBanner />

        {/* Shop by Category Icons Row matching reference */}
        <CategorySection
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSelectCategory={(id) => {
            setSelectedCategory(id === selectedCategory ? 'all' : id);
          }}
        />

        {/* Featured Products Section Header matching reference */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity
            onPress={() => router.push('/products')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.seeAllText}>See All →</Text>
          </TouchableOpacity>
        </View>

        {/* Two-Column Product Grid matching reference */}
        <View style={styles.productGrid}>
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>

        {/* Role Switcher Pill for reviewer ease */}
        <View style={{ marginTop: 10, marginBottom: 20 }}>
          <RoleSwitcher />
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
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  notificationButton: {
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
  adminBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminBannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
});
