const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rules: { type: Array, required: true }, // Array of rule objects
  createdAt: { type: Date, default: Date.now },
  // Optionally, add createdBy, description, etc.
});

module.exports = mongoose.model('Segment', segmentSchema);
