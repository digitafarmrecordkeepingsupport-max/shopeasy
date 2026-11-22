import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/colors';
import SplashBagIllustration from '../components/illustrations/SplashBagIllustration';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { hasCompletedOnboarding, isAuthenticated, isLoading } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous subtle loader rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Navigate after splash display delay
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (!hasCompletedOnboarding) {
          router.replace('/onboarding');
        } else if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }
    }, 2400);

    return () => clearTimeout(timer);
  }, [hasCompletedOnboarding, isAuthenticated, isLoading]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#4A0D9B', '#6515D5', '#3B087D']}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 0.9, y: 0.9 }}
      style={styles.container}
    >
      {/* Decorative background circles */}
      <View style={styles.topDecorativeCircle} />
      <View style={styles.bottomDecorativeCircle} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Shopping Bag Illustration matching reference */}
        <SplashBagIllustration />

        {/* Brand Typography */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>
            <Text style={styles.brandWhite}>Shop</Text>
            <Text style={styles.brandOrange}>Easy</Text>
          </Text>
          <Text style={styles.tagline}>Shop Smarter. Live Better.</Text>
        </View>
      </Animated.View>

      {/* Animated Circular Loader near the bottom matching reference */}
      <View style={styles.loaderContainer}>
        <Animated.View
          style={[
            styles.spinnerRing,
            { transform: [{ rotate: spin }] },
          ]}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topDecorativeCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  bottomDecorativeCircle: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 18,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandWhite: {
    color: '#FFFFFF',
  },
  brandOrange: {
    color: Colors.accentOrange,
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.3,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderTopColor: '#FFFFFF',
  },
});
