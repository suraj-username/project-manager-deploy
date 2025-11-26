import mongoose from 'mongoose';

const connectDB = async () => {
  /*try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);*/

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // --- Connection Pooling Options ---
      maxPoolSize: 10, 
      minPoolSize: 2, 
      socketTimeoutMS: 45000,
    });
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
