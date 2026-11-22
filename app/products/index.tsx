import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import SearchBar from '../../components/common/SearchBar';
import ProductCard from '../../components/product/ProductCard';
import { useProducts } from '../../context/ProductContext';
import { BorderRadius } from '../../constants/spacing';

const { width } = Dimensions.get('window');

export default function ProductListingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const { products, categories } = useProducts();

  const [searchQuery, setSearchQuery] = useState(typeof params.search === 'string' ? params.search : '');
  const [selectedCategory, setSelectedCategory] = useState<string>(typeof params.category === 'string' ? params.category : 'all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'newest'>('featured');

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.is_active);

    // Filter by Category
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((p) => p.category_id === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.category_name && p.category_name.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'featured') {
      result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/cart')}
          style={styles.cartButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="cart-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products..."
        />
      </View>

      {/* Category Pills */}
      <View style={styles.categoryScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPills}>
          <TouchableOpacity
            onPress={() => setSelectedCategory('all')}
            style={[
              styles.categoryPill,
              selectedCategory === 'all' && styles.activeCategoryPill,
            ]}
          >
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === 'all' && styles.activeCategoryPillText,
              ]}
            >
              All Items
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryPill,
                  isSelected && styles.activeCategoryPill,
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.activeCategoryPillText,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Sorting bar & Result Count */}
      <View style={styles.sortingBar}>
        <Text style={styles.resultCount}>
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </Text>

        <View style={styles.sortOptions}>
          <TouchableOpacity
            onPress={() => {
              if (sortBy === 'featured') setSortBy('price_asc');
              else if (sortBy === 'price_asc') setSortBy('price_desc');
              else if (sortBy === 'price_desc') setSortBy('newest');
              else setSortBy('featured');
            }}
            style={styles.sortButton}
          >
            <Ionicons name="swap-vertical" size={16} color={Colors.primary} />
            <Text style={styles.sortButtonText}>
              {sortBy === 'featured' && 'Featured'}
              {sortBy === 'price_asc' && 'Price: Low-High'}
              {sortBy === 'price_desc' && 'Price: High-Low'}
              {sortBy === 'newest' && 'Newest'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Grid */}
      <ScrollView
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No matching products</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search terms or category filters.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </View>
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
    paddingVertical: 12,
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
  cartButton: {
    width: 38,
    height: 38,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  categoryScrollWrapper: {
    marginBottom: 10,
  },
  categoryPills: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#F7F5FC',
  },
  activeCategoryPill: {
    backgroundColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeCategoryPillText: {
    color: '#FFFFFF',
  },
  sortingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  gridContainer: {
    padding: 20,
    paddingBottom: 36,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
