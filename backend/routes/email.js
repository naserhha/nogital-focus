const express = require('express');
const rateLimit = require('express-rate-limit');
const Email = require('../models/Email');
const { validateEmail } = require('../middleware/validation');

const router = express.Router();

// Rate limiting: 5 requests per 15 minutes per IP
const emailRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many email subscription attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Subscribe email endpoint
router.post('/subscribe', emailRateLimit, validateEmail, async (req, res) => {
  try {
    const { email, source = 'landing_page' } = req.body;
    
    // Check if email already exists
    const existingEmail = await Email.findOne({ email: email.toLowerCase() });
    
    if (existingEmail) {
      if (existingEmail.subscribed) {
        return res.status(200).json({
          success: true,
          message: 'Email already subscribed!',
          data: { email: existingEmail.email }
        });
      } else {
        // Re-subscribe if previously unsubscribed
        existingEmail.subscribed = true;
        await existingEmail.save();
        
        return res.status(200).json({
          success: true,
          message: 'Welcome back! You have been re-subscribed.',
          data: { email: existingEmail.email }
        });
      }
    }

    // Create new email subscription
    const newEmail = new Email({
      email: email.toLowerCase(),
      source,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await newEmail.save();

    res.status(201).json({
      success: true,
      message: 'Email subscribed successfully!',
      data: { email: newEmail.email }
    });

  } catch (error) {
    console.error('Email subscription error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Email already subscribed!',
        data: { email: req.body.email }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Unsubscribe email endpoint
router.post('/unsubscribe', validateEmail, async (req, res) => {
  try {
    const { email } = req.body;
    
    const emailDoc = await Email.findOne({ email: email.toLowerCase() });
    
    if (!emailDoc) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our database.'
      });
    }

    emailDoc.subscribed = false;
    await emailDoc.save();

    res.status(200).json({
      success: true,
      message: 'Email unsubscribed successfully.'
    });

  } catch (error) {
    console.error('Email unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Get subscription status
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const emailDoc = await Email.findOne({ email: email.toLowerCase() });
    
    if (!emailDoc) {
      return res.status(404).json({
        success: false,
        message: 'Email not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        email: emailDoc.email,
        subscribed: emailDoc.subscribed,
        createdAt: emailDoc.createdAt
      }
    });

  } catch (error) {
    console.error('Email status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Email service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 