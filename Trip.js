// models/Trip.js
const mongoose = require('mongoose');

// Trip Schema
const tripSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }, // Link to the worker
  machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine' }, // Link to the machine
  startTime: Date,
  endTime: Date,
  location: {
    latitude: Number,
    longitude: Number,
  },
  duration: Number,  // Trip duration in minutes
  status: { type: String, default: 'In Progress' }, // 'In Progress' or 'Completed'
});

// Create model
const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
