import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { formatNaira, calculateDiscountPercent } from '../../utils/currency';
import { BorderRadius, Shadows } from '../../constants/spacing';
import { ReviewService } from '../../services/review.service';
import { ProductReview } from '../../types';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProductById } = useProducts();
  const { addToCart, itemCount } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const productId = Array.isArray(id) ? id[0] : id;
  const product = productId ? getProductById(productId) : undefined;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [ratingSummary, setRatingSummary] = useState<{
    average: number;
    count: number;
    breakdown: Record<number, number>;
  }>({
    average: 0,
    count: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Write Review Modal state
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (productId) {
      loadReviews(productId);
    }
  }, [productId]);

  const loadReviews = async (pId: string) => {
    setIsLoadingReviews(true);
    try {
      const [list, summary] = await Promise.all([
        ReviewService.getProductReviews(pId),
        ReviewService.getRatingSummary(pId),
      ]);
      setReviews(list);
      setRatingSummary(summary);
    } catch (e) {
      console.warn('Failed to load reviews:', e);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!newComment.trim()) {
      Alert.alert('Required', 'Please write a brief comment describing your experience.');
      return;
    }
    if (!product) return;

    setIsSubmittingReview(true);
    try {
      const created = await ReviewService.submitReview({
        product_id: product.id,
        customer_name: user?.full_name || 'Customer',
        rating: newRating,
        comment: newComment,
        is_verified_purchase: true,
      });

      setReviews((prev) => [created, ...prev]);
      // Update summary
      await loadReviews(product.id);

      setIsReviewModalVisible(false);
      setNewComment('');
      setNewRating(5);
      Alert.alert('Review Submitted', 'Thank you for sharing your feedback with ShopEasy!');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.notFoundTitle}>Product Not Found</Text>
        <Button
          title="Back to Catalogue"
          onPress={() => router.back()}
          variant="primary"
          style={{ marginTop: 16 }}
        />
      </SafeAreaView>
    );
  }

  const isFavorite = isInWishlist(product.id);
  const discountPercent = calculateDiscountPercent(product.price, product.original_price);
  const isOutOfStock = product.stock_quantity <= 0;

  const currentRating = ratingSummary.count > 0 ? ratingSummary.average : product.rating || 5.0;
  const currentReviewCount = ratingSummary.count > 0 ? ratingSummary.count : product.rating_count || 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      Alert.alert('Out of Stock', 'This item is currently out of stock.');
      return;
    }
    addToCart(product, quantity);
    Alert.alert(
      'Added to Cart!',
      `${quantity}x ${product.name} added to your cart.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      ]
    );
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      Alert.alert('Out of Stock', 'This item is currently out of stock.');
      return;
    }
    addToCart(product, quantity);
    router.push('/checkout');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => toggleWishlist(product)}
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? Colors.error : Colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/cart')}
            style={styles.cartIconWrapper}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="cart-outline" size={24} color={Colors.textPrimary} />
            {itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Badge count={itemCount} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Image Showcase */}
        <View style={styles.imageShowcase}>
          <Image
            source={{ uri: product.image_urls[selectedImageIndex] || product.image_urls[0] }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        {/* Gallery Thumbnails */}
        {product.image_urls.length > 1 && (
          <View style={styles.thumbnailRow}>
            {product.image_urls.map((url, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedImageIndex(idx)}
                style={[
                  styles.thumbnailBox,
                  selectedImageIndex === idx && styles.selectedThumbnailBox,
                ]}
              >
                <Image source={{ uri: url }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Details Section */}
        <View style={styles.detailsCard}>
          {/* Category & Stock Pill */}
          <View style={styles.tagRow}>
            <Text style={styles.categoryTag}>{product.category_name || 'General'}</Text>
            <View
              style={[
                styles.stockBadge,
                { backgroundColor: isOutOfStock ? '#FEE2E2' : '#DCFCE7' },
              ]}
            >
              <Text
                style={[
                  styles.stockBadgeText,
                  { color: isOutOfStock ? Colors.error : Colors.success },
                ]}
              >
                {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock_quantity})`}
              </Text>
            </View>
          </View>

          {/* Product Title */}
          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Rating & Reviews */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              <Ionicons name="star" size={16} color={Colors.accentOrange} />
              <Text style={styles.ratingText}>{currentRating.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewsCount}>
              ({currentReviewCount} reviews)
            </Text>
            <Text style={styles.skuText}>SKU: {product.sku}</Text>
          </View>

          {/* Price Container */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatNaira(product.price)}</Text>
            {product.original_price && product.original_price > product.price ? (
              <Text style={styles.originalPrice}>
                {formatNaira(product.original_price)}
              </Text>
            ) : null}
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionHeading}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>

          <View style={styles.divider} />

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionHeading}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.qtyButton}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>

              <Text style={styles.quantityValue}>{quantity}</Text>

              <TouchableOpacity
                onPress={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                style={styles.qtyButton}
                disabled={quantity >= product.stock_quantity}
              >
                <Ionicons name="add" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Customer Reviews & Ratings Module */}
          <View style={styles.reviewsHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Customer Reviews</Text>
              <View style={styles.averageStarsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(currentRating) ? 'star' : 'star-outline'}
                    size={16}
                    color={Colors.accentOrange}
                  />
                ))}
                <Text style={styles.averageScoreText}>
                  {currentRating.toFixed(1)} out of 5
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.writeReviewButton}
              onPress={() => setIsReviewModalVisible(true)}
            >
              <Ionicons name="create-outline" size={16} color={Colors.primary} />
              <Text style={styles.writeReviewText}>Write Review</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews List */}
          {isLoadingReviews ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : reviews.length === 0 ? (
            <View style={styles.noReviewsBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={32} color={Colors.textLight} />
              <Text style={styles.noReviewsText}>No reviews yet.</Text>
              <Text style={styles.noReviewsSubtext}>Be the first to review this product!</Text>
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {reviews.map((rev) => (
                <View key={rev.id} style={styles.reviewItem}>
                  <View style={styles.reviewItemHeader}>
                    <View style={styles.reviewerAvatar}>
                      <Text style={styles.reviewerAvatarText}>
                        {rev.customer_name ? rev.customer_name[0].toUpperCase() : 'C'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewerName}>{rev.customer_name}</Text>
                      <View style={styles.reviewMetaRow}>
                        <View style={styles.reviewStarsRow}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Ionicons
                              key={s}
                              name={s <= rev.rating ? 'star' : 'star-outline'}
                              size={13}
                              color={Colors.accentOrange}
                            />
                          ))}
                        </View>
                        {rev.is_verified_purchase && (
                          <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                            <Text style={styles.verifiedText}>Verified Purchase</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(rev.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Buttons */}
      <View style={[styles.bottomBar, Shadows.modal]}>
        <TouchableOpacity
          onPress={handleAddToCart}
          style={styles.addToCartButton}
          activeOpacity={0.85}
          disabled={isOutOfStock}
        >
          <Ionicons name="cart-outline" size={20} color={Colors.primary} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBuyNow}
          style={styles.buyNowButton}
          activeOpacity={0.85}
          disabled={isOutOfStock}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {/* Write a Review Modal */}
      <Modal
        visible={isReviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate & Review</Text>
              <TouchableOpacity onPress={() => setIsReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>How would you rate this product?</Text>
            <View style={styles.starSelectorRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setNewRating(star)}
                  style={styles.starTouch}
                >
                  <Ionicons
                    name={star <= newRating ? 'star' : 'star-outline'}
                    size={36}
                    color={Colors.accentOrange}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Your Comments</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Tell other shoppers what you like or dislike about this product..."
              placeholderTextColor={Colors.textLight}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Button
              title="Submit Review"
              onPress={handleSubmitReview}
              variant="primary"
              isLoading={isSubmittingReview}
              style={{ marginTop: 20 }}
            />
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIconWrapper: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginLeft: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageShowcase: {
    width,
    height: width * 0.85,
    backgroundColor: '#F8F6FC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mainImage: {
    width: '90%',
    height: '90%',
    borderRadius: 16,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.accentOrange,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  thumbnailRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 14,
    paddingHorizontal: 20,
  },
  thumbnailBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  selectedThumbnailBox: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  detailsCard: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryTag: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 28,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  reviewsCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  skuText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 'auto',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 14,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 16,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F0F9',
    marginVertical: 14,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F5FC',
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  averageStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  averageScoreText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#EDE9FE',
  },
  writeReviewText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  noReviewsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#FAFAFC',
    borderRadius: 12,
    marginTop: 8,
  },
  noReviewsText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  noReviewsSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reviewsList: {
    marginTop: 8,
    gap: 12,
  },
  reviewItem: {
    backgroundColor: '#FAFAFC',
    borderRadius: 12,
    padding: 14,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  reviewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  reviewStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 11,
    color: Colors.textLight,
  },
  reviewComment: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    flexDirection: 'row',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.button,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  addToCartText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  buyNowButton: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.accentOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#171428',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  starSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 12,
  },
  starTouch: {
    padding: 4,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 10,
    marginBottom: 8,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 90,
  },
});
