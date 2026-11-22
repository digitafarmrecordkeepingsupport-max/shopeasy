import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

export const OnboardingDeliveryIllustration: React.FC = () => {
  const size = Math.min(width * 0.72, 280);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg viewBox="0 0 280 280" width={size} height={size}>
        <Defs>
          <LinearGradient id="scooterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#7C3AED" />
            <Stop offset="100%" stopColor="#4A0D9B" />
          </LinearGradient>
          <LinearGradient id="boxDelivGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F5B971" />
            <Stop offset="100%" stopColor="#DF943B" />
          </LinearGradient>
        </Defs>

        {/* Soft ground shadow */}
        <Circle cx="140" cy="245" r="85" fill="#E8E2F5" opacity="0.6" scaleY="0.25" />

        {/* Wind lines / Speed indicators */}
        <Path d="M40 120H20 M50 145H25 M45 170H15" stroke="#C4B5FD" strokeWidth="3" strokeLinecap="round" />

        {/* Scooter Body & Wheels */}
        {/* Back Wheel */}
        <Circle cx="80" cy="210" r="24" fill="#3B087D" />
        <Circle cx="80" cy="210" r="14" fill="#EDE9FE" />
        <Circle cx="80" cy="210" r="6" fill="#3B087D" />

        {/* Front Wheel */}
        <Circle cx="205" cy="210" r="24" fill="#3B087D" />
        <Circle cx="205" cy="210" r="14" fill="#EDE9FE" />
        <Circle cx="205" cy="210" r="6" fill="#3B087D" />

        {/* Scooter Chassis Frame */}
        <Path
          d="M80 210L115 210L135 175H175L195 125L205 210"
          stroke={Colors.primary}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Handlebars */}
        <Path
          d="M185 110L205 115"
          stroke="#171428"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Delivery Box Mounted on Back */}
        <G transform="translate(60, 115)">
          <Rect x="0" y="0" width="55" height="52" rx="8" fill="url(#boxDelivGrad)" />
          {/* Packaging tape */}
          <Path d="M22 0V52 M0 26H55" stroke="#FFFFFF" strokeWidth="4" opacity="0.6" />
          {/* ShopEasy brand badge on delivery box */}
          <Circle cx="28" cy="26" r="10" fill={Colors.primary} />
          <Path d="M24 24H32 M24 28H30" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" />
        </G>

        {/* Rider Helmet and Silhouette */}
        <Circle cx="152" cy="95" r="16" fill={Colors.primary} />
        {/* Visor */}
        <Path d="M156 90C164 92 168 98 168 102H156V90Z" fill={Colors.accentOrange} />
        {/* Rider Torso/Jacket */}
        <Path
          d="M140 114C140 114 150 110 160 114L165 150H132L140 114Z"
          fill="#4A0D9B"
        />
        {/* Arm reaching handlebar */}
        <Path
          d="M152 120L188 120"
          stroke={Colors.primary}
          strokeWidth="7"
          strokeLinecap="round"
        />
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

export default OnboardingDeliveryIllustration;
