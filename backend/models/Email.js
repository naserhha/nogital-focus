const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  source: {
    type: String,
    default: 'landing_page',
    enum: ['landing_page', 'newsletter', 'beta_signup']
  },
  subscribed: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Index for faster queries
emailSchema.index({ email: 1 });
emailSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure email is lowercase
emailSchema.pre('save', function(next) {
  this.email = this.email.toLowerCase();
  next();
});

module.exports = mongoose.model('Email', emailSchema); 