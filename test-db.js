import connectDB from './config/db.js';
import Enrollment from './models/Enrollment.js';

// Connect to MongoDB
connectDB();

// Test data
const testData = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  course: 'AZ-104 Administrator',
  experience: 'beginner',
  message: 'This is a test enrollment',
  type: 'enrollment'
};

// Save test data
const saveTestData = async () => {
  try {
    const enrollment = new Enrollment(testData);
    const savedEnrollment = await enrollment.save();
    console.log('Test enrollment saved:', savedEnrollment);
    
    // Retrieve all enrollments
    const enrollments = await Enrollment.find();
    console.log('All enrollments:', enrollments);
    
    // Close connection
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

saveTestData();