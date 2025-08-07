const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    modelName: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true },
    condition: { type: String, enum: ["A", "B", "C"], default: "A" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
