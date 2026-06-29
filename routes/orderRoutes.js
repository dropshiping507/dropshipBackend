const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  updateOrderStatus,
  deleteOrder,
  addOrderByAdmin,
  clearOrders,
  getLastOrderByUser,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

// get last order for injection admin
router.get("/last", authMiddleware, getLastOrderByUser);
// create orders post by user
router.post("/", createOrder);

// add orders by admin
router.put("/add-orders/:id", addOrderByAdmin);
// clear orders by admin
router.put("/clear-orders/:id", clearOrders);

// get all orders for a user
router.get("/my-orders", authMiddleware, getMyOrders);

// update order status (pending → completed/undone) for user
router.patch("/:orderId", updateOrderStatus);

// delete order for a user
router.delete("/:orderId", deleteOrder);
module.exports = router;
