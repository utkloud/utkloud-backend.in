import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://UtkloudAdmin:yayakhan@utkloudadmin.y2yhqtx.mongodb.net/academy?appName=UtkloudAdmin';
    
    // Validate URI format
    if (!mongoURI || mongoURI.trim() === '') {
      throw new Error('MongoDB URI is empty or not set');
    }
    
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;