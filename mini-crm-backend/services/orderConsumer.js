require('dotenv').config();
//require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { redisClient, connectRedis } = require('../redisClient');
const Order = require('../models/order');
const mongoose = require('mongoose');

async function processOrder(fields) {
  try {
    console.log('Processing order fields:', fields);
    
    const parsedOrder = {
      customerEmail: fields.customerEmail,
      amount: Number(fields.amount) || 0,
      date: new Date(fields.date),
      items: Array.isArray(fields.items) ? fields.items : JSON.parse(fields.items || '[]')
    };

    console.log('Parsed order:', parsedOrder);
    const order = await Order.create(parsedOrder);
    console.log('Created order:', order);
    return { success: true };
  } catch (err) {
    console.error('Error processing order:', err);
    throw err;
  }
}

async function consumeOrderStream() {
  try {
    await connectRedis();
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Order consumer started. Waiting for messages...');

    let lastId = '$';

    while (true) {
      try {
        const response = await redisClient.xRead(
          [{ key: 'order_stream', id: lastId }],
          { BLOCK: 5000, COUNT: 10 }
        );

        if (!response) {
          console.log('No new order messages. Waiting...');
          continue;
        }

        for (const stream of response) {
          for (const message of stream.messages) {
            try {
              await processOrder(message.message);
              console.log(`Processed order message ${message.id}`);
              lastId = message.id;
            } catch (err) {
              console.error(`Error processing order ${message.id}:`, err.message);
            }
          }
        }
      } catch (err) {
        console.error('Order stream read error:', err.message);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  } catch (err) {
    console.error('Fatal error in order consumer:', err);
    process.exit(1);
  }
}

consumeOrderStream();
