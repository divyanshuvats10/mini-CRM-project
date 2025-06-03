const express = require('express');
const router = express.Router();
const { redisClient } = require('../redisClient');
const Order = require('../models/order');


// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { customerEmail, amount, date, items } = req.body;
    if (!customerEmail || !amount) {
      return res.status(400).json({ error: 'customerEmail and amount are required.' });
    }

    // Ensure items is an array
    const itemsArray = Array.isArray(items) ? items : [];

    const orderData = {
      customerEmail: String(customerEmail),
      amount: String(amount),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      items: JSON.stringify(itemsArray)
    };

    await redisClient.xAdd('order_stream', '*', orderData);
    res.status(202).json({ message: 'Order data queued for processing' });
  } catch (err) {
    console.error('Error adding order:', err);
    res.status(500).json({ error: err.message });
  }
});

// List all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get total count of orders
router.get('/count', async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders for a specific customer email
router.get('/by-email/:email', async (req, res) => {
  try {
    const orders = await Order.find({ customerEmail: req.params.email });
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'No orders found for this email' });
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
