require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection with better error handling
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/furny";

mongoose
  .connect(MONGO_URI, {
    retryWrites: true,
    w: "majority",
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
    console.log("Connection ready state:", mongoose.connection.readyState);
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
    process.exit(1);
  });

// Handle connection events
mongoose.connection.on("error", (err) => {
  console.log("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

const productsRouter = require("./routes/products");
app.use("/api/products", productsRouter);

const adminUploadRouter = require("./routes/adminUpload");
app.use("/api/admin", adminUploadRouter);

const commentsRouter = require("./routes/comments");
app.use("/api/comments", commentsRouter);

// Test route
app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
