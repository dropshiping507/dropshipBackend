const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  createPayment,
  getMyPayments,
  getAllAdminPayments,
  getAllPayments,
  updatePaymentStatus,
} = require("../controllers/paymentController");

// User creates payment
router.post("/", authMiddleware, upload.single("screenshot"), createPayment);

// User payment history
router.get("/my", authMiddleware, getMyPayments);

// Admin gets all payments
router.get("/", authMiddleware, getAllAdminPayments);

// for leader
router.get("/all-payments", getAllPayments);
router.patch("/update-status/:id", updatePaymentStatus);

module.exports = router;
