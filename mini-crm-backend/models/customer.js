// models/customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  totalSpend: Number,
  lastActive: Date,
  visits: Number
  // Add other fields as needed
});

module.exports = mongoose.model('Customer', customerSchema);
