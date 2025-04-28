// models/TrackingCode.js
const mongoose = require('mongoose');

// TrackingCode Schema
const trackingCodeSchema = new mongoose.Schema({
  code: String, // Unique tracking code (generated after payment)
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, // Link to the booking
  startDate: Date,
  endDate: Date,
  status: { type: String, default: 'Active' }, // 'Active' or 'Expired'
});

// Create model
const TrackingCode = mongoose.model('TrackingCode', trackingCodeSchema);

module.exports = TrackingCode;
