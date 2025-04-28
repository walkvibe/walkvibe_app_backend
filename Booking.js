// models/Booking.js
const mongoose = require('mongoose');

// Booking Schema
const bookingSchema = new mongoose.Schema({
  company: String,
  email: String,
  phone: String,
  address: String,
  businessType: String,
  adRequired: String,
  duration: Number,
  durationType: String,
  plan: String,
  price: Number,
  status: { type: String, default: 'Pending' }, // 'Pending' or 'Confirmed'
});

// Create model
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
