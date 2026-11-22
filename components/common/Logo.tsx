import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import Colors from '../../constants/colors';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
  style?: ViewStyle;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'medium',
  showTagline = false,
  style,
}) => {
  const isLight = variant === 'light';

  // Dimension scaling
  const iconSizes = {
    small: 26,
    medium: 36,
    large: 54,
  };
  const fontSizes = {
    small: 18,
    medium: 24,
    large: 34,
  };
  const taglineSizes = {
    small: 10,
    medium: 12,
    large: 14,
  };

  const currentIconSize = iconSizes[size];
  const currentFontSize = fontSizes[size];
  const currentTaglineSize = taglineSizes[size];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        {/* Shopping Bag Icon with Cart inside */}
        <View style={[styles.iconContainer, { width: currentIconSize, height: currentIconSize }]}>
          <Svg viewBox="0 0 40 40" width={currentIconSize} height={currentIconSize}>
            {/* Bag Body */}
            <Rect
              x="6"
              y="12"
              width="28"
              height="24"
              rx="6"
              fill={isLight ? '#FFFFFF' : Colors.primary}
            />
            {/* Bag Handle */}
            <Path
              d="M14 12V8C14 4.68629 16.6863 2 20 2C23.3137 2 26 4.68629 26 8V12"
              stroke={isLight ? '#FFFFFF' : Colors.primary}
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Shopping Cart graphic inside bag */}
            <Path
              d="M13 18H16L18 27H27L29 20H17"
              stroke={isLight ? Colors.primary : '#FFFFFF'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <Circle cx="19" cy="29" r="1.3" fill={isLight ? Colors.primary : '#FFFFFF'} />
            <Circle cx="26" cy="29" r="1.3" fill={isLight ? Colors.primary : '#FFFFFF'} />
          </Svg>
        </View>

        {/* Brand Name */}
        <Text style={[styles.brandText, { fontSize: currentFontSize }]}>
          <Text style={{ color: isLight ? '#FFFFFF' : Colors.primary }}>Shop</Text>
          <Text style={{ color: Colors.accentOrange }}>Easy</Text>
        </Text>
      </View>

      {showTagline && (
        <Text
          style={[
            styles.tagline,
            {
              fontSize: currentTaglineSize,
              color: isLight ? Colors.whiteAlpha80 : Colors.textSecondary,
            },
          ]}
        >
          Shop Smarter. Live Better.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default Logo;
