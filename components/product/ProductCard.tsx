import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import Colors from '../../constants/colors';
import { formatNaira, calculateDiscountPercent } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Shadows, BorderRadius } from '../../constants/spacing';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ProductCardProps {
  product: Product;
  onAddToCartSuccess?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCartSuccess,
}) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorite = isInWishlist(product.id);
  const discountPercent = calculateDiscountPercent(product.price, product.original_price);

  const handleCardPress = () => {
    router.push({
      pathname: '/products/[id]',
      params: { id: product.id },
    });
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    addToCart(product, 1);
    if (onAddToCartSuccess) {
      onAddToCartSuccess();
    }
  };

  const handleToggleFavorite = (e: any) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handleCardPress}
      style={[styles.card, Shadows.card]}
    >
      {/* Product Image Area */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image_urls[0] }}
          style={styles.productImage}
          resizeMode="cover"
        />

        {/* Favorite Heart Icon Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleToggleFavorite}
          style={styles.favoriteButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? Colors.error : Colors.textMuted}
          />
        </TouchableOpacity>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}
      </View>

      {/* Product Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatNaira(product.price)}</Text>
            {product.original_price && product.original_price > product.price ? (
              <Text style={styles.originalPrice}>
                {formatNaira(product.original_price)}
              </Text>
            ) : null}
          </View>

          {/* Purple Circular Add-To-Cart Button matching reference */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddToCart}
            style={styles.cartButton}
          >
            <Ionicons name="cart-outline" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F0F9',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.95,
    backgroundColor: '#F8F6FC',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '90%',
    height: '90%',
    borderRadius: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.accentOrange,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  infoContainer: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  originalPrice: {
    fontSize: 11,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  cartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});

export default ProductCard;
