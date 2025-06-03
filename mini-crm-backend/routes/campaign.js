const express = require('express');
const router = express.Router();
const Campaign = require('../models/campaign');
const Segment = require('../models/segment');
const Customer = require('../models/customer');
const CommunicationLog = require('../models/communicationLog');

// Launch a campaign
router.post('/', async (req, res) => {
  try {
    const { name, segmentId, message } = req.body;
    if (!name || !segmentId || !message) {
      return res.status(400).json({ error: 'Name, segmentId, and message are required.' });
    }

    // Get segment rules
    const segment = await Segment.findById(segmentId);
    if (!segment) return res.status(404).json({ error: 'Segment not found' });

    // Find customers matching segment rules
    // (reuse your buildMongoQueryFromRules function)
    const buildMongoQueryFromRules = rules => {
      const andConditions = [];
      for (const rule of rules) {
        let condition = {};
        switch (rule.operator) {
          case '>': condition[rule.field] = { $gt: rule.value }; break;
          case '<': condition[rule.field] = { $lt: rule.value }; break;
          case '=': condition[rule.field] = rule.value; break;
          case '!=': condition[rule.field] = { $ne: rule.value }; break;
          default: break;
        }
        andConditions.push(condition);
      }
      return andConditions.length > 0 ? { $and: andConditions } : {};
    };

    const customerQuery = buildMongoQueryFromRules(segment.rules);
    const customers = await Customer.find(customerQuery);

    // Create campaign
    const campaign = new Campaign({
      name,
      segmentId,
      message,
      stats: { audienceSize: customers.length }
    });
    await campaign.save();

    // Simulate message delivery
    let sent = 0, failed = 0;
    for (const customer of customers) {
      // Simulate delivery (90% sent, 10% failed)
      const isSent = Math.random() < 0.9;
      await CommunicationLog.create({
        campaignId: campaign._id,
        customerId: customer._id,
        status: isSent ? 'SENT' : 'FAILED',
        message: message.replace('{name}', customer.name)
      });
      if (isSent) sent++;
      else failed++;
    }

    // Update campaign stats
    campaign.stats.sent = sent;
    campaign.stats.failed = failed;
    await campaign.save();

    res.status(201).json({ campaignId: campaign._id, sent, failed, audienceSize: customers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all campaigns (most recent first)
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get total count of campaigns
router.get('/count', async (req, res) => {
  try {
    const count = await Campaign.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get campaign delivery stats/logs
router.get('/:id/logs', async (req, res) => {
  try {
    const logs = await CommunicationLog.find({ campaignId: req.params.id }).populate('customerId', 'name email');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
