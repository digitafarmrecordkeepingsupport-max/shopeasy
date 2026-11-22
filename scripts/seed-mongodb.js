/**
 * ShopEasy — Standalone MongoDB Seed Script
 *
 * Populates MongoDB with store settings, 12 categories, products,
 * initial orders, customer profiles, and marketing campaigns.
 *
 * Usage:
 *   node scripts/seed-mongodb.js [mongodb_connection_uri]
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI =
  process.argv[2] ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb://localhost:27017/shopeasy';

async function seed() {
  console.log('🔄 Connecting to MongoDB:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('✅ Connected to MongoDB successfully.');

    const db = mongoose.connection.db;

    // 1. Seed Store Settings
    console.log('📦 Seeding Store Settings...');
    await db.collection('storesettings').deleteMany({});
    await db.collection('storesettings').insertOne({
      storeName: 'ShopEasy',
      storeEmail: 'support@shopeasy.com',
      currency: 'NGN',
      currencySymbol: '₦',
      taxRatePercent: 0,
      deliveryFeeStandard: 2000,
      minFreeDeliveryThreshold: 50000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 2. Seed 12 Categories
    console.log('📦 Seeding 12 Categories (matching UI design)...');
    await db.collection('categories').deleteMany({});
    const categories = [
      {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Trendy clothing and fashion items',
        iconName: 'shirt',
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400',
        color: '#F3E8FF',
        isActive: true,
        itemCount: 42,
        displayOrder: 1,
      },
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest electronics and gadgets',
        iconName: 'laptop',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=400',
        color: '#EDE9FE',
        isActive: true,
        itemCount: 56,
        displayOrder: 2,
      },
      {
        name: 'Home',
        slug: 'home',
        description: 'Home and living essentials',
        iconName: 'home',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400',
        color: '#F5F3FF',
        isActive: true,
        itemCount: 38,
        displayOrder: 3,
      },
      {
        name: 'Beauty',
        slug: 'beauty',
        description: 'Beauty and personal care products',
        iconName: 'sparkles',
        imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400',
        color: '#FDF2F8',
        isActive: true,
        itemCount: 28,
        displayOrder: 4,
      },
      {
        name: 'Sports',
        slug: 'sports',
        description: 'Sports and fitness equipment',
        iconName: 'football',
        imageUrl: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?q=80&w=400',
        color: '#F0FDF4',
        isActive: true,
        itemCount: 20,
        displayOrder: 5,
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Fashion accessories and more',
        iconName: 'bag',
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400',
        color: '#FEF3C7',
        isActive: false,
        itemCount: 14,
        displayOrder: 6,
      },
      {
        name: 'Books',
        slug: 'books',
        description: 'Fiction, non-fiction and educational books',
        iconName: 'book',
        imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400',
        color: '#F5F3FF',
        isActive: true,
        itemCount: 10,
        displayOrder: 7,
      },
      {
        name: 'Gaming',
        slug: 'gaming',
        description: 'Consoles, video games and accessories',
        iconName: 'gamepad',
        imageUrl: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?q=80&w=400',
        color: '#EDE9FE',
        isActive: true,
        itemCount: 12,
        displayOrder: 8,
      },
      {
        name: 'Jewelry',
        slug: 'jewelry',
        description: 'Fine rings, necklaces and luxury timepieces',
        iconName: 'watch',
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400',
        color: '#FDF2F8',
        isActive: true,
        itemCount: 6,
        displayOrder: 9,
      },
      {
        name: 'Groceries',
        slug: 'groceries',
        description: 'Pantry essentials, beverages and fresh food',
        iconName: 'shopping-cart',
        imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400',
        color: '#F0FDF4',
        isActive: true,
        itemCount: 10,
        displayOrder: 10,
      },
      {
        name: 'Toys',
        slug: 'toys',
        description: 'Kids toys, board games and collectibles',
        iconName: 'smile',
        imageUrl: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=400',
        color: '#FEF3C7',
        isActive: true,
        itemCount: 8,
        displayOrder: 11,
      },
      {
        name: 'Automotive',
        slug: 'automotive',
        description: 'Car care products, gadgets and spare parts',
        iconName: 'truck',
        imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=400',
        color: '#F1F5F9',
        isActive: false,
        itemCount: 4,
        displayOrder: 12,
      },
    ];
    await db.collection('categories').insertMany(categories);

    // 3. Seed Products
    console.log('📦 Seeding Products...');
    await db.collection('products').deleteMany({});
    const products = [
      {
        name: 'Wireless Earbuds',
        slug: 'wireless-earbuds',
        description: 'White wireless earbuds with charging case and active noise cancellation.',
        categoryId: 'electronics',
        categoryName: 'Electronics',
        price: 25000,
        originalPrice: 32000,
        stockQuantity: 45,
        sku: 'SE-EBD-003',
        imageUrls: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800'],
        isFeatured: true,
        isActive: true,
        rating: 4.8,
        ratingCount: 210,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Smart Watch',
        slug: 'smart-watch',
        description: 'Black smartwatch featuring AMOLED display, heart rate tracking, and fitness sensors.',
        categoryId: 'electronics',
        categoryName: 'Electronics',
        price: 45000,
        originalPrice: 60000,
        stockQuantity: 28,
        sku: 'SE-WTC-002',
        imageUrls: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800'],
        isFeatured: true,
        isActive: true,
        rating: 4.9,
        ratingCount: 89,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Casual Sneakers',
        slug: 'casual-sneakers',
        description: 'Black-and-white sneakers built with breathable leather and cushioned insoles.',
        categoryId: 'fashion',
        categoryName: 'Fashion',
        price: 35000,
        originalPrice: 50000,
        stockQuantity: 32,
        sku: 'SE-SNK-001',
        imageUrls: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800'],
        isFeatured: true,
        isActive: true,
        rating: 4.8,
        ratingCount: 124,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'Studio over-ear titanium ANC headphones with 45 hours battery life.',
        categoryId: 'electronics',
        categoryName: 'Electronics',
        price: 47000,
        originalPrice: 65000,
        stockQuantity: 19,
        sku: 'SE-HDP-004',
        imageUrls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'],
        isFeatured: true,
        isActive: true,
        rating: 4.9,
        ratingCount: 340,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Handbag',
        slug: 'handbag',
        description: 'Luxurious maroon leather handbag with gold hardware and shoulder strap.',
        categoryId: 'accessories',
        categoryName: 'Accessories',
        price: 28000,
        originalPrice: 36000,
        stockQuantity: 14,
        sku: 'SE-HBG-009',
        imageUrls: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800'],
        isFeatured: true,
        isActive: true,
        rating: 4.8,
        ratingCount: 92,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection('products').insertMany(products);

    // 4. Seed Marketing Campaigns
    console.log('📦 Seeding Marketing Campaigns...');
    await db.collection('marketingcampaigns').deleteMany({});
    const campaigns = [
      {
        name: 'Summer Sale',
        type: 'Discount',
        startDate: 'Jul 1, 2025',
        endDate: 'Jul 31, 2025',
        status: 'Active',
        thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400',
        discountRate: '30%',
        reach: 18400,
        clicks: 4920,
        conversions: 1240,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'New Arrivals',
        type: 'Product Launch',
        startDate: 'Jun 15, 2025',
        endDate: 'Jul 15, 2025',
        status: 'Active',
        thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400',
        reach: 15300,
        clicks: 3850,
        conversions: 970,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Free Delivery',
        type: 'Shipping',
        startDate: 'Jun 1, 2025',
        endDate: 'Jun 30, 2025',
        status: 'Completed',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400',
        discountRate: 'Free Shipping',
        reach: 9200,
        clicks: 2150,
        conversions: 580,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Back to School',
        type: 'Seasonal',
        startDate: 'May 1, 2025',
        endDate: 'May 31, 2025',
        status: 'Completed',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=400',
        discountRate: '15%',
        reach: 5850,
        clicks: 1460,
        conversions: 370,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection('marketingcampaigns').insertMany(campaigns);

    // 5. Seed Users & Super Admin
    console.log('📦 Seeding Super Admin & Customer accounts...');
    await db.collection('users').deleteMany({});
    const users = [
      {
        email: 'admin@shopeasy.com',
        fullName: 'Store Admin',
        role: 'super_admin',
        accountStatus: 'active',
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'jane.doe@mail.com',
        fullName: 'Jane Doe',
        phoneNumber: '08012345678',
        role: 'customer',
        accountStatus: 'active',
        totalOrders: 5,
        totalSpent: 245000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'michael.johnson@mail.com',
        fullName: 'Michael Johnson',
        phoneNumber: '08087654321',
        role: 'customer',
        accountStatus: 'active',
        totalOrders: 3,
        totalSpent: 127000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection('users').insertMany(users);

    console.log('🎉 MongoDB seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

seed();
