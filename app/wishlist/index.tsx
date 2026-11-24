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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Button from '../../components/common/Button';
import { useWishlist } from '../../context/WishlistContext';
import { formatNaira } from '../../utils/currency';
import { BorderRadius, Shadows } from '../../constants/spacing';

export default function WishlistScreen() {
  const router = useRouter();
  const { items, removeFromWishlist, moveToCart } = useWishlist();

  const handleMoveToCart = (item: any) => {
    moveToCart(item.product);
    Alert.alert(
      'Moved to Cart',
      `${item.product.name} has been moved to your shopping cart.`,
      [
        { text: 'Continue', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist ({items.length})</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/cart')}
          style={styles.cartBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="cart-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={54} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
            <Text style={styles.emptySubtitle}>
              Save items you love by tapping the heart icon on any product card!
            </Text>
            <Button
              title="Explore Products"
              onPress={() => router.push('/products')}
              variant="primary"
              style={{ marginTop: 24, width: 200 }}
            />
          </View>
        ) : (
          <View style={styles.listContainer}>
            {items.map((item) => {
              const product = item.product;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemCard, Shadows.card]}
                  onPress={() => router.push(`/products/${product.id}`)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{
                      uri: product.image_urls[0] || 'https://via.placeholder.com/150',
                    }}
                    style={styles.itemImage}
                  />

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemCategory}>
                      {product.category_name || 'General'}
                    </Text>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.itemPrice}>{formatNaira(product.price)}</Text>

                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.moveToCartBtn}
                        onPress={() => handleMoveToCart(item)}
                      >
                        <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.moveToCartText}>Move to Cart</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => removeFromWishlist(product.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={18} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
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
  cartBtn: {
    width: 38,
    height: 38,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  listContainer: {
    gap: 14,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F0F9',
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F3F0F9',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  itemCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  moveToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.pill,
  },
  moveToCartText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  removeBtn: {
    padding: 6,
  },
});
