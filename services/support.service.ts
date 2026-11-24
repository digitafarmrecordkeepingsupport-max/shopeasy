import { SupportTicket, FAQItem } from '../types';
import { StorageService, StorageKeys } from './storage.service';
import { supabase, isSupabaseConfigured } from './supabase';

export const FAQS: FAQItem[] = [
  {
    id: 'faq_1',
    category: 'orders',
    question: 'How do I track my ShopEasy order?',
    answer: 'Go to the Orders tab in the bottom navigation. Tap on any order to view real-time status updates from Order Placed to Processing, Shipped, and Delivered.',
  },
  {
    id: 'faq_2',
    category: 'orders',
    question: 'Can I cancel an order after placing it?',
    answer: 'Yes! Orders in "Pending" or "Processing" status can be cancelled directly from the order details screen. Once an order is "Shipped", please contact our support team.',
  },
  {
    id: 'faq_3',
    category: 'payment',
    question: 'What payment methods are supported in Nigeria?',
    answer: 'We support all Nigerian debit/credit cards (Mastercard, Visa, Verve) via Paystack, instant Bank Transfers, and Cash on Delivery in selected regions.',
  },
  {
    id: 'faq_4',
    category: 'payment',
    question: 'How do I use a discount coupon code?',
    answer: 'At checkout, enter your promo code (e.g., EASY10 for 10% off, FREESHIP for free shipping) into the coupon field and tap "Apply". The discount will be reflected immediately in your order summary.',
  },
  {
    id: 'faq_5',
    category: 'delivery',
    question: 'How long does delivery take?',
    answer: 'Deliveries within Lagos take 1–2 business days. Deliveries to other Nigerian states (Abuja, Port Harcourt, Ibadan, etc.) take 2–5 business days.',
  },
  {
    id: 'faq_6',
    category: 'delivery',
    question: 'How much does shipping cost?',
    answer: 'Standard shipping across Nigeria is ₦2,500. Orders above ₦50,000 or orders with the FREESHIP coupon qualify for free delivery!',
  },
  {
    id: 'faq_7',
    category: 'returns',
    question: 'What is your return and refund policy?',
    answer: 'We offer a 7-day hassle-free return guarantee for items that are defective, damaged, or incorrect. Items must remain in their original packaging.',
  },
];

export const SUPPORT_CHANNELS = {
  phone: '+234 812 345 6789',
  whatsapp: '+2348123456789',
  email: 'support@shopeasy.ng',
  hours: 'Monday – Saturday: 8:00 AM – 8:00 PM WAT',
};

export const SupportService = {
  getFAQs(category?: string): FAQItem[] {
    if (!category || category === 'all') return FAQS;
    return FAQS.filter((f) => f.category === category);
  },

  async submitTicket(input: {
    customer_name: string;
    customer_email: string;
    category: 'orders' | 'payment' | 'delivery' | 'general';
    subject: string;
    description: string;
    related_order_number?: string;
  }): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      id: `tick_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      category: input.category,
      subject: input.subject.trim(),
      description: input.description.trim(),
      related_order_number: input.related_order_number?.trim() || undefined,
      status: 'open',
      created_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.from('support_tickets').insert([newTicket]);
      }
    } catch {
      // Supabase table may not exist, persist locally
    }

    const tickets = await StorageService.getItem<SupportTicket[]>(StorageKeys.SUPPORT_TICKETS, []);
    await StorageService.setItem(StorageKeys.SUPPORT_TICKETS, [newTicket, ...tickets]);

    return newTicket;
  },

  async getCustomerTickets(customerEmail?: string): Promise<SupportTicket[]> {
    const tickets = await StorageService.getItem<SupportTicket[]>(StorageKeys.SUPPORT_TICKETS, []);
    if (!customerEmail) return tickets;
    return tickets.filter((t) => t.customer_email.toLowerCase() === customerEmail.toLowerCase());
  },
};
