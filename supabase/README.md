# Supabase Integration Guide for ShopEasy

This guide explains how to connect your **ShopEasy** React Native / Expo application to a live **Supabase** backend for authentication, database storage, and product image uploads.

---

## 1. Create a Supabase Project

1. Visit [supabase.com](https://supabase.com) and create an account or sign in.
2. Click **New project**, choose your preferred organization, name it `shopeasy`, and set a strong database password.
3. Select a region close to your primary audience (e.g. Europe or South Africa for West Africa).

---

## 2. Execute the Database Schema

1. Go to your Supabase Project Dashboard and open the **SQL Editor** tab from the left sidebar.
2. Click **New Query**.
3. Copy the entire contents of [`supabase/schema.sql`](./schema.sql) and paste it into the query editor.
4. Click **Run** (or `Ctrl + Enter`).
5. All tables (`profiles`, `categories`, `products`, `orders`, `order_items`, `addresses`, `wishlists`), foreign keys, RLS security policies, and initial demo data will be created instantly.

---

## 3. Create Product Images Storage Bucket

1. In Supabase, go to the **Storage** section.
2. Click **New bucket**.
3. Set Name to `product-images`.
4. Check **Public bucket** (so product image URLs can be rendered by the mobile application).
5. Add the following Storage RLS policies:
   - **SELECT**: Allow public read access to everyone.
   - **INSERT / UPDATE / DELETE**: Allow only authenticated users with `role = 'admin'` to upload or delete images.

---

## 4. Configure Application Environment Variables

1. Go to **Project Settings** -> **API** in the Supabase Dashboard.
2. Copy your **Project URL** and **anon public key**.
3. In the root of your `shopeasy` project, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Fill in your keys:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
   ```
5. Restart Expo:
   ```bash
   npx expo start -c
   ```

---

## 5. Offline Demo Mode Fallback

If no Supabase credentials are provided, **ShopEasy** automatically runs in high-fidelity offline demo mode using local `AsyncStorage`. All cart actions, wishlist toggles, checkout operations, product additions, stock changes, and order status tracking work out of the box with zero external dependencies.
