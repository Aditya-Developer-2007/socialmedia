const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
async function connectDB() {
    try {
        const res = await mongoose.connect(
            'mongodb+srv://pritam:pritam@cluster0.wg3g3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
            // 'mongodb+srv://preetam:preetam@cluster0.wg3g3.mongodb.net/socialmedia?retryWrites=true&w=majority&appName=Cluster0'
        );
        console.log('Connected to MongoDB:', res.connection.host);
    } catch (err) {
        console.log('Error connecting to MongoDB:', err.message);
    }
}
connectDB()

// Middleware
app.use(cors({
  origin: "*",  // Allow frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// API routes (make sure routes use `router = express.Router()` and proper paths!)
app.use("/api", require('./routes/auth')); //localhost:3000/api/v1/signup //localhost:3000/api/v2/signup 
app.use("/api", require('./routes/post'));
app.use("/api", require('./routes/user'));

// Serve frontend build
const frontendPath = path.resolve(__dirname, "../frontend/build");
app.use(express.static(frontendPath));

// Catch-all (for React Router)
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
