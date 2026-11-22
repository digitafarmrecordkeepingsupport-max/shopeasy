import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/colors';
import Badge from '../../components/common/Badge';
import RoleSwitcher from '../../components/common/RoleSwitcher';
import { useAuth } from '../../context/AuthContext';
import { BorderRadius, Shadows } from '../../constants/spacing';

export default function CustomerProfileScreen() {
  const router = useRouter();
  const { user, role, logout } = useAuth();

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
      subtitle: 'View and track your orders',
      icon: 'cube-outline',
      iconColor: Colors.primary,
      iconBg: '#F3E8FF',
      onPress: () => router.push('/(tabs)/orders'),
    },
    {
      id: 'addresses',
      title: 'My Addresses',
      icon: 'location-outline',
      iconColor: Colors.primary,
      iconBg: '#EDE9FE',
      onPress: () => router.push('/profile/addresses'),
    },
    {
      id: 'payments',
      title: 'Payment Methods',
      icon: 'card-outline',
      iconColor: Colors.primary,
      iconBg: '#EDE9FE',
      onPress: () =>
        Alert.alert(
          'Payment Methods',
          'Supported methods: Credit/Debit Cards, Bank Transfer, Paystack (Nigeria), and Cash on Delivery.'
        ),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      iconColor: Colors.primary,
      iconBg: '#EDE9FE',
      badge: 2,
      onPress: () =>
        Alert.alert(
          'Notifications',
          '1. Order #SE-89241 has been dispatched!\n2. Weekend Flash Sale: 20% off on all sneakers.'
        ),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      iconColor: Colors.primary,
      iconBg: '#EDE9FE',
      onPress: () =>
        Alert.alert(
          'Help & Support',
          'Contact ShopEasy Support:\nEmail: support@shopeasy.com\nWhatsApp/Call: +234 800 SHOPEASY\nAvailable 24/7.'
        ),
    },
    {
      id: 'about',
      title: 'About ShopEasy',
      icon: 'information-circle-outline',
      iconColor: Colors.primary,
      iconBg: '#EDE9FE',
      onPress: () =>
        Alert.alert(
          'About ShopEasy',
          'ShopEasy v1.0.0\nTagline: Shop Smarter. Live Better.\nA modern, premium single-vendor e-commerce application powered by React Native, Expo, and Supabase.'
        ),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Curved Purple Header Background matching reference */}
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
              <Text style={styles.userName}>{user?.full_name || 'Jane Doe'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'jane.doe@gmail.com'}</Text>
              {role === 'admin' && (
                <View style={styles.ownerBadge}>
                  <Text style={styles.ownerBadgeText}>Store Owner</Text>
                </View>
              )}
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

          {/* Red Log Out Option matching reference */}
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

        {/* Role Switcher for seamless testing */}
        <RoleSwitcher />
      </ScrollView>
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
    paddingVertical: 10,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
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
    marginLeft: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  ownerBadge: {
    backgroundColor: Colors.accentOrange,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  ownerBadgeText: {
    color: '#171428',
    fontSize: 10,
    fontWeight: '800',
  },
  editButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    marginTop: -20,
    paddingBottom: 36,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
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
    fontWeight: '600',
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
    backgroundColor: '#F3F0F9',
    marginLeft: 52,
  },
  logOutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
  },
});
