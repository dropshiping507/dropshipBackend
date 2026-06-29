const express = require("express");
const router = express.Router();

const {
  requestWithdrawal,
  getWithdrawals,
  getAllWithdrawals,
  updateWithdrawalStatus,
  getAdminWithdrawals,
} = require("../controllers/withdrawalController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/request", authMiddleware, requestWithdrawal);
router.get("/my", authMiddleware, getWithdrawals);
router.get("/all-withdrawals", getAllWithdrawals);
router.patch("/update-status/:id", updateWithdrawalStatus);
router.get(
  "/admin-withdrawals",
  authMiddleware,
  adminMiddleware,
  getAdminWithdrawals,
);
module.exports = router;
