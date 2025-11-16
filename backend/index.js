const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

async function connectDB() {
  try {
    const res = await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB:', res.connection.host);
  } catch (err) {
    console.log('Error connecting to MongoDB:', err.message);
  }
}

connectDB();

app.use(cors({
    origin: "https://devlybytechbuilders.netlify.app",
    methods: "GET, POST, PUT, DELETE"
}));

app.use(express.json());

app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/post'));
app.use('/api', require('./routes/user'));

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});