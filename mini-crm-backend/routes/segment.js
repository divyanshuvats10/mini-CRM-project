const express = require('express');
const router = express.Router();
const Segment = require('../models/segment');
const Customer = require('../models/customer');

// Create a new segment
router.post('/', async (req, res) => {
  try {
    const { name, rules } = req.body;
    if (!name || !rules) {
      return res.status(400).json({ error: 'Name and rules are required.' });
    }
    const segment = new Segment({ name, rules });
    await segment.save();
    res.status(201).json(segment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all segments
router.get('/', async (req, res) => {
  try {
    const segments = await Segment.find();
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get total count of segments
router.get('/count', async (req, res) => {
  try {
    const count = await Segment.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Preview audience size for rules
router.post('/preview', async (req, res) => {
  try {
    const { rules } = req.body;
    if (!rules) {
      return res.status(400).json({ error: 'Rules are required.' });
    }
    // Convert rules to MongoDB query
    const mongoQuery = buildMongoQueryFromRules(rules);
    const count = await Customer.countDocuments(mongoQuery);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: Convert rules to MongoDB query
function buildMongoQueryFromRules(rules) {
  const andConditions = [];
  for (const rule of rules) {
    let condition = {};
    const value = rule.field === 'lastActive' ? 
      new Date(Date.now() - (parseInt(rule.value) * 24 * 60 * 60 * 1000)) : 
      rule.value;

    switch (rule.operator) {
      case '>':
        condition[rule.field] = { $gt: value };
        break;
      case '<':
        condition[rule.field] = { $lt: value };
        break;
      case '=':
        condition[rule.field] = value;
        break;
      case '!=':
        condition[rule.field] = { $ne: value };
        break;
      default:
        break;
    }
    andConditions.push(condition);
  }
  return andConditions.length > 0 ? { $and: andConditions } : {};
}

// GET /api/segments/:id/preview
router.get('/:id/preview', async (req, res) => {
  try {
    const segmentId = req.params.id;
    const segment = await Segment.findById(segmentId);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }
    // Use your existing helper to build the query
    const mongoQuery = buildMongoQueryFromRules(segment.rules);
    const count = await Customer.countDocuments(mongoQuery);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
