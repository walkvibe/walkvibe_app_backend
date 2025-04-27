// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Middleware to parse JSON
app.use(bodyParser.json());

// Check if MONGO_URI is loaded
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not set. Please check your .env or environment variables.');
  process.exit(1); // Stop the server
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Stop if cannot connect
  });

// Define the Booking schema
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
}, { timestamps: true }); // Add createdAt, updatedAt automatically

const Booking = mongoose.model('Booking', bookingSchema);

// Root Route
app.get('/', (req, res) => {
  res.send('🚀 Welcome to WalkVibe API!');
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json({ message: 'Booking received successfully!' });
  } catch (err) {
    console.error('❌ Error saving booking:', err.message);
    res.status(500).json({ message: 'Error saving booking', error: err.message });
  }
});

// Fetch all bookings (for admin)
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    console.error('❌ Error fetching bookings:', err.message);
    res.status(500).json({ message: 'Error fetching bookings', error: err.message });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
