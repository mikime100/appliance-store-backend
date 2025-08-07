const express = require("express");
const Product = require("../models/Product");
const Comment = require("../models/Comment");
const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all comments (for admin)
router.get("/comments", async (req, res) => {
  try {
    const comments = await Comment.find().populate("product", "modelName");
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new product
router.post("/", async (req, res) => {
  try {
    const { modelName, description, imageUrl, price, condition } = req.body;
    const product = new Product({
      modelName,
      description,
      imageUrl,
      price,
      condition,
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a product
router.put("/:id", async (req, res) => {
  try {
    console.log("Received update request body:", req.body); // Debug log
    const { modelName, description, imageUrl, price, condition } = req.body;
    console.log("Extracted condition:", condition); // Debug log
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { modelName, description, imageUrl, price, condition },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    console.log("Updated product:", product); // Debug log
    res.json(product);
  } catch (err) {
    console.error("Update error:", err); // Debug log
    res.status(400).json({ error: err.message });
  }
});

// Delete a product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
