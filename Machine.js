// models/Machine.js
const mongoose = require('mongoose');

// Machine Schema
const machineSchema = new mongoose.Schema({
  name: String,  // Example: "Machine 1"
  status: { type: String, default: 'Available' }, // 'Available' or 'In Use'
  location: {
    latitude: Number,
    longitude: Number
  },
  assignedPlan: String, // '1-week', '1-month', etc.
});

// Create model
const Machine = mongoose.model('Machine', machineSchema);

module.exports = Machine;
