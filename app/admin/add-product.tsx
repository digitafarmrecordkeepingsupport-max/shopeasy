import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../../constants/colors';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useProducts } from '../../context/ProductContext';
import { BorderRadius, Shadows } from '../../constants/spacing';

export default function AddProductScreen() {
  const router = useRouter();
  const { addProduct, categories } = useProducts();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-fashion');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [sku, setSku] = useState('SE-' + Math.floor(100 + Math.random() * 900));
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Images state
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setImageUrls([...imageUrls, result.assets[0].uri]);
      }
    } catch (e) {
      Alert.alert('Image Picker', 'To select photos from gallery on device, ensure photo permissions are granted.');
    }
  };

  const handleAddCustomUrl = () => {
    if (customImageUrl.trim().startsWith('http')) {
      setImageUrls([...imageUrls, customImageUrl.trim()]);
      setCustomImageUrl('');
    } else {
      Alert.alert('Invalid URL', 'Please enter a valid https image URL.');
    }
  };

  const handleRemoveImage = (index: number) => {
    if (imageUrls.length <= 1) {
      Alert.alert('Image Required', 'At least one product image is required.');
      return;
    }
    setImageUrls(imageUrls.filter((_, idx) => idx !== index));
  };

  const handleSaveProduct = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a product name.');
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid numeric price.');
      return;
    }

    if (!stockQuantity || isNaN(Number(stockQuantity))) {
      Alert.alert('Invalid Stock', 'Please enter the available stock quantity.');
      return;
    }

    if (imageUrls.length === 0) {
      Alert.alert('Image Required', 'Please provide at least one product image.');
      return;
    }

    setIsLoading(true);
    try {
      const selectedCategoryObj = categories.find((c) => c.id === categoryId);

      await addProduct({
        name: name.trim(),
        description: description.trim() || 'Premium quality product from ShopEasy.',
        category_id: categoryId,
        category_name: selectedCategoryObj?.name || 'General',
        price: Number(price),
        original_price: originalPrice ? Number(originalPrice) : undefined,
        stock_quantity: Number(stockQuantity),
        sku: sku.trim() || 'SE-PROD-' + Date.now().toString(36).toUpperCase(),
        image_urls: imageUrls,
        is_featured: isFeatured,
        is_active: isActive,
        rating: 5.0,
        rating_count: 1,
      });

      Alert.alert('Success! 🎉', `"${name.trim()}" has been added to the catalogue and is now live.`, [
        {
          text: 'View Catalogue',
          onPress: () => router.replace('/admin/products'),
        },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Unable to save product');
    } finally {
      setIsLoading(false);
    }
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
        <Text style={styles.headerTitle}>Add New Product</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Basic Details Card */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardHeading}>Product Information</Text>

          <Input
            label="Product Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Wireless Noise-Cancelling Earbuds"
          />

          <Input
            label="SKU Code"
            value={sku}
            onChangeText={setSku}
            placeholder="e.g. SE-EAR-001"
            autoCapitalize="characters"
          />

          <Text style={styles.inputLabel}>Category *</Text>
          <View style={styles.categoryPillsRow}>
            {categories.map((c) => {
              const isSelected = categoryId === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCategoryId(c.id)}
                  style={[styles.categoryPill, isSelected && styles.activeCategoryPill]}
                >
                  <Text style={[styles.categoryPillText, isSelected && styles.activeCategoryPillText]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Detailed features, materials, and specifications..."
            multiline
            numberOfLines={3}
            containerStyle={{ marginTop: 12 }}
          />
        </View>

        {/* Pricing & Stock Card */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardHeading}>Pricing & Inventory</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Price (₦) *"
                value={price}
                onChangeText={setPrice}
                placeholder="25000"
                keyboardType="numeric"
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Original Price (₦)"
                value={originalPrice}
                onChangeText={setOriginalPrice}
                placeholder="30000"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="Available Stock Quantity *"
            value={stockQuantity}
            onChangeText={setStockQuantity}
            placeholder="e.g. 20"
            keyboardType="numeric"
          />
        </View>

        {/* Product Images Card */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardHeading}>Product Images</Text>
          <Text style={styles.cardSubtitle}>Upload from device gallery or paste image URL.</Text>

          {/* Image Previews */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
            {imageUrls.map((uri, idx) => (
              <View key={idx} style={styles.imagePreviewBox}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity
                  onPress={() => handleRemoveImage(idx)}
                  style={styles.removeImageBadge}
                >
                  <Ionicons name="close" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity onPress={handlePickImage} style={styles.uploadPlaceholder}>
              <Ionicons name="camera-outline" size={28} color={Colors.primary} />
              <Text style={styles.uploadPlaceholderText}>Upload</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Image URL Input */}
          <View style={styles.urlInputRow}>
            <Input
              value={customImageUrl}
              onChangeText={setCustomImageUrl}
              placeholder="Paste https image URL..."
              containerStyle={{ flex: 1, marginBottom: 0 }}
            />
            <TouchableOpacity onPress={handleAddCustomUrl} style={styles.addUrlButton}>
              <Text style={styles.addUrlButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Visibility & Badges Card */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardHeading}>Visibility Options</Text>

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Featured Product</Text>
              <Text style={styles.toggleDesc}>Highlight on customer home screen</Text>
            </View>
            <Switch
              value={isFeatured}
              onValueChange={setIsFeatured}
              trackColor={{ false: '#E2E8F0', true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Active in Catalogue</Text>
              <Text style={styles.toggleDesc}>Visible to customers for purchase</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#E2E8F0', true: Colors.success }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Save CTA */}
        <Button
          title="Save & Publish Product"
          onPress={handleSaveProduct}
          variant="primary"
          isLoading={isLoading}
          style={{ marginBottom: 30 }}
        />
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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  categoryPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#F7F5FC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeCategoryPill: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeCategoryPillText: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
  },
  imagesRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  imagePreviewBox: {
    width: 80,
    height: 80,
    borderRadius: 14,
    marginRight: 10,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  removeImageBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF7FE',
  },
  uploadPlaceholderText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  urlInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addUrlButton: {
    backgroundColor: Colors.primary,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.input,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addUrlButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  toggleDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F0F9',
    marginVertical: 10,
  },
});
