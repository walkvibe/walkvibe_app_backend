const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config(); // Import dotenv to use the .env file

const app = express();

// Use body-parser to parse incoming JSON requests
app.use(bodyParser.json());

// Connect to MongoDB using the URI from the .env file
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.log("MongoDB connection error:", err));

// Define the models
// Booking Model
const Booking = mongoose.model('Booking', {
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

// Machine Model
const Machine = mongoose.model('Machine', {
  name: String,
  status: { type: String, default: 'Available' }, // 'Available' or 'In Use'
  location: {
    latitude: Number,
    longitude: Number
  },
  assignedPlan: String,
});

// Worker Model
const Worker = mongoose.model('Worker', {
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

// Trip Model
const Trip = mongoose.model('Trip', {
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
  machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine' },
  startTime: Date,
  endTime: Date,
  location: {
    latitude: Number,
    longitude: Number,
  },
  duration: Number, // Duration in minutes
  status: { type: String, default: 'In Progress' }, // 'In Progress' or 'Completed'
});

// Tracking Code Model
const TrackingCode = mongoose.model('TrackingCode', {
  code: String, // Unique tracking code (generated after payment)
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  startDate: Date,
  endDate: Date,
  status: { type: String, default: 'Active' }, // 'Active' or 'Expired'
});

// Basic route to handle GET requests at the root URL
app.get('/', (req, res) => {
  res.send('Welcome to WalkVibe API!');
});

// ----------------------------------------------
// Booking API: Create a new booking
app.post('/api/bookings', async (req, res) => {
  const newBooking = new Booking(req.body); // Create a new booking with the body data
  try {
    await newBooking.save();  // Save the booking to the database
    res.json({ message: 'Booking received successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving booking', error: err });
  }
});

// Fetch all bookings (for admin)
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find(); // Get all bookings
    res.json(bookings);  // Return bookings to the admin
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings', error: err });
  }
});

// ----------------------------------------------
// Machine API: Admin can create a machine
app.post('/api/admin/machines', async (req, res) => {
  const newMachine = new Machine(req.body); // Create a new machine from body data
  try {
    await newMachine.save(); // Save the machine to the database
    res.json({ message: 'Machine created successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating machine', error: err });
  }
});

// Fetch all machines (for admin)
app.get('/api/admin/machines', async (req, res) => {
  try {
    const machines = await Machine.find(); // Get all machines
    res.json(machines);  // Return machines to the admin
  } catch (err) {
    res.status(500).json({ message: 'Error fetching machines', error: err });
  }
});

// ----------------------------------------------
// Worker API: Worker scans QR and gets assigned to machine
app.post('/api/worker/scan-machine', async (req, res) => {
  const { workerId, machineId } = req.body; // Get worker and machine IDs from the request
  try {
    const worker = await Worker.findById(workerId); // Find the worker by ID
    const machine = await Machine.findById(machineId); // Find the machine by ID
    worker.assignedMachine = machineId;  // Assign the machine to the worker
    await worker.save();  // Save the worker with the new assignment
    res.json({ message: 'Worker assigned to machine successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning worker', error: err });
  }
});

// ----------------------------------------------
// Trip API: Start a trip for a worker
app.post('/api/trip/start', async (req, res) => {
  const { workerId, machineId, location } = req.body;  // Get worker, machine, and location data
  const newTrip = new Trip({
    worker: workerId,
    machine: machineId,
    startTime: new Date(),
    location: location,
    status: 'In Progress',
    duration: 0, // duration will be calculated based on end time
  });
  try {
    await newTrip.save();  // Save the trip to the database
    res.json({ message: 'Trip started successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error starting trip', error: err });
  }
});

// ----------------------------------------------
// Tracking Code API: Generate and use tracking codes
app.post('/api/tracking/generate', async (req, res) => {
  const { bookingId, startDate, endDate } = req.body; // Get booking details from the request
  const trackingCode = Math.random().toString(36).substring(2, 10);  // Generate a random code
  const newTrackingCode = new TrackingCode({
    code: trackingCode,
    bookingId: bookingId,
    startDate: startDate,
    endDate: endDate,
    status: 'Active',
  });
  try {
    await newTrackingCode.save();  // Save the tracking code to the database
    res.json({ trackingCode: trackingCode });
  } catch (err) {
    res.status(500).json({ message: 'Error generating tracking code', error: err });
  }
});

// Get tracking code status (for customer to track their ad)
app.get('/api/tracking/:trackingCode', async (req, res) => {
  const { trackingCode } = req.params; // Get tracking code from URL parameter
  try {
    const tracking = await TrackingCode.findOne({ code: trackingCode }); // Find tracking by code
    if (!tracking || tracking.status === 'Expired') {
      return res.status(404).json({ message: 'Tracking code not valid or expired' });
    }
    res.json(tracking); // Return tracking details to customer
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tracking info', error: err });
  }
});

// Start the server
const port = process.env.PORT || 3000; // Use environment variable for the port (for Render or local)
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
