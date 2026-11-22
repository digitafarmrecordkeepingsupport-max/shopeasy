import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

export const OnboardingCartIllustration: React.FC = () => {
  const size = Math.min(width * 0.72, 280);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg viewBox="0 0 280 280" width={size} height={size}>
        <Defs>
          {/* Cardboard Box Gradient */}
          <LinearGradient id="boxFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F5B971" />
            <Stop offset="100%" stopColor="#DF943B" />
          </LinearGradient>
          <LinearGradient id="boxSide" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E29E4B" />
            <Stop offset="100%" stopColor="#B87322" />
          </LinearGradient>
          <LinearGradient id="boxTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FDE1B8" />
            <Stop offset="100%" stopColor="#F7C486" />
          </LinearGradient>

          {/* Purple Tag Gradient */}
          <LinearGradient id="tagPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8B4AF4" />
            <Stop offset="100%" stopColor="#6515D5" />
          </LinearGradient>
        </Defs>

        {/* Soft Shadow on ground */}
        <Circle cx="140" cy="245" r="75" fill="#E8E2F5" opacity="0.6" scaleY="0.25" />

        {/* Cardboard boxes inside the cart */}
        {/* Box 1 - Top Left Parcel */}
        <G transform="translate(100, 60)">
          <Path d="M0 24L38 6L72 20L34 38Z" fill="url(#boxTop)" />
          <Path d="M0 24L34 38V80L0 64Z" fill="url(#boxFront)" />
          <Path d="M34 38L72 20V60L34 80Z" fill="url(#boxSide)" />
          {/* Tape */}
          <Path d="M16 31L52 14" stroke="#FFF" strokeWidth="4" opacity="0.6" />
        </G>

        {/* Box 2 - Right parcel */}
        <G transform="translate(136, 95)">
          <Path d="M0 16L32 0L64 12L32 28Z" fill="url(#boxTop)" />
          <Path d="M0 16L32 28V62L0 50Z" fill="url(#boxFront)" />
          <Path d="M32 28L64 12V46L32 62Z" fill="url(#boxSide)" />
        </G>

        {/* Hanging % Tag */}
        <G transform="translate(196, 75) rotate(15)">
          <Rect x="0" y="0" width="38" height="38" rx="8" fill="url(#tagPurple)" />
          <Path d="M10 28L28 10" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
          <Circle cx="14" cy="14" r="3" fill="#FFF" />
          <Circle cx="24" cy="24" r="3" fill="#FFF" />
        </G>

        {/* Shopping Cart Metal Wireframe */}
        {/* Handle */}
        <Path
          d="M48 95L65 105H85"
          stroke={Colors.primary}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Cart Wire Basket */}
        <Path
          d="M62 105L80 190H200L225 105H62Z"
          stroke={Colors.primary}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Grid lines inside basket */}
        <Path
          d="M86 110L100 185 M116 110L125 185 M148 110L150 185 M180 110L175 185 M208 110L195 185"
          stroke={Colors.primary}
          strokeWidth="2.5"
          opacity="0.6"
        />
        <Path
          d="M68 132H220 M73 158H210"
          stroke={Colors.primary}
          strokeWidth="2.5"
          opacity="0.6"
        />

        {/* Cart Base Frame */}
        <Path
          d="M95 190L105 218H185L195 190"
          stroke={Colors.primary}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Wheels */}
        <Circle cx="106" cy="226" r="10" fill={Colors.primary} />
        <Circle cx="106" cy="226" r="4" fill="#FFF" />
        <Circle cx="184" cy="226" r="10" fill={Colors.primary} />
        <Circle cx="184" cy="226" r="4" fill="#FFF" />
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

export default OnboardingCartIllustration;
