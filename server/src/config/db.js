import mongoose from 'mongoose';

import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');
  try {
    await mongoose.connect(uri, { autoIndex: true });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err.message);
    process.exit(1);
  }
}
