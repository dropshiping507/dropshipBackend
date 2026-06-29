const express = require("express");
const router = express.Router();

const {
  adminLogin,
  getLoginAdmin,
} = require("../controllers/adminAuthController");
const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/login", adminLogin);
router.get("/my", authMiddleware, adminMiddleware, getLoginAdmin);
module.exports = router;
