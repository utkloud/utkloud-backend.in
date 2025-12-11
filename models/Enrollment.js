import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['enrollment', 'contact']
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
enrollmentSchema.index({ createdAt: -1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ email: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;