# ShopEasy — Vercel Deployment Guide

This guide walks you through deploying the **ShopEasy Web Admin & REST API Backend** (`admin-web/`) on **Vercel** with your live **MongoDB Atlas** database and **Cloudinary** media storage.

Once deployed, your Web Admin Dashboard and backend REST API will be accessible globally via your Vercel URL (e.g., `https://shopeasy-admin.vercel.app`).

---

## 📋 Prerequisites Check

Before deploying, ensure you have:
1. **GitHub Account**: To host your repository.
2. **Vercel Account**: Free account at [vercel.com](https://vercel.com).
3. **MongoDB Connection String**:
   ```text
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopeasy?retryWrites=true&w=majority
   ```
4. **Cloudinary Credentials**:
   - Cloud Name: `your-cloudinary-cloud-name`
   - API Key: `your-cloudinary-api-key`
   - API Secret: `your-cloudinary-api-secret`

---

## 🚀 Method 1: Deploy via GitHub & Vercel Dashboard (Recommended)

### Step 1: Push Project to GitHub
If your project is not yet on GitHub:
1. Create a new repository on [github.com](https://github.com) named `shopeasy`.
2. In your terminal (from `c:\Users\USER\Downloads\shopy easy`):
   ```bash
   git init
   git add .
   git commit -m "Complete ShopEasy platform with MongoDB & Cloudinary"
   git branch -M main
   git remote add origin https://github.com/<your-username>/shopeasy.git
   git push -u origin main
   ```

### Step 2: Import into Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Under **"Import Git Repository"**, find your `shopeasy` repository and click **"Import"**.

### Step 3: Configure Project Root Directory (CRITICAL ⚠️)
Because your Next.js application lives inside the `admin-web/` folder:
1. Locate the **"Root Directory"** setting on the setup screen.
2. Click **"Edit"** next to Root Directory.
3. Select or type: **`admin-web`** and click **Continue**.

> 💡 *Vercel will now automatically detect Next.js 15, build commands (`next build`), and output directory (`.next`).*

### Step 4: Add Environment Variables
Scroll down to the **"Environment Variables"** section and add the following 5 variables:

| Key | Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/shopeasy?retryWrites=true&w=majority` |
| `CLOUDINARY_CLOUD_NAME` | `your-cloudinary-cloud-name` |
| `CLOUDINARY_API_KEY` | `your-cloudinary-api-key` |
| `CLOUDINARY_API_SECRET` | `your-cloudinary-api-secret` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `your-cloudinary-cloud-name` |

*(Optional)* If you also wish to keep Supabase fallback active:
- `NEXT_PUBLIC_SUPABASE_URL`: `your-supabase-url`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your-supabase-anon-key`

### Step 5: Click Deploy
Click the blue **"Deploy"** button.
- Vercel will clone `admin-web`, install dependencies, run `next build`, and optimize serverless API routes.
- Within 1–2 minutes, you will see the confetti celebration screen! 🎉

---

## ⚡ Method 2: Deploy via Vercel CLI (From Your Computer)

You can also deploy directly from PowerShell without pushing to GitHub first:

### Step 1: Open Terminal in `admin-web`
```powershell
cd "c:\Users\USER\Downloads\shopy easy\admin-web"
```

### Step 2: Run Vercel CLI
```powershell
npx vercel
```
- When asked: *"Set up and deploy?"* → Press **Y**.
- Which scope? → Select your personal account.
- Link to existing project? → Type **N**.
- Project name? → `shopeasy-admin` (or press Enter).
- In which directory is your code located? → Press **Enter** (for current directory `./`).
- Want to modify settings? → Type **N**.

### Step 3: Add Environment Variables in CLI
```powershell
npx vercel env add MONGODB_URI production
# Paste your MongoDB URI from your .env file

npx vercel env add CLOUDINARY_CLOUD_NAME production
# Paste your Cloudinary cloud name

npx vercel env add CLOUDINARY_API_KEY production
# Paste your Cloudinary API key

npx vercel env add CLOUDINARY_API_SECRET production
# Paste your Cloudinary API secret

npx vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME production
# Paste your Cloudinary cloud name
```

### Step 4: Deploy to Production
```powershell
npx vercel --prod
```
Vercel will output your live URL: `https://shopeasy-admin.vercel.app`.

---

## 📱 Connecting the Mobile App (Expo Go) to Your Live Vercel Backend

Once your Vercel deployment is live (e.g. `https://shopeasy-admin.vercel.app`):

1. Open your root `.env` file in `c:\Users\USER\Downloads\shopy easy\.env`.
2. Update the backend API URL:
   ```env
   EXPO_PUBLIC_API_URL=https://your-shopeasy-domain.vercel.app/api
   ```
3. Restart Metro:
   ```powershell
   npx expo start --tunnel -c
   ```
4. Now, orders placed on your mobile phone via **Expo Go** will sync live to your Vercel web admin and save straight into your **MongoDB Atlas** database!
