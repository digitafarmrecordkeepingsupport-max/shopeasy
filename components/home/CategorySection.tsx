import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../../types';
import Colors from '../../constants/colors';

interface CategorySectionProps {
  categories: Category[];
  selectedCategoryId?: string;
  onSelectCategory?: (id: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const router = useRouter();

  const handleCategoryPress = (category: Category) => {
    if (category.id === 'cat-more') {
      router.push('/(tabs)/categories');
      return;
    }

    if (onSelectCategory) {
      onSelectCategory(category.id);
    } else {
      router.push({
        pathname: '/products',
        params: { category: category.id },
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
      </View>

      <View style={styles.iconsRow}>
        {categories.slice(0, 5).map((category) => {
          const isSelected = selectedCategoryId === category.id;

          // Category icon color mappings from reference
          const colorStyles: Record<string, { bg: string; iconColor: string }> = {
            'cat-fashion': { bg: '#FFE4E6', iconColor: '#E11D48' },
            'cat-electronics': { bg: '#DBEAFE', iconColor: '#2563EB' },
            'cat-home': { bg: '#FEF3C7', iconColor: '#D97706' },
            'cat-beauty': { bg: '#FCE7F3', iconColor: '#DB2777' },
            'cat-more': { bg: '#EDE9FE', iconColor: Colors.primary },
          };

          const activeStyle = colorStyles[category.id] || {
            bg: '#F3E8FF',
            iconColor: Colors.primary,
          };

          return (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.8}
              onPress={() => handleCategoryPress(category)}
              style={styles.categoryItem}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: activeStyle.bg },
                  isSelected && styles.selectedCircle,
                ]}
              >
                <Ionicons
                  name={category.icon_name as any}
                  size={24}
                  color={activeStyle.iconColor}
                />
              </View>
              <Text
                style={[
                  styles.categoryName,
                  isSelected && styles.selectedCategoryName,
                ]}
                numberOfLines={1}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryItem: {
    alignItems: 'center',
    width: 60,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  selectedCircle: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default CategorySection;
