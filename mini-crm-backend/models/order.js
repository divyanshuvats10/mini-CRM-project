const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerEmail: { type: String, required: true }, // Foreign key by email for simplicity
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  items: [String]
});

module.exports = mongoose.model('Order', orderSchema);
