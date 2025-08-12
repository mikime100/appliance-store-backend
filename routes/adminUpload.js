const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");

require("dotenv").config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// JWT auth middleware (replaces adminSecret form check)
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "change_this_secret";
function requireAdminAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const parts = auth.split(" ");
    const token = parts.length === 2 ? parts[1] : null;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }
    jwt.verify(token, ADMIN_JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post(
  "/admin-upload",
  requireAdminAuth,
  upload.single("image"),
  async (req, res) => {
  try {
    const { modelName, description, price, condition } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }
    // Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      async (error, result) => {
        if (error)
          return res.status(500).json({ error: "Cloudinary upload failed" });
        // Save product to MongoDB
        const product = new Product({
          modelName,
          description,
          imageUrl: result.secure_url,
          price,
          condition: condition || "A",
        });
        await product.save();
        res.status(201).json(product);
      }
    );
    uploadResult.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
);

// Upload image only endpoint
router.post("/upload-image", requireAdminAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      async (error, result) => {
        if (error)
          return res.status(500).json({ error: "Cloudinary upload failed" });

        res.status(200).json({ imageUrl: result.secure_url });
      }
    );
    uploadResult.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
