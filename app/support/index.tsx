import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Button from '../../components/common/Button';
import { SupportService, SUPPORT_CHANNELS, FAQS } from '../../services/support.service';
import { useAuth } from '../../context/AuthContext';
import { BorderRadius, Shadows } from '../../constants/spacing';
import { FAQItem } from '../../types';

export default function SupportScreen() {
  const router = useRouter();
  const { orderNumber } = useLocalSearchParams<{ orderNumber?: string }>();
  const { user } = useAuth();

  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('all');

  // Submit Ticket Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [ticketOrderNumber, setTicketOrderNumber] = useState(orderNumber || '');
  const [category, setCategory] = useState<'orders' | 'payment' | 'delivery' | 'general'>('orders');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${SUPPORT_CHANNELS.phone}`).catch(() => {
      Alert.alert('Phone Call', `Please call us directly at ${SUPPORT_CHANNELS.phone}`);
    });
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ShopEasy Support! I need assistance with my ${ticketOrderNumber ? `order #${ticketOrderNumber}` : 'shopping'}.`
    );
    Linking.openURL(`https://wa.me/${SUPPORT_CHANNELS.whatsapp}?text=${text}`).catch(() => {
      Alert.alert('WhatsApp', `Message our team directly on WhatsApp: ${SUPPORT_CHANNELS.whatsapp}`);
    });
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_CHANNELS.email}?subject=ShopEasy Customer Inquiry`).catch(() => {
      Alert.alert('Email Support', `Send an email to ${SUPPORT_CHANNELS.email}`);
    });
  };

  const handleSubmitTicket = async () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !description.trim()) {
      Alert.alert('Missing Fields', 'Please fill in your name, email, subject, and inquiry details.');
      return;
    }

    setIsSubmitting(true);
    try {
      await SupportService.submitTicket({
        customer_name: name.trim(),
        customer_email: email.trim(),
        category,
        subject: subject.trim(),
        description: description.trim(),
        related_order_number: ticketOrderNumber.trim() || undefined,
      });

      setIsModalVisible(false);
      setSubject('');
      setDescription('');
      Alert.alert(
        'Inquiry Submitted! 📩',
        'Thank you for reaching out. Our support team will review your message and reply via email within 2-4 hours.'
      );
    } catch {
      Alert.alert('Error', 'Unable to submit support ticket. Please try again or message us on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = SupportService.getFAQs(selectedFaqCategory);

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Help Banner */}
        <View style={[styles.helpBanner, Shadows.card]}>
          <Ionicons name="headset" size={32} color="#FFFFFF" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.helpBannerTitle}>We're here to help you</Text>
            <Text style={styles.helpBannerSubtitle}>{SUPPORT_CHANNELS.hours}</Text>
          </View>
        </View>

        {/* Contact Channels */}
        <Text style={styles.sectionHeading}>Contact Channels</Text>
        <View style={styles.channelsRow}>
          <TouchableOpacity style={[styles.channelCard, Shadows.card]} onPress={handleWhatsApp}>
            <View style={[styles.channelIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="logo-whatsapp" size={24} color="#16A34A" />
            </View>
            <Text style={styles.channelTitle}>WhatsApp</Text>
            <Text style={styles.channelDesc}>Instant Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.channelCard, Shadows.card]} onPress={handleCall}>
            <View style={[styles.channelIconBox, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="call-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.channelTitle}>Call Center</Text>
            <Text style={styles.channelDesc}>Speak to Agent</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.channelCard, Shadows.card]} onPress={handleEmail}>
            <View style={[styles.channelIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="mail-outline" size={24} color={Colors.accentOrange} />
            </View>
            <Text style={styles.channelTitle}>Email</Text>
            <Text style={styles.channelDesc}>2-4h response</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Ticket Action */}
        <TouchableOpacity
          style={[styles.ticketCtaCard, Shadows.card]}
          onPress={() => setIsModalVisible(true)}
        >
          <View style={styles.ticketCtaIconBox}>
            <Ionicons name="ticket-outline" size={24} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ticketCtaTitle}>Send a Support Ticket</Text>
            <Text style={styles.ticketCtaSubtitle}>
              Having issues with an order or payment? Submit your request here.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>

        {/* FAQ Section */}
        <View style={styles.faqSectionHeader}>
          <Text style={styles.sectionHeading}>Frequently Asked Questions</Text>
        </View>

        {/* FAQ Filter Chips */}
        <View style={styles.faqChipsRow}>
          {[
            { id: 'all', label: 'All FAQs' },
            { id: 'orders', label: 'Orders' },
            { id: 'delivery', label: 'Delivery' },
            { id: 'payment', label: 'Payment' },
            { id: 'returns', label: 'Returns' },
          ].map((c) => {
            const isActive = selectedFaqCategory === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedFaqCategory(c.id)}
                style={[styles.faqChip, isActive && styles.faqChipActive]}
              >
                <Text style={[styles.faqChipText, isActive && styles.faqChipTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* FAQ Accordions */}
        <View style={styles.faqList}>
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <TouchableOpacity
                key={faq.id}
                style={[styles.faqCard, Shadows.card]}
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.8}
              >
                <View style={styles.faqQuestionRow}>
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </View>

                {isExpanded && (
                  <View style={styles.faqAnswerBox}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Submit Support Ticket Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Support Request</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={Colors.textLight}
              />

              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Your email address"
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Related Order # (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={ticketOrderNumber}
                onChangeText={setTicketOrderNumber}
                placeholder="e.g. SE-89241"
                placeholderTextColor={Colors.textLight}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categorySelectRow}>
                {(['orders', 'payment', 'delivery', 'general'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categorySelectChip,
                      category === cat && styles.categorySelectChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categorySelectText,
                        category === cat && styles.categorySelectTextActive,
                      ]}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.textInput}
                value={subject}
                onChangeText={setSubject}
                placeholder="Brief summary of your question"
                placeholderTextColor={Colors.textLight}
              />

              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.textInput, { minHeight: 90, textAlignVertical: 'top' }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your issue in detail..."
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={4}
              />

              <Button
                title="Send Ticket"
                onPress={handleSubmitTicket}
                variant="primary"
                isLoading={isSubmitting}
                style={{ marginTop: 16, marginBottom: 20 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  helpBanner: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  helpBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  helpBannerSubtitle: {
    fontSize: 12,
    color: '#EDE9FE',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  channelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 18,
  },
  channelCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F0F9',
  },
  channelIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  channelTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  channelDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ticketCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 24,
  },
  ticketCtaIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketCtaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  ticketCtaSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  faqSectionHeader: {
    marginTop: 6,
  },
  faqChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  faqChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#F3F4F6',
  },
  faqChipActive: {
    backgroundColor: Colors.primary,
  },
  faqChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  faqChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  faqList: {
    gap: 10,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F0F9',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  faqAnswerBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F0F9',
  },
  faqAnswerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  categorySelectRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categorySelectChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  categorySelectChipActive: {
    backgroundColor: Colors.primary,
  },
  categorySelectText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  categorySelectTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
