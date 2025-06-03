const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');
const { redisClient } = require('../redisClient'); // Make sure this exports a connected client

// Create customer (push to Redis Stream)
router.post('/', async (req, res) => {
  try {
    // Basic validation (customize as needed)
    const { name, email, totalSpend, lastActive, visits } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    // Flatten data for Redis Stream (all values must be strings)
    const customerData = {
      name: String(name),
      email: String(email),
      totalSpend: String(totalSpend || ''),
      lastActive: String(lastActive || ''),
      visits: String(visits || '')
    };

    // Add to Redis Stream
    await redisClient.xAdd('customer_stream', '*', customerData);

    res.status(202).json({ message: 'Customer data queued for processing' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List customers (read from MongoDB)
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get total count of customers
router.get('/count', async (req, res) => {
  try {
    const count = await Customer.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer by email
router.get('/by-email/:email', async (req, res) => {
  try {
    const customer = await Customer.findOne({ email: req.params.email });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
