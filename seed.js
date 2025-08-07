require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const MONGO_URI = process.env.MONGO_URI;

const sampleProducts = [
  {
    modelName: "Kruzo Aero Chair",
    description: "Comfortable and stylish chair for your living room.",
    imageUrl: "https://via.placeholder.com/300x200?text=Kruzo+Aero+Chair",
    price: 120.0,
  },
  {
    modelName: "Nordic Chair",
    description: "Minimalist design with maximum comfort.",
    imageUrl: "https://via.placeholder.com/300x200?text=Nordic+Chair",
    price: 75.0,
  },
  {
    modelName: "Ergonomic Chair",
    description: "Perfect for your home office setup.",
    imageUrl: "https://via.placeholder.com/300x200?text=Ergonomic+Chair",
    price: 150.0,
  },
  {
    modelName: "Modern Couch",
    description: "Spacious and modern couch for family gatherings.",
    imageUrl: "https://via.placeholder.com/300x200?text=Modern+Couch",
    price: 500.0,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, {
      retryWrites: true,
      w: "majority",
    });
    await Product.deleteMany();
    await Product.insertMany(sampleProducts);
    console.log("Database seeded with sample products!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
 