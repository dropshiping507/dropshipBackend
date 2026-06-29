const express = require("express");
const router = express.Router();
const {
  createSupport,
  getAllSupport,
  replySupport,
  getUserSupport,
} = require("../controllers/supportController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
// User creates support message
router.post("/create", authMiddleware, createSupport);

// Leader gets all support messages
router.get("/all", getAllSupport);

// Leader replies to a message
router.put("/reply/:id", replySupport);

// User gets their messages
router.get("/my-messages", authMiddleware, getUserSupport);

module.exports = router;
