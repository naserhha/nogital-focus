const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:3000',
    'https://yourdomain.com', // Replace with your actual domain
    'https://nogital-focus.web.app'
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Email validation middleware
const validateEmail = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
    .trim(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Subscribe email endpoint
app.post('/subscribe', emailRateLimit, validateEmail, async (req, res) => {
  try {
    const { email, source = 'landing_page' } = req.body;
    const normalizedEmail = email.toLowerCase();
    
    // Check if email already exists
    const emailRef = db.collection('emails').doc(normalizedEmail);
    const emailDoc = await emailRef.get();
    
    if (emailDoc.exists) {
      const data = emailDoc.data();
      
      if (data.subscribed) {
        return res.status(200).json({
          success: true,
          message: 'Email already subscribed!',
          data: { email: data.email }
        });
      } else {
        // Re-subscribe if previously unsubscribed
        await emailRef.update({
          subscribed: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return res.status(200).json({
          success: true,
          message: 'Welcome back! You have been re-subscribed.',
          data: { email: data.email }
        });
      }
    }

    // Create new email subscription
    const emailData = {
      email: normalizedEmail,
      source,
      subscribed: true,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await emailRef.set(emailData);

    res.status(201).json({
      success: true,
      message: 'Email subscribed successfully!',
      data: { email: normalizedEmail }
    });

  } catch (error) {
    console.error('Email subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Unsubscribe email endpoint
app.post('/unsubscribe', validateEmail, async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase();
    
    const emailRef = db.collection('emails').doc(normalizedEmail);
    const emailDoc = await emailRef.get();
    
    if (!emailDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our database.'
      });
    }

    await emailRef.update({
      subscribed: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

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
app.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase();
    
    const emailRef = db.collection('emails').doc(normalizedEmail);
    const emailDoc = await emailRef.get();
    
    if (!emailDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Email not found.'
      });
    }

    const data = emailDoc.data();
    res.status(200).json({
      success: true,
      data: {
        email: data.email,
        subscribed: data.subscribed,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
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

// Get all subscribers (admin only - add authentication in production)
app.get('/subscribers', async (req, res) => {
  try {
    const snapshot = await db.collection('emails')
      .where('subscribed', '==', true)
      .orderBy('createdAt', 'desc')
      .get();
    
    const subscribers = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      subscribers.push({
        email: data.email,
        source: data.source,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });

    res.status(200).json({
      success: true,
      data: {
        count: subscribers.length,
        subscribers
      }
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Email service is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'NoGital Focus Firebase Functions API',
    version: '1.0.0',
    endpoints: {
      email: {
        subscribe: 'POST /subscribe',
        unsubscribe: 'POST /unsubscribe',
        status: 'GET /status/:email',
        subscribers: 'GET /subscribers',
        health: 'GET /health'
      }
    }
  });
});

// Export the Express app as a Firebase Function
exports.emailApi = functions.https.onRequest(app); 