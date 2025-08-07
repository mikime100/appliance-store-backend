const express = require("express");
const Comment = require("../models/Comment");
const router = express.Router();

// Get all comments for a product (with replies)
router.get("/:productId", async (req, res) => {
  try {
    const comments = await Comment.find({
      productId: req.params.productId,
      parentCommentId: null, // Only top-level comments
    })
      .populate({
        path: "replies",
        options: { sort: { createdAt: 1 } },
      })
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a comment to a product
router.post("/:productId", async (req, res) => {
  try {
    const { userId, userName, content, parentCommentId, isAdmin } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const comment = new Comment({
      productId: req.params.productId,
      userId,
      userName,
      content: content.trim(),
      isAdmin: isAdmin || false,
      parentCommentId: parentCommentId || null,
    });

    await comment.save();

    // If this is a reply, update the parent comment's replies array
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id },
      });
    }

    // Populate replies for the response
    await comment.populate("replies");
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a comment
router.put("/:commentId", async (req, res) => {
  try {
    const { content, userId, isAdmin } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check permissions: only the author or admin can edit
    if (comment.userId !== userId && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Unauthorized to edit this comment" });
    }

    comment.content = content.trim();
    comment.edited = true;
    await comment.save();

    res.json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a comment
router.delete("/:commentId", async (req, res) => {
  try {
    const { userId, isAdmin } = req.body;

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check permissions: only the author or admin can delete
    if (comment.userId !== userId && !isAdmin) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this comment" });
    }

    // If this is a reply, remove it from parent's replies array
    if (comment.parentCommentId) {
      await Comment.findByIdAndUpdate(comment.parentCommentId, {
        $pull: { replies: comment._id },
      });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentCommentId: comment._id });

    // Delete the comment itself
    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all comments (admin route)
router.get("/admin/all", async (req, res) => {
  try {
    const comments = await Comment.find({})
      .populate("replies")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments by product (admin route)
router.get("/admin/product/:productId", async (req, res) => {
  try {
    const comments = await Comment.find({
      productId: req.params.productId,
    })
      .populate("replies")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
