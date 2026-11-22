# ShopEasy — E-Commerce Platform (Mobile & Web Admin)

> **Shop Smarter. Live Better.**

A complete, production-ready, single-vendor e-commerce platform comprising:
1. **Customer-Facing Mobile App**: Built with **React Native**, **Expo (SDK 58 / Expo Go compatible)**, **Expo Router**, and **TypeScript**.
2. **Store Owner Web Admin Dashboard**: Built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS** in `admin-web/` adhering faithfully to the high-fidelity admin UI designs.
3. **Unified Supabase Backend**: PostgreSQL database with 13 relational tables, Row-Level Security (RLS) policies, storage buckets, atomic inventory management procedures, sales aggregation functions, and seed data.

---

## 🎨 Design System & Visual Palette

| Token | Hex Code | Usage |
|---|---|---|
| **Primary Purple** | `#6515D5` | Primary buttons, active tabs, brand icons, logo |
| **Dark Purple** | `#3B087D` | Header gradients, splash background shadows, admin sidebar |
| **Secondary Purple** | `#7C3AED` | Soft accents, gradients, badges, chart lines |
| **Orange Accent** | `#FFB21A` | Logo "Easy", promo buttons, discount badges, stars |
| **Main Background** | `#FFFFFF` | Application screens, product cards, input fields |
| **Soft Background** | `#F7F5FC` | Background fills, category chips, avatars, table stripes |
| **Primary Text** | `#171428` | Headings, titles, prices in Nigerian Naira (₦) |
| **Secondary Text** | `#77738A` | Subtitles, descriptions, captions |
| **Border Color** | `#EAE6F3` | Clean subtle borders, card outlines |
| **Success** | `#16A34A` | Stock availability, order delivered badge, positive trends |
| **Error** | `#EF4444` | Out of stock badge, log out, item removal |

---

## 🖥️ Web Admin Dashboard (`admin-web/`)

The web admin interface allows the single store owner to manage the entire business operations. It strictly replicates the visual reference designs:

1. **Admin Login Page (`/admin-login`)**
   - Split-screen layout: Purple branding showcase banner on the left; floating white security shield card with padlock on the right.
   - Email, password, "Remember me" checkbox, "Forgot Password?", and secure access badge.
2. **Admin Dashboard (`/dashboard`)**
   - Deep royal purple sidebar with ShopEasy branding, navigation links, and "Grow Your Business" upgrade widget.
   - Header with global search, notification bell with red badge, and store owner profile menu.
   - 4 Top Metric Cards matching reference: Total Products (124, +12%), Total Orders (856, +18%), Total Customers (3,240, +15%), Total Sales (₦1,245,000, +22%).
   - Interactive Purple Spline Area Chart with time range tabs: 7 Days, 30 Days, 90 Days.
   - Quick Action buttons: Add Product, View Orders, Manage Customers, View Reports.
   - "Boost Your Sales" promotional banner with shopping cart graphic and "Create Promo →" action.
   - Recent Orders table with order numbers, customer names, Naira amounts, status badges, and action links.
   - Top Selling Products shelf with product imagery, titles, prices, and growth percentage.
3. **Customer Management Page (`/customers`)**
   - 4 Customer KPI cards: Total Customers (3,240), Active Customers (2,891), New Customers (349), VIP Customers (478).
   - "Export Customers" button for CSV/report export.
   - Filter dropdowns ("All Customers", "Last 30 Days") and live search input.
   - Customer data table with photo avatars, customer name, role, email, phone number, total orders, lifetime spend in ₦, join date, status pill (Active / Inactive), and view action.
4. **Product Catalog & Inventory (`/products`)**
   - Full product listing with category filter, search, stock levels, featured badges.
   - Add/Edit Product modal with name, SKU, price, original price, stock, category, image URL, and active status.
5. **Order Fulfillment (`/orders`)**
   - Complete orders list with status filtering (Pending, Processing, Shipped, Delivered, Cancelled).
   - Order detail drawer and instant status updates that trigger atomic inventory restoration when cancelled.
6. **Category & Settings Management (`/categories`, `/settings`)**
   - Category management matching Image 1: 12 categories, product count metrics, status filter, and "+ Add Category" modal.
7. **Analytics Dashboard (`/analytics`)**
   - Performance tracking matching Image 2: Sales Overview spline chart with ₦782,000 tooltip on Nov 18, Key Insights sparklines, Top Selling Products, and Orders by Status donut chart.
8. **Marketing & Promotions (`/marketing`)**
   - Marketing hub matching Image 3: 4 KPI cards (Campaigns, Reach, Clicks, Conversion Rate), Special Offer 30% OFF banner, Newsletter Campaign dispatcher, and active campaigns table.

---

## 🍃 MongoDB & Cloudinary Integration

ShopEasy supports a flexible dual-backend architecture: **MongoDB with Mongoose** + **Cloudinary Media Assets** as well as **Supabase**.

### 1. MongoDB Database (`admin-web/models/`)
- **Connection Singleton**: Cached database connection pool in [admin-web/lib/mongodb.ts](file:///c:/Users/USER/Downloads/shopy%20easy/admin-web/lib/mongodb.ts).
- **Mongoose Models**:
  - `User`: Admin, Super Admin, and Customer accounts with addresses, order histories, and roles.
  - `Category`: Categories with image URLs, slugs, colors, active states, and product counters.
  - `Product`: Products with multi-image arrays, SKUs, inventory counts, ratings, and featured flags.
  - `Order`: Full order document with embedded item snapshots, delivery addresses, and payment statuses.
  - `MarketingCampaign`: Marketing campaigns, promotional types, schedules, reach, clicks, and conversion analytics.
  - `StoreSettings`: Single-store configuration (store name, currency, delivery fees, and tax rates).

### 2. Cloudinary Media Asset Management
- **Cloudinary Client**: [admin-web/lib/cloudinary.ts](file:///c:/Users/USER/Downloads/shopy%20easy/admin-web/lib/cloudinary.ts) handles asset transformations, folder routing (`shopeasy/products`, `shopeasy/categories`, `shopeasy/banners`), and upload signatures.
- **REST Upload Endpoint**: `POST /api/upload` handles multipart form data or base64 uploads and returns CDN secure URLs.
- **Signed Client Upload Endpoint**: `GET /api/cloudinary/signature` enables direct, authenticated client uploads from React Native (Expo Go) or Web.
- **Mobile Cloudinary Service**: [services/cloudinary.service.ts](file:///c:/Users/USER/Downloads/shopy%20easy/services/cloudinary.service.ts) allows the mobile app to upload pictures directly from device gallery or camera.

### 3. MongoDB Scripts & CLI
- **Seed MongoDB**:
  ```bash
  npm run seed:mongodb
  # or
  node scripts/seed-mongodb.js "mongodb+srv://..."
  ```
- **Create Admin in MongoDB**:
  ```bash
  npm run create-admin:mongodb
  # or
  node scripts/create-admin-mongodb.js admin@shopeasy.com YourPassword123! "Store Admin"
  ```

---

## 🗄️ Unified Supabase Backend Architecture

Located in `supabase/`:
- **`supabase/schema.sql`**: Consolidated master setup script containing all schemas, tables, functions, RLS, storage buckets, and seeds.
- **`supabase/migrations/20261120000001_initial_schema.sql`**: 13 tables:
  1. `profiles`: Extended user profile (customer or admin).
  2. `categories`: Product categories with slugs and icons.
  3. `products`: Catalog items, price, SKU, stock quantity, featured flag.
  4. `product_images`: Multi-image galleries per product.
  5. `addresses`: Customer shipping and billing addresses.
  6. `carts`: Customer shopping carts.
  7. `cart_items`: Cart items with quantity, selected size, and color.
  8. `orders`: Orders with totals, status, delivery address JSONB snapshot.
  9. `order_items`: Line items snapshot with unit price and quantities.
  10. `wishlist_items`: Customer saved products.
  11. `inventory_movements`: Stock transaction audit log.
  12. `audit_logs`: Administrative actions audit trail.
  13. `store_settings`: Single-store configuration (store name, currency, tax, fees).
- **`supabase/migrations/20261120000002_functions_and_triggers.sql`**:
  - `handle_new_user()` trigger for automatic profile generation.
  - `is_admin()`, `is_super_admin()` security helper functions.
  - `process_order_inventory()`: Atomic stock deduction upon order placement.
  - `restore_order_inventory()`: Automatic stock replenishment on order cancellation.
  - `get_admin_dashboard_metrics()`: Aggregate metrics for the dashboard.
  - `get_sales_analytics(days)`: Aggregated revenue timeline for chart.
  - `get_customer_metrics()`: Customer metrics breakdown.
- **`supabase/migrations/20261120000003_rls_and_storage.sql`**:
  - Fine-grained Row Level Security (RLS) policies.
  - Storage buckets: `product-images`, `category-images`, `customer-avatars`.
- **`supabase/seed.sql`**: Rich seed data mirroring the reference dashboard numbers.

---

## ⚙️ Quick Start Guide

### 1. Database Setup (Supabase)
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the full content of `supabase/schema.sql` and run it.
4. Copy your **Project URL**, **Anon Key**, and **Service Role Key** from **Project Settings → API**.
5. Copy `.env.example` to `.env` in the root folder and configure:
   ```env
   EXPO_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   EXPO_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```
6. Also copy `.env.example` to `admin-web/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

### 2. Create the Admin Store Owner Account
Run the automated provisioning script from the project root:
```bash
npm run create-admin
# or with custom credentials:
node scripts/create-admin.js admin@shopeasy.com YourPassword123! "Store Admin"
```
This creates or updates the user in Supabase Auth and assigns the `super_admin` role in `profiles`.

### 3. Start the Web Admin Dashboard
```bash
# From project root:
npm run admin:dev

# Or directly in admin-web:
cd admin-web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Log in with your admin credentials to access the full store management dashboard.

### 4. Start the Mobile Application (Expo Go)
```bash
# Start Metro bundler with tunnel for remote Expo Go access:
npx expo start --tunnel -c

# Or local network mode:
npx expo start -c
```
Scan the QR code with **Expo Go** on your Android device (or the Camera app on iOS).

---

## 🎨 Design System & Visual Palette

| Token | Hex Code | Usage |
|---|---|---|
| **Primary Purple** | `#6515D5` | Primary buttons, active tabs, brand icons, logo |
| **Dark Purple** | `#3B087D` | Header gradients, splash background shadows |
| **Secondary Purple** | `#7C3AED` | Soft accents, gradients, badges |
| **Orange Accent** | `#FFB21A` | Logo "Easy", promo buttons, discount badges, stars |
| **Main Background** | `#FFFFFF` | Application screens, product cards, input fields |
| **Soft Background** | `#F7F5FC` | Background fills, category chips, avatars |
| **Primary Text** | `#171428` | Headings, titles, prices |
| **Secondary Text** | `#77738A` | Subtitles, descriptions, captions |
| **Border Color** | `#EAE6F3` | Clean subtle borders, card outlines |
| **Success** | `#16A34A` | Stock availability, order delivered badge |
| **Error** | `#EF4444` | Out of stock badge, log out, item removal |

---

## 📱 Implemented Screens & Feature Set

### 1. Main Reference Screens
- **Screen 1: Splash Screen (`app/index.tsx`)**
  - Full-screen rich purple gradient background (`#4A0D9B` to `#6515D5`).
  - Centered 3D shopping bag with purple cart emblem and floating shopping badges (gift box, discount tags, percent symbols).
  - Brand logo: "Shop" in white and "Easy" in `#FFB21A` orange.
  - Tagline: *"Shop Smarter. Live Better."*
  - Animated spinner ring and auto-session routing.
- **Screen 2: Onboarding 1 — Discover Amazing Products (`app/onboarding/index.tsx`)**
  - Wire shopping cart illustration filled with packages and `%` discount tag.
  - Heading, description, pagination indicator (1st dot active), Skip button, and purple "Next →" button.
- **Screen 3: Onboarding 2 — Shop with Confidence**
  - Purple 3D security shield with padlock, credit card, and green leaf accents.
  - Safe transactions description, pagination indicator (2nd dot active), and Next button.
- **Screen 4: Onboarding 3 — Fast & Reliable Delivery**
  - Courier delivery scooter illustration with ShopEasy parcel box.
  - "Get Started" button that marks onboarding complete in `AsyncStorage`.
- **Screen 5: Sign Up Screen (`app/(auth)/signup.tsx`)**
  - Soft lilac corner blob, ShopEasy logo, "Create Your Account" heading.
  - Form fields: Full Name, Email Address, Phone Number, Password (with eye toggle).
  - Required validation, email regex check, password length check.
  - Social auth buttons (Google, Apple, Facebook).
- **Screen 6: Login Screen (`app/(auth)/login.tsx`)**
  - "Welcome Back!" heading, email & password inputs, "Forgot Password?" link.
  - Purple "Login" button with loading state.
  - **Quick Demo Access Pills**: One-tap login as **Customer (Jane Doe)** or **Store Owner (Admin)**.
- **Screen 7: Customer Home Screen (`app/(tabs)/index.tsx`)**
  - Header: ShopEasy logo on left, notification bell with red badge "2" on right.
  - Rounded search bar: "Search for products...".
  - **Promotional Banner**: Deep purple gradient card with "Big Deals, Big Savings!", "Up to 50% OFF", yellow pill "Shop Now →", floating studio headphones, and carousel dots.
  - **Shop by Category**: Fashion, Electronics, Home, Beauty, More.
  - **Featured Products**: 2-Column grid featuring Casual Sneakers (₦25,000), Smart Watch (₦45,000), Wireless Earbuds (₦25,000), and Headphones Pro (₦40,000) with heart icon and purple cart button.
- **Screen 8: Customer Profile Screen (`app/(tabs)/profile.tsx`)**
  - Curved purple header gradient, circular avatar with white border (Jane Doe, jane.doe@gmail.com, edit pencil icon).
  - Options card: My Orders (with badge), My Addresses, Payment Methods, Notifications (badge "2"), Help & Support, About ShopEasy.
  - Distinct red **Log Out** button.

### 2. Additional Customer Shopping Journey Screens
- **Categories Screen (`app/(tabs)/categories.tsx`)**: Visual list of departments with category badges and item counts.
- **Product Listing Screen (`app/products/index.tsx`)**: Search, category filters, sorting (Featured, Price: Low-High, Price: High-Low, Newest), and 2-column grid.
- **Product Details Screen (`app/products/[id].tsx`)**: High-res image gallery, stock badge, discount %, price in Nigerian Naira, SKU, rating, quantity stepper, Wishlist heart, Add to Cart, and Buy Now.
- **Shopping Cart Screen (`app/(tabs)/cart.tsx`)**: Item list, quantity steppers, item deletion, promo code input (`EASY20` for 20% off), subtotal, delivery fee calculation, and total.
- **Checkout Screen (`app/checkout/index.tsx`)**: Shipping address entry, payment method picker (Simulated Card, Bank Transfer, Paystack Demo, Cash on Delivery), simulated payment modal, and order creation.
- **Order Details & Tracking Screen (`app/orders/[id].tsx`)**: Step-by-step progress timeline (Order Placed → Payment Confirmed → Processing → Out for Delivery → Delivered), itemized list, address details, and status updates.
- **Wishlist Screen (`app/wishlist/index.tsx`)**: Favorites list with quick Add-to-Cart and removal.
- **Forgot Password Screen (`app/(auth)/forgot-password.tsx`)**: Password recovery flow.
- **Profile Edit & Addresses (`app/profile/edit.tsx`, `app/profile/addresses.tsx`)**.

### 3. Store Owner / Admin Experience
- **Admin Dashboard (`app/admin/index.tsx`)**:
  - Protected route: Customers cannot access administrative functions.
  - Performance overview: Total Revenue (₦), Total Orders, Pending Orders, Total Customers.
  - Monthly Revenue Summary Bar Chart.
  - Recent customer orders overview.
- **Catalogue Management (`app/admin/products.tsx`)**: Search, category filtering, stock levels, Edit product, Delete product with instant catalogue update.
- **Add Product Screen (`app/admin/add-product.tsx`)**:
  - Product Name, SKU, Category, Description, Price, Original Price, Stock Quantity.
  - Image picker from device gallery (`expo-image-picker`) and custom image URLs with preview.
  - Featured product toggle & Active in catalogue toggle.
- **Edit Product Screen (`app/admin/edit-product.tsx`)**: Update existing products.
- **Order Management (`app/admin/orders.tsx`)**: View all customer orders, filter by status, update delivery status (Pending, Processing, Shipped, Delivered, Cancelled) with instant reflection in customer order tracking.

---

## 🏗️ Project Architecture

```text
shopeasy/
├── app/
│   ├── _layout.tsx              # Root app layout & context providers
│   ├── index.tsx                # Screen 1: Splash screen
│   ├── onboarding/
│   │   └── index.tsx            # Screens 2-4: Onboarding flow
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx            # Screen 6: Login screen
│   │   ├── signup.tsx           # Screen 5: Sign up screen
│   │   └── forgot-password.tsx  # Password recovery
│   ├── (tabs)/
│   │   ├── _layout.tsx          # 5-tab bottom navigation
│   │   ├── index.tsx            # Screen 7: Customer Home screen
│   │   ├── categories.tsx       # Categories screen
│   │   ├── cart.tsx             # Shopping Cart screen
│   │   ├── orders.tsx           # Order History screen
│   │   └── profile.tsx          # Screen 8: Customer Profile screen
│   ├── products/
│   │   ├── index.tsx            # Product catalog & filters
│   │   └── [id].tsx             # Product Details screen
│   ├── checkout/
│   │   └── index.tsx            # Checkout & payment simulation
│   ├── orders/
│   │   └── [id].tsx             # Order details & tracking timeline
│   ├── wishlist/
│   │   └── index.tsx            # Wishlist screen
│   ├── profile/
│   │   ├── edit.tsx             # Edit profile
│   │   └── addresses.tsx        # Manage addresses
│   └── admin/
│       ├── _layout.tsx          # Role-based protection guard
│       ├── index.tsx            # Store Owner Admin Dashboard
│       ├── products.tsx         # Product Management
│       ├── add-product.tsx      # Add Product form
│       ├── edit-product.tsx     # Edit Product form
│       └── orders.tsx           # Order fulfillment & status updates
├── components/
│   ├── common/                  # Logo, Button, Input, SearchBar, Badge, RoleSwitcher
│   ├── home/                    # PromoBanner, CategorySection
│   ├── product/                 # ProductCard
│   ├── cart/                    # CartItemCard
│   ├── admin/                   # StatCard, RevenueChart
│   └── illustrations/           # Scalable vector graphics matching reference
├── constants/
│   ├── colors.ts                # Palette matching design reference
│   ├── spacing.ts               # Radii, spacing, shadows
│   ├── typography.ts            # Font styles
│   └── theme.ts
├── context/
│   ├── AuthContext.tsx          # Session & user role management
│   ├── CartContext.tsx          # Cart items, quantities & totals
│   ├── WishlistContext.tsx      # Favorites & move to cart
│   ├── ProductContext.tsx       # Live catalogue state & CRUD
│   └── OrderContext.tsx         # Orders & status management
├── data/
│   ├── mock-categories.ts
│   ├── mock-products.ts
│   └── mock-orders.ts
├── services/
│   ├── supabase.ts              # Supabase client setup
│   ├── storage.service.ts       # AsyncStorage wrapper
│   ├── product.service.ts       # Product service (Supabase / local fallback)
│   ├── order.service.ts         # Order service
│   └── auth.service.ts          # Auth service
├── supabase/
│   ├── schema.sql               # Complete PostgreSQL schema & RLS policies
│   └── README.md                # Supabase configuration guide
├── app.json
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started & Expo Go Launch

### 1. Prerequisites
Make sure **Node.js LTS (v18 or v20+)** is installed on your computer. If you have not installed it yet:
- Download and run the official installer from [nodejs.org](https://nodejs.org).
- Verify in your terminal:
  ```bash
  node -v
  npm -v
  ```

### 2. Install Dependencies
In the project directory (`shopy easy`), run:
```bash
npm install
```

### 3. Start the Development Server
```bash
npx expo start
```

### 4. Test on Physical Devices (Android / iOS)
1. Install the free **Expo Go** application from Google Play Store (Android) or App Store (iOS).
2. Ensure your phone is connected to the same Wi-Fi network as your computer.
3. Scan the QR code displayed in the terminal using the Expo Go app (on Android) or the Camera app (on iOS).

### 5. Remote Testing Outside Your Network (Ngrok Tunneling)
If you want someone outside your local Wi-Fi (over mobile data 4G/5G, a different router, or in another city/country) to test the app on their phone:

```bash
npm run tunnel
# or
npx expo start --tunnel
# or (Windows PowerShell)
.\tunnel.ps1
```

This starts an encrypted **Ngrok tunnel** via `@expo/ngrok` and prints a public `exp://...` URL and QR code. Anyone in the world can scan the QR code or enter the link in their **Expo Go** app to test **ShopEasy** live!

For a full step-by-step remote sharing walkthrough, see [Remote Expo Go Guide](docs/REMOTE_EXPO_GO_GUIDE.md).

---

## 🔑 Demo Accounts & Role Switching

You can test both user roles out-of-the-box without manual database setup:

| Role | Email | Password | Access |
|---|---|---|---|
| **Customer** | `jane.doe@gmail.com` | `demo1234` | Home, Browse, Cart, Checkout, Orders, Wishlist, Profile |
| **Store Owner (Admin)** | `admin@shopeasy.com` | `admin1234` | Full Admin Dashboard, Add/Edit Products, Stock & Order Management |

A convenient **Role Switcher** pill is embedded at the bottom of the Customer Home and Profile screens, allowing instant toggling between **Customer Mode** and **Store Owner Mode** during testing.
