import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/colors';
import { BorderRadius, Shadows } from '../../constants/spacing';

const { width } = Dimensions.get('window');

const BANNERS = [
  {
    id: '1',
    titleLine1: 'Big Deals',
    titleLine2: 'Big Savings!',
    subtitle: 'Up to 50% OFF',
    buttonText: 'Shop Now →',
    // Studio Pro Headphones matching the reference image visual
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
    targetCategory: 'cat-electronics',
  },
  {
    id: '2',
    titleLine1: 'Urban Style',
    titleLine2: 'New Season',
    subtitle: 'Up to 40% OFF',
    buttonText: 'Discover →',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop',
    targetCategory: 'cat-fashion',
  },
  {
    id: '3',
    titleLine1: 'Smart Living',
    titleLine2: 'Modern Home',
    subtitle: 'Flat 30% OFF',
    buttonText: 'Explore →',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop',
    targetCategory: 'cat-home',
  },
];

export const PromoBanner: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const currentBanner = BANNERS[activeIndex];

  const handlePress = () => {
    router.push({
      pathname: '/products',
      params: { category: currentBanner.targetCategory },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={handlePress}
        style={[styles.bannerCard, Shadows.card]}
      >
        {/* Decorative Floating Circle Accent matching reference */}
        <View style={styles.accentCircle} />
        <View style={styles.softGlow} />

        {/* Left Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentBanner.titleLine1}</Text>
          <Text style={styles.title}>{currentBanner.titleLine2}</Text>
          <Text style={styles.subtitle}>{currentBanner.subtitle}</Text>

          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>{currentBanner.buttonText}</Text>
          </View>
        </View>

        {/* Right Product Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: currentBanner.imageUrl }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>
      </TouchableOpacity>

      {/* Carousel Pagination Dots */}
      <View style={styles.paginationRow}>
        {BANNERS.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setActiveIndex(index)}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
    width: '100%',
  },
  bannerCard: {
    backgroundColor: Colors.primary,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 160,
    overflow: 'hidden',
    position: 'relative',
  },
  accentCircle: {
    position: 'absolute',
    top: 24,
    left: width * 0.44,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accentOrange,
  },
  softGlow: {
    position: 'absolute',
    bottom: -30,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  textContainer: {
    flex: 1.1,
    justifyContent: 'center',
    zIndex: 2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#E9D5FF',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 12,
  },
  ctaButton: {
    backgroundColor: Colors.accentOrange,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.pill,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: '#171428',
    fontSize: 12,
    fontWeight: '700',
  },
  imageWrapper: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  bannerImage: {
    width: 125,
    height: 125,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 18,
    backgroundColor: Colors.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#DDD6FE',
  },
});

export default PromoBanner;
