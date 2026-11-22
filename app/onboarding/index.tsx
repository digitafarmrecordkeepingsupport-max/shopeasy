import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/colors';
import Button from '../../components/common/Button';
import OnboardingCartIllustration from '../../components/illustrations/OnboardingCartIllustration';
import OnboardingSecurityIllustration from '../../components/illustrations/OnboardingSecurityIllustration';
import OnboardingDeliveryIllustration from '../../components/illustrations/OnboardingDeliveryIllustration';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  heading: string;
  description: string;
  illustration: React.ReactNode;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides: Slide[] = [
    {
      id: '1',
      heading: 'Discover Amazing\nProducts',
      description: 'Find exactly what you need from our wide range of products.',
      illustration: <OnboardingCartIllustration />,
    },
    {
      id: '2',
      heading: 'Shop with\nConfidence',
      description: 'Your transactions are safe and secure.',
      illustration: <OnboardingSecurityIllustration />,
    },
    {
      id: '3',
      heading: 'Fast & Reliable\nDelivery',
      description:
        'Get your orders delivered conveniently and enjoy a smooth shopping experience from start to finish.',
      illustration: <OnboardingDeliveryIllustration />,
    },
  ];

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      await handleFinish();
    }
  };

  const handleSkip = async () => {
    await handleFinish();
  };

  const handleFinish = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Decorative soft purple blobs in corner matching reference */}
      <View style={styles.topBlob} />

      {/* Top Header Row with Skip Button */}
      <View style={styles.headerRow}>
        <View style={{ width: 40 }} />
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Swipeable Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Center Illustration */}
            <View style={styles.illustrationWrapper}>{item.illustration}</View>

            {/* Typography */}
            <View style={styles.textWrapper}>
              <Text style={styles.heading}>{item.heading}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Controls */}
      <View style={styles.footerContainer}>
        {/* Pagination Indicators matching reference (active purple, inactive soft gray) */}
        <View style={styles.paginationRow}>
          {slides.map((_, index) => {
            const isCurrent = currentIndex === index;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  isCurrent ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            );
          })}
        </View>

        {/* Action Button: "Next →" or "Get Started" */}
        <Button
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next →'}
          onPress={handleNext}
          variant="primary"
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  topBlob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F3E8FF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    zIndex: 10,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  illustrationWrapper: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  textWrapper: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 290,
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    alignItems: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 22,
    backgroundColor: Colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#DDD6FE',
  },
  actionButton: {
    width: '100%',
  },
});
