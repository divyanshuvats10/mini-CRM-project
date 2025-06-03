const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const axios = require('axios');

const { connectRedis } = require('./redisClient');
connectRedis()
  .then(() => console.log('Redis connected'))
  .catch(err => console.error('Redis connection error:', err));

const app = express();

const allowedOrigins = [
  'https://mini-crm-frontend-flame.vercel.app',
  'http://localhost:5173',
  'https://mini-crm-two-chi.vercel.app',
  /\.vercel\.app$/, // Allow all Vercel apps for your project
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches Vercel pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
  exposedHeaders: ['Set-Cookie', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Add specific headers for cross-origin cookie support
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.some(allowed => {
    if (typeof allowed === 'string') return allowed === origin;
    if (allowed instanceof RegExp) return allowed.test(origin);
    return false;
  })) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  }
  next();
});

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId', // Customize session name
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600, // lazy session update
    ttl: 24 * 60 * 60 // = 24 hours. Default session TTL
  }),
  cookie: {
    secure: true, // Always true for cross-origin
    httpOnly: true, // Prevent XSS attacks
    sameSite: 'none', // Required for cross-origin
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: undefined, // Don't set domain for cross-origin cookies
    partitioned: true // For Chrome's new cookie partitioning
  },
  rolling: true // Reset the cookie MaxAge on every request
}));

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

const { ensureAuthenticated } = require('./middleware/auth');
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.send('Welcome to your dashboard!');
});

const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

const customerRoutes = require('./routes/customer');
app.use('/api/customers', customerRoutes);

const orderRoutes = require('./routes/order');
app.use('/api/orders', orderRoutes);

const segmentRoutes = require('./routes/segment');
app.use('/api/segments', segmentRoutes);

const campaignRoutes = require('./routes/campaign');
app.use('/api/campaigns', campaignRoutes);

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Add Redis stream health check endpoints
app.get('/api/debug/streams', async (req, res) => {
  try {
    const { redisClient } = require('./redisClient');
    
    // Check stream lengths
    const customerStreamLength = await redisClient.xLen('customer_stream');
    const orderStreamLength = await redisClient.xLen('order_stream');
    
    // Get last few messages from each stream (for debugging)
    const customerMessages = await redisClient.xRevRange('customer_stream', '+', '-', { COUNT: 5 });
    const orderMessages = await redisClient.xRevRange('order_stream', '+', '-', { COUNT: 5 });
    
    res.json({
      streams: {
        customer_stream: {
          length: customerStreamLength,
          lastMessages: customerMessages
        },
        order_stream: {
          length: orderStreamLength,
          lastMessages: orderMessages
        }
      },
      consumerStatus: 'Check server logs for consumer activity',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stream info', details: err.message });
  }
});

// Add endpoint to manually process existing queue (temporary fix)
app.post('/api/debug/process-all-queued', async (req, res) => {
  try {
    const { redisClient } = require('./redisClient');
    const Customer = require('./models/customer');
    const Order = require('./models/order');
    
    let processed = {
      customers: 0,
      orders: 0,
      errors: []
    };

    // Process customer messages
    try {
      const customerMessages = await redisClient.xRange('customer_stream', '-', '+');
      console.log(`Found ${customerMessages.length} customer messages to process`);
      
      for (const message of customerMessages) {
        try {
          const fields = message.message;
          const parsedData = {
            name: fields.name,
            email: fields.email.toLowerCase().trim(),
            totalSpend: Number(fields.totalSpend) || 0,
            lastActive: fields.lastActive ? new Date(fields.lastActive) : new Date(),
            visits: parseInt(fields.visits) || 0
          };

          if (!(await Customer.exists({ email: parsedData.email }))) {
            await Customer.create(parsedData);
            processed.customers++;
          }
        } catch (err) {
          processed.errors.push(`Customer ${message.id}: ${err.message}`);
        }
      }
    } catch (err) {
      processed.errors.push(`Customer processing: ${err.message}`);
    }

    // Process order messages
    try {
      const orderMessages = await redisClient.xRange('order_stream', '-', '+');
      console.log(`Found ${orderMessages.length} order messages to process`);
      
      for (const message of orderMessages) {
        try {
          const fields = message.message;
          
          let items = [];
          if (fields.items) {
            try {
              items = typeof fields.items === 'string' ? JSON.parse(fields.items) : fields.items;
            } catch (e) {
              items = [];
            }
          }

          const parsedOrder = {
            customerEmail: fields.customerEmail,
            amount: Number(fields.amount) || 0,
            date: fields.date ? new Date(fields.date) : new Date(),
            items: items
          };

          if (parsedOrder.customerEmail && parsedOrder.amount > 0) {
            await Order.create(parsedOrder);
            processed.orders++;
          }
        } catch (err) {
          processed.errors.push(`Order ${message.id}: ${err.message}`);
        }
      }
    } catch (err) {
      processed.errors.push(`Order processing: ${err.message}`);
    }

    res.json({
      message: 'Manual processing completed',
      processed,
      note: 'This is a temporary fix. The consumer should handle this automatically.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process queue manually', details: err.message });
  }
});

// Add endpoint to check if consumer is processing
app.get('/api/debug/consumer-test', async (req, res) => {
  try {
    const { redisClient } = require('./redisClient');
    
    // Add a test message to see if consumer picks it up
    const testMessage = {
      customerEmail: 'test@consumer-debug.com',
      amount: '99.99',
      date: new Date().toISOString(),
      items: JSON.stringify([{ name: 'Test Item', price: 99.99 }])
    };
    
    const messageId = await redisClient.xAdd('order_stream', '*', testMessage);
    
    res.json({
      message: 'Test message added to order_stream',
      messageId: messageId,
      testData: testMessage,
      instruction: 'Check server logs to see if consumer processes this message'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add test message', details: err.message });
  }
});

// Debug endpoint to test order processing directly
app.post('/api/debug/test-order', async (req, res) => {
  try {
    const Order = require('./models/order');
    const { customerEmail, amount, date, items } = req.body;
    
    // Test the same logic as the consumer
    let parsedItems = [];
    if (items) {
      if (typeof items === 'string') {
        parsedItems = JSON.parse(items);
      } else if (Array.isArray(items)) {
        parsedItems = items;
      }
    }
    
    const orderData = {
      customerEmail,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      items: parsedItems
    };
    
    console.log('Direct order test data:', orderData);
    const order = await Order.create(orderData);
    
    res.json({ success: true, order });
  } catch (err) {
    console.error('Direct order test failed:', err);
    res.status(500).json({ error: err.message, details: err });
  }
});

// Add consumer health check endpoint
app.get('/api/debug/consumer-health', async (req, res) => {
  try {
    const { redisClient } = require('./redisClient');
    
    // Check Redis connection
    const redisConnected = redisClient.isOpen;
    let redisPing = null;
    if (redisConnected) {
      try {
        redisPing = await redisClient.ping();
      } catch (e) {
        redisPing = `Error: ${e.message}`;
      }
    }
    
    // Check MongoDB connection
    const mongoConnected = require('mongoose').connection.readyState === 1;
    
    // Get current stream lengths
    let streamStatus = {};
    if (redisConnected) {
      try {
        streamStatus = {
          customer_stream: await redisClient.xLen('customer_stream'),
          order_stream: await redisClient.xLen('order_stream')
        };
      } catch (e) {
        streamStatus = { error: e.message };
      }
    }
    
    res.json({
      timestamp: new Date().toISOString(),
      redis: {
        connected: redisConnected,
        ping: redisPing
      },
      mongodb: {
        connected: mongoConnected,
        state: require('mongoose').connection.readyState
      },
      streams: streamStatus,
      note: "Check server logs for consumer activity and heartbeat messages"
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Health check failed', 
      details: err.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



