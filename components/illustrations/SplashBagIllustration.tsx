import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

export const SplashBagIllustration: React.FC = () => {
  const size = Math.min(width * 0.72, 280);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg viewBox="0 0 280 280" width={size} height={size}>
        <Defs>
          {/* Subtle soft shadows */}
          <LinearGradient id="bagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#EDE6F7" />
          </LinearGradient>

          <LinearGradient id="bagSideGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E2D9F3" />
            <Stop offset="100%" stopColor="#C9B8E8" />
          </LinearGradient>

          <LinearGradient id="tagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFC84B" />
            <Stop offset="100%" stopColor="#FF9D00" />
          </LinearGradient>

          <LinearGradient id="shadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="rgba(42,5,90,0.5)" />
            <Stop offset="100%" stopColor="rgba(42,5,90,0)" />
          </LinearGradient>
        </Defs>

        {/* Floating Background Icons with soft white alpha */}
        {/* Floating Gift Box - Left */}
        <G opacity="0.3" transform="translate(18, 140) rotate(-15)">
          <Rect x="0" y="8" width="24" height="20" rx="3" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
          <Path d="M12 8V28 M0 16H24" stroke="#FFFFFF" strokeWidth="1.8" />
          <Path d="M12 8C10 4 5 4 7 8C9 8 11 8 12 8Z" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
          <Path d="M12 8C14 4 19 4 17 8C15 8 13 8 12 8Z" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
        </G>

        {/* Floating Tag - Top Left */}
        <G opacity="0.35" transform="translate(30, 48) rotate(25)">
          <Path
            d="M5 18L18 5C20 3 23 3 25 5L33 13C35 15 35 18 33 20L20 33C18 35 15 35 13 33L5 25C3 23 3 20 5 18Z"
            stroke="#FFFFFF"
            strokeWidth="2"
            fill="none"
          />
          <Circle cx="26" cy="12" r="2.5" fill="#FFFFFF" />
        </G>

        {/* Floating Percent Tag - Top Right */}
        <G opacity="0.35" transform="translate(225, 45) rotate(-20)">
          <Rect x="0" y="0" width="30" height="24" rx="5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          <Path d="M7 17L23 7" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          <Circle cx="10" cy="9" r="1.8" fill="#FFFFFF" />
          <Circle cx="20" cy="15" r="1.8" fill="#FFFFFF" />
        </G>

        {/* Floating Small Gift - Right */}
        <G opacity="0.3" transform="translate(230, 145) rotate(15)">
          <Rect x="0" y="6" width="22" height="18" rx="3" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
          <Path d="M11 6V24 M0 14H22" stroke="#FFFFFF" strokeWidth="1.8" />
        </G>

        {/* Bag Base Shadow */}
        <Path
          d="M60 236C95 244 185 244 220 236C235 232 230 248 210 252C170 260 110 260 70 252C50 248 45 232 60 236Z"
          fill="url(#shadowGrad)"
        />

        {/* 3D Shopping Bag */}
        {/* Bag Side Perspective */}
        <Path
          d="M80 95L62 108L75 228L98 220L80 95Z"
          fill="url(#bagSideGrad)"
        />

        {/* Bag Main Front Body */}
        <Path
          d="M80 95L200 95L218 215L98 220L80 95Z"
          fill="url(#bagGrad)"
        />

        {/* Bag Top Fold Opening */}
        <Path
          d="M80 95L100 86L218 86L200 95Z"
          fill="#DDD4EE"
        />

        {/* Bag Handles */}
        <Path
          d="M120 95V65C120 54 130 46 142 46C154 46 164 54 164 65V95"
          stroke={Colors.primary}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M114 90V63C114 50 126 40 140 40C154 40 166 50 166 63V90"
          stroke="#4F0EAC"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />

        {/* Front Shopping Cart Emblem in Purple */}
        <G transform="translate(118, 128)">
          <Path
            d="M6 14H18L24 44H56L62 20H22"
            stroke={Colors.primary}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Circle cx="26" cy="52" r="5" fill={Colors.primary} />
          <Circle cx="54" cy="52" r="5" fill={Colors.primary} />
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

export default SplashBagIllustration;
