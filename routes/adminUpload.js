const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Product = require("../models/Product");

require("dotenv").config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/admin-upload", upload.single("image"), async (req, res) => {
  try {
    const { adminSecret, modelName, description, price, condition } = req.body;
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid admin secret" });
    }
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
});

// Upload image only endpoint
router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    const { adminSecret } = req.body;
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid admin secret" });
    }
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
