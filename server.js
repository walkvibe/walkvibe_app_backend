require('dotenv').config(); // this must be the first line
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Use body-parser to parse incoming JSON requests
app.use(bodyParser.json());

// Connect to MongoDB using the URI from the .env file
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.log("MongoDB connection error:", err));

// Define a Booking model
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
});

// Basic route to handle GET requests at the root URL
app.get('/', (req, res) => {
  res.send('Welcome to WalkVibe API!');
});

// Endpoint to create a booking
app.post('/api/bookings', async (req, res) => {
  const newBooking = new Booking(req.body);
  try {
    await newBooking.save();
    res.json({ message: 'Booking received successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving booking', error: err });
  }
});

// Endpoint to fetch all bookings (for admin)
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings', error: err });
  }
});

// Start the server
const port = process.env.PORT || 3000; // Use environment variable for the port (for Render or local)
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
