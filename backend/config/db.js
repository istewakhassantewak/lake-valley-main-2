const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://lakevalleyistewak_db_user:Istee%4068673@cluster0.mkfar4r.mongodb.net/?appName=Cluster0';
  if (!uri) {
    console.warn('MONGODB_URI is not set. Database operating in fallback mode.');
    return;
  }
  mongoose.set('strictQuery', true);
  mongoose.set('bufferCommands', false);
  await mongoose.connect(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 45000,
  });
  console.log('MongoDB connected');
}

module.exports = connectDB;
