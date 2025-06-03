// services/unifiedConsumer.js
require('dotenv').config();
const { redisClient, connectRedis } = require('../redisClient');
const Customer = require('../models/customer');
const Order = require('../models/order');
const mongoose = require('mongoose');

console.log('🚀 CONSUMER STARTING - PID:', process.pid);
console.log('🚀 Environment variables check:');
console.log('  - MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('  - REDIS_URL exists:', !!process.env.REDIS_URL);

// Track last processed IDs for each stream
const lastIds = {
  customer: '0-0',
  order: '0-0'
};

// Customer processing logic
async function processCustomer(fields) {
  try {
    console.log('Processing customer fields:', fields);
    
    const parsedData = {
      name: fields.name,
      email: fields.email.toLowerCase().trim(),
      totalSpend: Number(fields.totalSpend) || 0,
      lastActive: fields.lastActive ? new Date(fields.lastActive) : new Date(),
      visits: parseInt(fields.visits) || 0
    };

    console.log('Parsed customer data:', parsedData);

    if (await Customer.exists({ email: parsedData.email })) {
      console.log(`Skipping duplicate email: ${parsedData.email}`);
      return { skipped: true };
    }

    const customer = await Customer.create(parsedData);
    console.log('Successfully created customer:', customer);
    return { success: true };
  } catch (err) {
    console.error('Error in processCustomer:', err);
    if (err.code === 11000) return { skipped: true };
    throw err;
  }
}

// Order processing logic
async function processOrder(fields) {
  try {
    console.log('Processing order fields:', fields);
    
    // Parse items more safely
    let items = [];
    if (fields.items) {
      try {
        if (typeof fields.items === 'string') {
          items = JSON.parse(fields.items);
        } else if (Array.isArray(fields.items)) {
          items = fields.items;
        } else {
          console.log('Items field is not string or array, defaulting to empty array');
          items = [];
        }
      } catch (parseError) {
        console.error('Error parsing items JSON:', parseError);
        console.log('Raw items value:', fields.items);
        items = []; // Default to empty array if parsing fails
      }
    }

    const parsedOrder = {
      customerEmail: fields.customerEmail,
      amount: Number(fields.amount) || 0,
      date: fields.date ? new Date(fields.date) : new Date(),
      items: items
    };

    console.log('Parsed order:', parsedOrder);
    
    // Validate the date
    if (parsedOrder.date && isNaN(parsedOrder.date.getTime())) {
      console.log('Invalid date provided, using current date:', fields.date);
      parsedOrder.date = new Date();
    }
    
    // Validate required fields
    if (!parsedOrder.customerEmail) {
      throw new Error('customerEmail is required');
    }
    if (!parsedOrder.amount || parsedOrder.amount <= 0) {
      throw new Error('amount must be greater than 0');
    }

    const order = await Order.create(parsedOrder);
    console.log('Created order:', order);
    return { success: true };
  } catch (err) {
    console.error('Error processing order:', err);
    console.error('Order fields that failed:', fields);
    throw err;
  }
}

async function consumeStreams() {
  try {
    console.log('🔌 Connecting to Redis...');
    await connectRedis();
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to Redis and MongoDB');
    
    // Check if streams exist
    try {
      const customerStreamLength = await redisClient.xLen('customer_stream');
      const orderStreamLength = await redisClient.xLen('order_stream');
      console.log(`📊 Initial stream lengths: customer=${customerStreamLength}, order=${orderStreamLength}`);
    } catch (e) {
      console.log('⚠️ Could not check initial stream lengths:', e.message);
    }
    
    console.log('🔄 Starting unified consumer for customer and order streams...');

    let loopCount = 0;
    let lastHeartbeat = Date.now();
    
    while (true) {
      try {
        loopCount++;
        
        // Heartbeat every 10 loops
        if (loopCount % 10 === 0) {
          console.log(`💓 Consumer heartbeat - Loop ${loopCount}, Last: ${new Date(lastHeartbeat).toISOString()}`);
          lastHeartbeat = Date.now();
        }
        
        const streams = [
          { key: 'customer_stream', id: lastIds.customer },
          { key: 'order_stream', id: lastIds.order }
        ];

        console.log(`👂 [Loop ${loopCount}] Waiting for messages on streams:`, streams.map(s => `${s.key}(${s.id})`).join(', '));
        
        const response = await redisClient.xRead(
          streams,
          { BLOCK: 5000, COUNT: 10 }
        );

        if (!response) {
          console.log(`⏳ [Loop ${loopCount}] No new messages. Waiting...`);
          continue;
        }

        console.log(`📨 [Loop ${loopCount}] Received response from Redis streams:`, response.length, 'streams with data');

        for (const stream of response) {
          const streamName = stream.name;
          console.log(`📥 Processing ${stream.messages.length} messages from ${streamName}`);
          
          for (const message of stream.messages) {
            try {
              console.log(`🔍 Processing message ID: ${message.id} from ${streamName}`);
              console.log('Message data:', message.message);
              
              let result;
              if (streamName === 'customer_stream') {
                console.log('👤 Processing customer message...');
                result = await processCustomer(message.message);
                console.log('👤 Customer processing result:', result);
              } else if (streamName === 'order_stream') {
                console.log('🛒 Processing order message...');
                try {
                  result = await processOrder(message.message);
                  console.log('🛒 Order processing result:', result);
                } catch (orderError) {
                  console.error('🛒 CRITICAL: Order processing failed!', orderError);
                  console.error('🛒 Failed message data:', message.message);
                  throw orderError; // Re-throw to see if this is causing crashes
                }
              }

              if (result?.success) {
                console.log(`✅ Successfully processed ${streamName} message ${message.id}`);
              } else if (result?.skipped) {
                console.log(`⏭️  Skipped ${streamName} message ${message.id} (duplicate)`);
              }
              
              // Update last processed ID for this stream
              lastIds[streamName.split('_')[0]] = message.id;
              console.log(`📍 Updated lastId for ${streamName.split('_')[0]} to ${message.id}`);
            } catch (err) {
              console.error(`❌ Error processing ${streamName} message ${message.id}:`, err.message);
              console.error('Full error:', err);
              console.error('❌ CONSUMER MIGHT CRASH HERE - Error in message processing');
              
              // Don't update lastId if processing failed - we'll retry this message
              console.log(`🔄 Will retry message ${message.id} on next loop`);
            }
          }
        }
      } catch (err) {
        console.error(`❌ [Loop ${loopCount}] Stream error:`, err.message);
        console.error('Full stream error:', err);
        console.log('⏳ Waiting 5 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  } catch (err) {
    console.error('💥 Fatal error in consumeStreams:', err);
    console.error('Error stack:', err.stack);
    
    // Try to reconnect after fatal error
    console.log('🔄 Attempting to restart consumer in 10 seconds...');
    setTimeout(() => {
      console.log('🔄 Restarting consumer...');
      consumeStreams().catch(e => {
        console.error('💥 Consumer restart failed:', e);
        process.exit(1);
      });
    }, 10000);
  }
}

// Start consumer with error handling
console.log('🚀 Initializing unified consumer...');
consumeStreams().catch(err => {
  console.error('💥 Consumer crashed:', err);
  process.exit(1);
});
