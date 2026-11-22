import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Colors from '../../constants/colors';
import { OrderStatus } from '../../types';

interface BadgeProps {
  count?: number;
  text?: string;
  variant?: 'count' | 'status' | 'discount';
  status?: OrderStatus;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  count,
  text,
  variant = 'count',
  status,
  style,
}) => {
  if (variant === 'count') {
    if (!count || count <= 0) return null;
    return (
      <View style={[styles.countBadge, style]}>
        <Text style={styles.countText}>{count > 99 ? '99+' : count}</Text>
      </View>
    );
  }

  if (variant === 'discount' && text) {
    return (
      <View style={[styles.discountBadge, style]}>
        <Text style={styles.discountText}>{text}</Text>
      </View>
    );
  }

  if (variant === 'status' && status) {
    const statusStyles: Record<OrderStatus, { bg: string; text: string; label: string }> = {
      pending: { bg: '#FEF3C7', text: '#D97706', label: 'Pending' },
      processing: { bg: '#EDE9FE', text: Colors.primary, label: 'Processing' },
      shipped: { bg: '#DBEAFE', text: '#2563EB', label: 'Shipped' },
      delivered: { bg: '#DCFCE7', text: '#16A34A', label: 'Delivered' },
      cancelled: { bg: '#FEE2E2', text: '#EF4444', label: 'Cancelled' },
    };

    const config = statusStyles[status] || statusStyles.pending;

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bg }, style]}>
        <Text style={[styles.statusText, { color: config.text }]}>{config.label}</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.badgeRed,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  discountBadge: {
    backgroundColor: Colors.accentOrange,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Badge;
