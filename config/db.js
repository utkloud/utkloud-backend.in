import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://academy-website:11223344@cluster0.jctj5xk.mongodb.net/?appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;