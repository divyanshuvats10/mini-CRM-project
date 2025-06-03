const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  segmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Segment', required: true },
  message: { type: String, required: true },
  stats: {
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    audienceSize: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);
