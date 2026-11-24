import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { NotificationService } from '../../services/notification.service';
import { AppNotification } from '../../types';
import { formatDateTime } from '../../utils/date';
import { BorderRadius, Shadows } from '../../constants/spacing';
import { useAuth } from '../../context/AuthContext';

type TabType = 'all' | 'order' | 'promo' | 'system';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const loadNotifications = async () => {
    try {
      const data = await NotificationService.getNotifications(user?.id);
      setNotifications(data);
    } catch (e) {
      console.warn('Error loading notifications:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead(user?.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleNotificationPress = async (notif: AppNotification) => {
    if (!notif.is_read) {
      await NotificationService.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }

    if (notif.type === 'order' && notif.related_id) {
      router.push(`/orders/${notif.related_id}`);
    } else if (notif.type === 'promo') {
      router.push('/products');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    await NotificationService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notifications.filter((n) => {
    if (selectedTab === 'all') return true;
    return n.type === selectedTab;
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'order':
        return { name: 'bag-check-outline' as const, color: Colors.primary, bg: '#EDE9FE' };
      case 'promo':
        return { name: 'pricetag-outline' as const, color: Colors.accentOrange, bg: '#FEF3C7' };
      case 'payment':
        return { name: 'card-outline' as const, color: Colors.success, bg: '#DCFCE7' };
      default:
        return { name: 'notifications-outline' as const, color: Colors.textSecondary, bg: '#F3F4F6' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadBtn}>
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {(['all', 'order', 'promo', 'system'] as TabType[]).map((tab) => {
          const isActive = selectedTab === tab;
          const label = tab === 'all' ? 'All' : tab === 'order' ? 'Orders' : tab === 'promo' ? 'Promos' : 'System';
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[styles.tabChip, isActive && styles.tabChipActive]}
            >
              <Text style={[styles.tabChipText, isActive && styles.tabChipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={56} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! Order updates and store promos will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filtered.map((item) => {
              const iconInfo = getNotifIcon(item.type);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notifCard,
                    Shadows.card,
                    !item.is_read && styles.notifCardUnread,
                  ]}
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: iconInfo.bg }]}>
                    <Ionicons name={iconInfo.name} size={22} color={iconInfo.color} />
                  </View>

                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardTitle, !item.is_read && styles.cardTitleUnread]}>
                        {item.title}
                      </Text>
                      {!item.is_read && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.cardMessage}>{item.message}</Text>
                    <Text style={styles.cardDate}>{formatDateTime(item.created_at)}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDeleteNotification(item.id)}
                    style={styles.deleteBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={16} color={Colors.textLight} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  markReadBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F5FC',
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#F3F4F6',
  },
  tabChipActive: {
    backgroundColor: Colors.primary,
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  listContainer: {
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F0F9',
  },
  notifCardUnread: {
    borderColor: '#DDD6FE',
    backgroundColor: '#FBF9FE',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  cardTitleUnread: {
    fontWeight: '800',
    color: Colors.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  cardMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 11,
    color: Colors.textLight,
  },
  deleteBtn: {
    paddingLeft: 8,
    paddingTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 6,
    lineHeight: 18,
  },
});
