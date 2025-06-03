// services/customerConsumer.js

require('dotenv').config();
// services/customerConsumer.js
//require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { redisClient, connectRedis } = require('../redisClient');
const Customer = require('../models/customer');
const mongoose = require('mongoose');

async function processMessage(fields) {
  try {
    // Convert and validate data
    const parsedData = {
      name: fields.name,
      email: fields.email.toLowerCase().trim(), // Normalize email
      totalSpend: Number(fields.totalSpend) || 0,
      lastActive: fields.lastActive ? new Date(fields.lastActive) : new Date(),
      visits: parseInt(fields.visits) || 0
    };

    // Check for existing customer
    const exists = await Customer.exists({ email: parsedData.email });
    if (exists) {
      console.log(`Skipping duplicate email: ${parsedData.email}`);
      return { skipped: true };
    }

    // Create new customer
    await Customer.create(parsedData);
    return { success: true };
  } catch (err) {
    // Handle duplicate key error (race condition)
    if (err.code === 11000) {
      console.log(`Duplicate detected: ${err.keyValue.email}`);
      return { skipped: true };
    }
    throw err;
  }
}

async function consumeStream() {
  try {
    // Connect to services
    await connectRedis();
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let lastId = '$'; // Process only new messages
    console.log('Customer consumer started. Waiting for messages...');

    // Main consumption loop
    while (true) {
      try {
        const response = await redisClient.xRead(
          [{ key: 'customer_stream', id: lastId }],
          { BLOCK: 5000, COUNT: 10 }
        );

        if (!response) {
          console.log('No new messages. Waiting...');
          continue;
        }

        for (const stream of response) {
          for (const message of stream.messages) {
            try {
              const result = await processMessage(message.message);
              if (result.success) {
                console.log(`Processed message ${message.id}`);
              }
              lastId = message.id; // Update cursor
            } catch (err) {
              console.error(`Error processing ${message.id}:`, err.message);
            }
          }
        }
      } catch (err) {
        console.error('Stream error:', err.message);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

// Start consumer with error handling
consumeStream().catch(err => {
  console.error('Consumer crashed:', err);
  process.exit(1);
});

