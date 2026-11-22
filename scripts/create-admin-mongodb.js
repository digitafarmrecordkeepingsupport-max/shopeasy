/**
 * ShopEasy — Create Store Admin Account in MongoDB
 *
 * Usage:
 *   node scripts/create-admin-mongodb.js [email] [password] [fullName]
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb://localhost:27017/shopeasy';

const email = (process.argv[2] || 'admin@shopeasy.com').toLowerCase().trim();
const password = process.argv[3] || 'admin1234';
const fullName = process.argv[4] || 'Store Admin';

async function createAdmin() {
  console.log(`👤 Provisioning Admin: ${email} (${fullName})...`);

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    const db = mongoose.connection.db;

    const existing = await db.collection('users').findOne({ email });

    if (existing) {
      await db.collection('users').updateOne(
        { email },
        {
          $set: {
            role: 'super_admin',
            accountStatus: 'active',
            fullName,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`✅ Existing user ${email} upgraded to super_admin in MongoDB!`);
    } else {
      await db.collection('users').insertOne({
        email,
        fullName,
        role: 'super_admin',
        accountStatus: 'active',
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ New super_admin user created successfully: ${email}`);
    }
  } catch (err) {
    console.error('❌ Error creating admin in MongoDB:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
