import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/colors';
import Logo from '../../components/common/Logo';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { BorderRadius, Shadows } from '../../constants/spacing';

const { width } = Dimensions.get('window');
const GRID_HORIZONTAL_PADDING = 18;
const GRID_GAP = 12;
const CARD_WIDTH = (width - GRID_HORIZONTAL_PADDING * 2 - GRID_GAP * 2) / 3;

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories } = useProducts();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBannerDot, setActiveBannerDot] = useState(0);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: '/products',
      params: { category: categoryId },
    });
  };

  const handleNotificationPress = () => {
    Alert.alert(
      'Notifications (2)',
      '1. Order #SE20251125-001 has been delivered.\n2. Weekend Flash Sale: Up to 50% off across all categories!'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header matching Reference Screen 1 */}
      <View style={styles.header}>
        {/* Left: ShopEasy Logo */}
        <Logo variant="dark" size="small" />

        {/* Right: Notifications (with red badge 2) + Cart Icon */}
        <View style={styles.headerRightIcons}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleNotificationPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="notifications-outline" size={23} color="#171428" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => router.push('/(tabs)/cart')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="cart-outline" size={24} color="#171428" />
            {itemCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Input Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#77738A"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for categories..."
            placeholderTextColor="#A09CB3"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Ionicons name="close-circle" size={18} color="#A09CB3" />
            </TouchableOpacity>
          )}
        </View>

        {/* Primary Promotional Banner: "Shop by Category" */}
        <LinearGradient
          colors={['#6515D5', '#45099B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.primaryBanner, Shadows.card]}
        >
          {/* Banner Left Copy */}
          <View style={styles.bannerLeftContent}>
            <Text style={styles.bannerHeading}>Shop by</Text>
            <Text style={styles.bannerHeading}>Category</Text>
            <Text style={styles.bannerSubtitle}>Find what you love</Text>

            <TouchableOpacity
              style={styles.bannerOrangeButton}
              onPress={() => router.push('/products')}
              activeOpacity={0.85}
            >
              <Text style={styles.bannerOrangeButtonText}>Shop Now →</Text>
            </TouchableOpacity>
          </View>

          {/* Banner Right Image (White Over-Ear Headphones) */}
          <View style={styles.bannerImageContainer}>
            <View style={styles.bannerImageHalo} />
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
              }}
              style={styles.bannerHeadphonesImage}
              resizeMode="contain"
            />
          </View>

          {/* 3 Pagination Dots */}
          <View style={styles.paginationDotsContainer}>
            <View style={[styles.paginationDot, styles.paginationDotActive]} />
            <View style={styles.paginationDot} />
            <View style={styles.paginationDot} />
          </View>
        </LinearGradient>

        {/* "All Categories" Header Row */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>All Categories</Text>
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              router.push('/products');
            }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.seeAllText}>See All →</Text>
          </TouchableOpacity>
        </View>

        {/* 3-Column Category Grid */}
        {filteredCategories.length === 0 ? (
          <View style={styles.noCategoriesBox}>
            <Text style={styles.noCategoriesText}>No categories matching "{searchQuery}"</Text>
          </View>
        ) : (
          <View style={styles.categoriesGrid}>
            {filteredCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryGridItem, { width: CARD_WIDTH }]}
                onPress={() => handleCategoryPress(cat.id)}
                activeOpacity={0.82}
              >
                <View
                  style={[
                    styles.categoryTile,
                    { backgroundColor: cat.color || '#F7F5FC' },
                  ]}
                >
                  {cat.image_url ? (
                    <Image
                      source={{ uri: cat.image_url }}
                      style={styles.categoryTileImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons
                      name={(cat.icon_name as any) || 'grid-outline'}
                      size={32}
                      color={Colors.primary}
                    />
                  )}
                </View>

                <Text style={styles.categoryNameText} numberOfLines={1}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Secondary Promotional Banner: "Up to 50% OFF" */}
        <LinearGradient
          colors={['#F5EEFD', '#EAE0F9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.secondaryBanner, Shadows.card]}
        >
          {/* Decorative floating bubbles in background */}
          <View style={styles.decorativeBubbleLarge} />
          <View style={styles.decorativeBubbleSmall} />

          {/* Left Text & CTA */}
          <View style={styles.bannerLeftContent}>
            <Text style={styles.secBannerUpTo}>Up to</Text>
            <Text style={styles.secBannerDiscount}>50% OFF</Text>
            <Text style={styles.secBannerSubtitle}>On Selected Items</Text>

            <TouchableOpacity
              style={styles.bannerOrangeButton}
              onPress={() => router.push('/products')}
              activeOpacity={0.85}
            >
              <Text style={styles.bannerOrangeButtonText}>Shop Now →</Text>
            </TouchableOpacity>
          </View>

          {/* Right Image: White street sneakers */}
          <View style={styles.secBannerImageContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop',
              }}
              style={styles.secBannerSneakersImage}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 36,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F5FC',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEBF6',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#171428',
    height: '100%',
  },
  primaryBanner: {
    borderRadius: 20,
    padding: 18,
    paddingBottom: 26,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    minHeight: 154,
  },
  bannerLeftContent: {
    flex: 1.1,
    justifyContent: 'center',
    zIndex: 2,
  },
  bannerHeading: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 25,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
    marginBottom: 12,
    fontWeight: '500',
  },
  bannerOrangeButton: {
    backgroundColor: Colors.accentOrange,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.pill,
    alignSelf: 'flex-start',
  },
  bannerOrangeButtonText: {
    color: '#171428',
    fontSize: 12,
    fontWeight: '700',
  },
  bannerImageContainer: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  bannerImageHalo: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  bannerHeadphonesImage: {
    width: 110,
    height: 110,
    transform: [{ rotate: '-10deg' }],
  },
  paginationDotsContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    width: 14,
    backgroundColor: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#171428',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  categoryGridItem: {
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTile: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECE7F5',
  },
  categoryTileImage: {
    width: '100%',
    height: '100%',
  },
  categoryNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#171428',
    marginTop: 7,
    textAlign: 'center',
  },
  noCategoriesBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  noCategoriesText: {
    fontSize: 14,
    color: '#77738A',
  },
  secondaryBanner: {
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    minHeight: 146,
    borderWidth: 1,
    borderColor: '#EFEBF8',
  },
  decorativeBubbleLarge: {
    position: 'absolute',
    right: 15,
    top: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(101, 21, 213, 0.08)',
  },
  decorativeBubbleSmall: {
    position: 'absolute',
    right: 110,
    bottom: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(101, 21, 213, 0.06)',
  },
  secBannerUpTo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#55516B',
  },
  secBannerDiscount: {
    fontSize: 25,
    fontWeight: '900',
    color: '#171428',
    lineHeight: 28,
    marginVertical: 1,
  },
  secBannerSubtitle: {
    fontSize: 12,
    color: '#55516B',
    marginBottom: 12,
    fontWeight: '500',
  },
  secBannerImageContainer: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  secBannerSneakersImage: {
    width: 116,
    height: 100,
    transform: [{ rotate: '-12deg' }],
  },
});
