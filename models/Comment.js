const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: String,
      required: true,
    }, // Anonymous user identifier
    userName: {
      type: String,
      required: true,
    }, // Display name for anonymous users
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    }, // For replies
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

// Index for better query performance
commentSchema.index({ productId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1 });

module.exports = mongoose.model("Comment", commentSchema);
