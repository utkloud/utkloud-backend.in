import mongoose from 'mongoose';

const ourSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    trim: true,
    default: 'general'
  },
  // Course-specific fields
  price: {
    type: String,
    trim: true
  },
  badge: {
    type: String,
    trim: true
  },
  tag: {
    type: String,
    trim: true
  },
  popular: {
    type: Boolean,
    default: false
  },
  features: {
    type: [String],
    default: []
  },
  subtitle: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Add index for ordering
ourSectionSchema.index({ order: 1, createdAt: -1 });
ourSectionSchema.index({ category: 1 });

const OurSection = mongoose.model('OurSection', ourSectionSchema);

export default OurSection;

