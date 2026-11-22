import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useProducts } from '../../context/ProductContext';
import { BorderRadius, Shadows } from '../../constants/spacing';

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProductById, updateProduct, categories } = useProducts();

  const productId = Array.isArray(id) ? id[0] : id;
  const product = productId ? getProductById(productId) : undefined;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [sku, setSku] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setCategoryId(product.category_id);
      setPrice(product.price.toString());
      setOriginalPrice(product.original_price ? product.original_price.toString() : '');
      setStockQuantity(product.stock_quantity.toString());
      setSku(product.sku);
      setIsFeatured(product.is_featured);
      setIsActive(product.is_active);
      setImageUrls(product.image_urls);
    }
  }, [product]);

  if (!product) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Product not found.</Text>
        <Button title="Back" onPress={() => router.back()} variant="primary" />
      </SafeAreaView>
    );
  }

  const handleUpdate = async () => {
    if (!name.trim() || !price || isNaN(Number(price))) {
      Alert.alert('Required Fields', 'Please ensure product name and valid price are filled.');
      return;
    }

    setIsLoading(true);
    try {
      const selectedCat = categories.find((c) => c.id === categoryId);

      await updateProduct(product.id, {
        name: name.trim(),
        description: description.trim(),
        category_id: categoryId,
        category_name: selectedCat?.name || product.category_name,
        price: Number(price),
        original_price: originalPrice ? Number(originalPrice) : undefined,
        stock_quantity: Number(stockQuantity) || 0,
        sku: sku.trim(),
        is_featured: isFeatured,
        is_active: isActive,
        image_urls: imageUrls,
      });

      Alert.alert('Updated!', `"${name.trim()}" has been updated in the catalogue.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Unable to update product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Product</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardHeading}>Basic Info</Text>

          <Input label="Product Name *" value={name} onChangeText={setName} />
          <Input label="SKU Code" value={sku} onChangeText={setSku} />

          <Text style={styles.inputLabel}>Category</Text>
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
            multiline
            numberOfLines={3}
            containerStyle={{ marginTop: 12 }}
          />
        </View>

        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardHeading}>Pricing & Inventory</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Price (₦) *"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Original Price (₦)"
                value={originalPrice}
                onChangeText={setOriginalPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="Available Stock Quantity *"
            value={stockQuantity}
            onChangeText={setStockQuantity}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardHeading}>Catalogue Status</Text>

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Featured Product</Text>
              <Text style={styles.toggleDesc}>Show on customer homepage</Text>
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
              <Text style={styles.toggleDesc}>Available for customers to order</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#E2E8F0', true: Colors.success }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Button
          title="Save Changes"
          onPress={handleUpdate}
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
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
});
