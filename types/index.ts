export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  role: UserRole;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_name: string; // Ionicons / MaterialIcons name
  image_url?: string;
  color?: string;
  is_active: boolean;
  item_count?: number;
}

export interface Product {
  id: string;
  name: string;
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
  updated_at?: string;
}

export interface CartItem {
  id: string; // unique item id in cart
  product: Product;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  product: Product;
  added_at: string;
}

export interface Address {
  id: string;
  customer_id?: string;
  recipient_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  is_default: boolean;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'card' | 'transfer' | 'paystack' | 'cash_on_delivery';

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  unit_price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  delivery_address: Address;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total_products: number;
  total_orders: number;
  pending_orders: number;
  total_customers: number;
  total_sales: number;
  monthly_revenue: { month: string; amount: number }[];
}
