import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../../types';
import Colors from '../../constants/colors';
import { formatNaira } from '../../utils/currency';
import { BorderRadius, Shadows } from '../../constants/spacing';
import { useWishlist } from '../../context/WishlistContext';

interface CartItemCardProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) => {
  const { product, quantity } = item;
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  return (
    <View style={[styles.card, Shadows.card]}>
      {/* Product Image */}
      <View style={styles.thumbnailWrapper}>
        <Image
          source={{ uri: product.image_urls[0] }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      </View>

      {/* Middle: Details & Stepper */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>

        {/* Price Row: Current Price + Strikethrough Original Price */}
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>{formatNaira(product.price)}</Text>
          {product.original_price && product.original_price > product.price && (
            <Text style={styles.originalPrice}>
              {formatNaira(product.original_price)}
            </Text>
          )}
        </View>

        {/* Bottom Stepper */}
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            onPress={onDecrease}
            style={styles.stepButton}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="remove" size={15} color={Colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity
            onPress={onIncrease}
            style={styles.stepButton}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="add" size={15} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Right Column: Wishlist Heart on Top, Trash Delete on Bottom */}
      <View style={styles.actionColumn}>
        <TouchableOpacity
          onPress={() => toggleWishlist(product)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.actionButton}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={20}
            color={Colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={19} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFEBF6',
  },
  thumbnailWrapper: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: '#F7F5FC',
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
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171428',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  currentPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: '#A09CB3',
    textDecorationLine: 'line-through',
    marginLeft: 8,
    fontWeight: '500',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#EAE6F3',
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  stepButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#171428',
    minWidth: 20,
    textAlign: 'center',
  },
  actionColumn: {
    height: 76,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 2,
    paddingLeft: 6,
  },
  actionButton: {
    padding: 4,
  },
});

export default CartItemCard;
