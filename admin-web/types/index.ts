export type UserRole = 'customer' | 'admin' | 'super_admin';
export type AccountStatus = 'active' | 'inactive' | 'suspended';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'transfer' | 'paystack' | 'cash_on_delivery';

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  role: UserRole;
  account_status: AccountStatus;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_name: string;
  color?: string;
  image_url?: string;
  is_active: boolean;
  item_count: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  category_name?: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  sku: string;
  image_urls: string[];
  is_featured: boolean;
  is_active: boolean;
  rating?: number;
  rating_count?: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_image: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total_amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
  cancellation_reason?: string;
  delivery_address_snapshot: {
    recipient_name?: string;
    phone?: string;
    city?: string;
    address?: string;
    state?: string;
  };
  items?: OrderItem[];
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  role: UserRole;
  account_status: AccountStatus;
  created_at: string;
  total_orders?: number;
  total_spent?: number;
}

export interface DashboardStats {
  total_products: number;
  total_orders: number;
  total_customers: number;
  total_sales: number;
  products_growth: string;
  orders_growth: string;
  customers_growth: string;
  sales_growth: string;
}

export interface SalesDataPoint {
  label: string;
  amount: number;
  orders: number;
}

export type CampaignType = 'Discount' | 'Product Launch' | 'Shipping' | 'Seasonal' | string;
export type CampaignStatus = 'Active' | 'Completed' | 'Scheduled' | 'Draft';

export interface MarketingCampaign {
  id: string;
  name: string;
  type: CampaignType;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  thumbnail_url?: string;
  discount_rate?: string;
  reach?: number;
  clicks?: number;
  conversions?: number;
}

export interface MarketingStats {
  total_campaigns: number;
  campaigns_growth: string;
  total_reach: number;
  reach_growth: string;
  total_clicks: number;
  clicks_growth: string;
  conversion_rate: number;
  conversion_growth: string;
}

export interface CouponItem {
  id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usedCount?: number;
  isActive: boolean;
  description?: string;
}

export interface InventoryMovementItem {
  id: string;
  productId: string;
  productName: string;
  movementType: 'restock' | 'sale' | 'return' | 'adjustment' | 'cancellation' | 'damage';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  adminEmail?: string;
  createdAt: string;
}

export interface SupportTicketItem {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  category: 'orders' | 'payment' | 'delivery' | 'returns' | 'general';
  orderId?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  adminNotes?: string;
  createdAt: string;
}

export interface ProductReviewItem {
  id: string;
  productId: string;
  productName?: string;
  customerId: string;
  customerName: string;
  rating: number;
  reviewTitle?: string;
  reviewText: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface NotificationBroadcastItem {
  id: string;
  title: string;
  message: string;
  type: string;
  targetAudience: 'all' | 'vip' | 'new' | 'single';
  sentBy: string;
  readCount: number;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  adminEmail: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  timestamp: string;
}

export interface StoreSettingsData {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  deliveryFee: number;
  freeShippingThreshold: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  maintenanceMode: boolean;
}

