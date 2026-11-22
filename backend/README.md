# ShopEasy — Backend API Server

A standalone Node.js & Express REST API backend powered by **MongoDB Atlas** and **Cloudinary**.

## 📁 Structure

```text
backend/
├── config/
│   ├── db.js             # Mongoose MongoDB Atlas connection
│   └── cloudinary.js     # Cloudinary media configuration
├── models/
│   ├── User.js           # Admin and customer profiles
│   ├── Product.js        # Products catalog
│   ├── Category.js       # Product categories
│   ├── Order.js          # Orders with item line snapshots
│   ├── MarketingCampaign.js
│   └── StoreSettings.js
├── routes/
│   ├── productRoutes.js   # /api/products
│   ├── categoryRoutes.js  # /api/categories
│   ├── orderRoutes.js     # /api/orders
│   ├── customerRoutes.js  # /api/customers
│   ├── marketingRoutes.js # /api/marketing
│   └── uploadRoutes.js    # /api/upload (Cloudinary)
├── server.js              # Express application entrypoint
└── package.json
```

## 🚀 Running the Server Locally

From project root:
```bash
npm run backend:dev
```
Or inside `backend`:
```bash
node server.js
```

Server runs on: `http://localhost:5000`
- Products API: `http://localhost:5000/api/products`
- Categories API: `http://localhost:5000/api/categories`
- Orders API: `http://localhost:5000/api/orders`
- Cloudinary Upload: `http://localhost:5000/api/upload`
