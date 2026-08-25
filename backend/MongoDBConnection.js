import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let isConnected = false;

// Attach global Mongoose connection event listeners for clear status logging
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log(`✅ MongoDB Connected successfully to database: ${process.env.DBName || 'financeai'}`);
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error("❌ MongoDB Connection Failed:", err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn("⚠️ MongoDB Disconnected");
});

const ConnectMongoDB = async () => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    return;
  }

  let uri = process.env.MONGO_URI || process.env.MONGODB_URI || '';
  uri = uri.trim().replace(/^["']|["']$/g, '');

  let dbName = process.env.DBName || process.env.DB_NAME || 'arua_finance';
  dbName = dbName.trim().replace(/^["']|["']$/g, '');

  if (!uri) {
    console.warn("⚠️ MONGO_URI is not defined in environment variables. MongoDB connection skipped.");
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    isConnected = true;
    return conn;
  } catch (error) {
    isConnected = false;
    console.error("❌ MongoDB Connection Failed:", error.message);
    throw error;
  }
};

const DisConnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("MongoDB Disconnected");
  } catch (error) {
    console.error("Error disconnecting MongoDB:", error.message);
  }
};

const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

export { ConnectMongoDB, DisConnectMongoDB, isDbConnected };