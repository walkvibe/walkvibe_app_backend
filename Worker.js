// models/Worker.js
const mongoose = require('mongoose');

// Worker Schema
const workerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  assignedMachine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine' }, // Link to the machine
  status: { type: String, default: 'Available' }, // 'Available' or 'On Duty'
  location: {
    latitude: Number,
    longitude: Number
  }
});

// Create model
const Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;
