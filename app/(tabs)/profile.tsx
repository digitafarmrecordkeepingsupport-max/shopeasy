import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/colors';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { BorderRadius, Shadows } from '../../constants/spacing';
import { NotificationService } from '../../services/notification.service';

export default function CustomerProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showAboutModal, setShowAboutModal] = useState(false);

  useEffect(() => {
    loadUnread();
  }, []);

  const loadUnread = async () => {
    try {
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of ShopEasy?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const menuItems = [
    {
      id: 'orders',
      title: 'My Orders',
      subtitle: 'View, track, and manage your orders',
      icon: 'cube-outline',
      iconColor: Colors.primary,
      iconBg: '#F3E8FF',
      onPress: () => router.push('/(tabs)/orders'),
    },
    {
      id: 'wishlist',
      title: 'My Wishlist',
      subtitle: 'Items you have saved to buy later',
      icon: 'heart-outline',
      iconColor: Colors.primary,
      iconBg: '#FCE7F3',
      onPress: () => router.push('/wishlist'),
    },
    {
      id: 'addresses',
      title: 'Delivery Addresses',
      subtitle: 'Manage saved shipping addresses',
      icon: 'location-outline',
      iconColor: Colors.primary,
      iconBg: '#EDE9FE',
      onPress: () => router.push('/profile/addresses'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Order updates and promotional offers',
      icon: 'notifications-outline',
      iconColor: Colors.primary,
      iconBg: '#EDE9FE',
      badge: unreadCount > 0 ? unreadCount : undefined,
      onPress: () => router.push('/notifications'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'FAQs, live WhatsApp chat, call hotline',
      icon: 'headset-outline',
      iconColor: Colors.primary,
      iconBg: '#EDE9FE',
      onPress: () => router.push('/support'),
    },
    {
      id: 'about',
      title: 'About ShopEasy',
      subtitle: 'Version, policies, terms & customer safety',
      icon: 'information-circle-outline',
      iconColor: Colors.primary,
      iconBg: '#EDE9FE',
      onPress: () => setShowAboutModal(true),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Curved Purple Header Background */}
      <LinearGradient
        colors={[Colors.darkPurple, Colors.primary]}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            {/* User Avatar with White Border */}
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri:
                    user?.avatar_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
                }}
                style={styles.avatarImage}
              />
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.full_name || 'Customer'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'customer@shopeasy.ng'}</Text>
              {user?.phone_number ? (
                <Text style={styles.userPhone}>{user.phone_number}</Text>
              ) : null}
            </View>

            {/* Edit Profile Pencil Icon Button */}
            <TouchableOpacity
              onPress={() => router.push('/profile/edit')}
              style={styles.editButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="pencil" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Options Panel / Card */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.menuCard, Shadows.card]}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.7}
                onPress={item.onPress}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  )}
                </View>

                {item.badge ? (
                  <View style={styles.menuBadgeWrapper}>
                    <Badge count={item.badge} />
                  </View>
                ) : null}

                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>

              {index < menuItems.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}

          {/* Red Log Out Option */}
          <View style={styles.menuDivider} />
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.logOutTitle}>Log Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, Shadows.modal]}>
            <View style={styles.aboutHeader}>
              <Ionicons name="cart" size={36} color={Colors.primary} />
              <Text style={styles.aboutTitle}>ShopEasy</Text>
              <Text style={styles.aboutTagline}>Shop Smarter. Live Better.</Text>
              <View style={styles.versionBadge}>
                <Text style={styles.versionBadgeText}>Version 1.0.0</Text>
              </View>
            </View>

            <Text style={styles.aboutDescription}>
              ShopEasy is a single-vendor Nigerian e-commerce platform offering premium fashion, electronics, home essentials, and lifestyle products with doorstep delivery and reliable payment processing.
            </Text>

            <View style={styles.aboutHighlights}>
              <View style={styles.aboutHighlightRow}>
                <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
                <Text style={styles.aboutHighlightText}>Paystack & Card Secure Payments</Text>
              </View>
              <View style={styles.aboutHighlightRow}>
                <Ionicons name="car" size={16} color={Colors.primary} />
                <Text style={styles.aboutHighlightText}>Nationwide Nigerian Delivery</Text>
              </View>
              <View style={styles.aboutHighlightRow}>
                <Ionicons name="refresh" size={16} color={Colors.accentOrange} />
                <Text style={styles.aboutHighlightText}>7-Day Customer Return Guarantee</Text>
              </View>
            </View>

            <Button
              title="Close"
              onPress={() => setShowAboutModal(false)}
              variant="primary"
              style={{ width: '100%', marginTop: 20 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5FC',
  },
  headerGradient: {
    paddingBottom: 36,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerSafeArea: {
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 13,
    color: '#EDE9FE',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#DDD6FE',
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F3F0F9',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuBadgeWrapper: {
    marginRight: 8,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F7F5FC',
  },
  logOutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  aboutHeader: {
    alignItems: 'center',
    marginBottom: 14,
  },
  aboutTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 6,
  },
  aboutTagline: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  versionBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  versionBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  aboutDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  aboutHighlights: {
    width: '100%',
    gap: 8,
  },
  aboutHighlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aboutHighlightText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
