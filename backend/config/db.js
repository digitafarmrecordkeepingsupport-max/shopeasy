const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      'mongodb://localhost:27017/shopeasy';

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
