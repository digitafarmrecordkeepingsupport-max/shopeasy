import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

export const OnboardingSecurityIllustration: React.FC = () => {
  const size = Math.min(width * 0.72, 280);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg viewBox="0 0 280 280" width={size} height={size}>
        <Defs>
          {/* Shield Gradient */}
          <LinearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#7C3AED" />
            <Stop offset="100%" stopColor="#4A0D9B" />
          </LinearGradient>

          {/* Credit Card Gradient */}
          <LinearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#6D28D9" />
            <Stop offset="100%" stopColor="#310967" />
          </LinearGradient>

          {/* Leaf Gradient */}
          <LinearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#A7F3D0" />
            <Stop offset="100%" stopColor="#34D399" />
          </LinearGradient>
        </Defs>

        {/* Soft ground shadow */}
        <Circle cx="140" cy="245" r="75" fill="#E8E2F5" opacity="0.6" scaleY="0.25" />

        {/* Decorative Green Leaves Behind Shield */}
        <Path
          d="M80 215C50 180 55 130 90 100C90 140 105 180 130 200C110 215 95 218 80 215Z"
          fill="url(#leafGrad)"
          opacity="0.8"
        />
        <Path
          d="M100 190C85 160 88 120 115 100C115 130 125 160 145 180Z"
          fill="#6EE7B7"
          opacity="0.5"
        />

        {/* Security Shield */}
        <Path
          d="M130 50L60 76V134C60 184 92 226 130 238C168 226 200 184 200 134V76L130 50Z"
          fill="url(#shieldGrad)"
        />

        {/* White Padlock on Shield */}
        {/* Shackle */}
        <Path
          d="M116 112V98C116 88 122 82 130 82C138 82 144 88 144 98V112"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Lock Body */}
        <Rect x="108" y="110" width="44" height="34" rx="8" fill="#FFFFFF" />
        {/* Keyhole */}
        <Circle cx="130" cy="123" r="3.5" fill={Colors.primary} />
        <Path d="M130 125V132" stroke={Colors.primary} strokeWidth="3" strokeLinecap="round" />

        {/* Credit Card in Front */}
        <G transform="translate(130, 130) rotate(-6)">
          <Rect x="0" y="0" width="112" height="70" rx="10" fill="url(#cardGrad)" />
          {/* Card Magnetic Stripe */}
          <Rect x="0" y="12" width="112" height="12" fill="#1E0740" />
          {/* EMV Chip */}
          <Rect x="14" y="32" width="16" height="12" rx="3" fill="#FFD166" />
          {/* Masked numbers */}
          <Circle cx="40" cy="42" r="2" fill="#FFFFFF" opacity="0.8" />
          <Circle cx="48" cy="42" r="2" fill="#FFFFFF" opacity="0.8" />
          <Circle cx="56" cy="42" r="2" fill="#FFFFFF" opacity="0.8" />
          <Circle cx="64" cy="42" r="2" fill="#FFFFFF" opacity="0.8" />
          <Circle cx="76" cy="42" r="2" fill="#FFFFFF" opacity="0.8" />
          <Circle cx="84" cy="42" r="2" fill="#FFFFFF" opacity="0.8" />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OnboardingSecurityIllustration;
