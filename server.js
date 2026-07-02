const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const createLeader = require("./seed/createLeader");

connectDB().then(() => {
  createLeader("admin", "mypassword123");
});
const app = express();

app.use(cors());
app.use(express.json());

// ✅ IMPORT ROUTES
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const leaderRoutes = require("./routes/leaderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const withdrawalRoutes = require("./routes/withdrawalRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const injectionRoutes = require("./routes/injectionRoutes");
const supportRoutes = require("./routes/supportRoutes");
// ✅ USER ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// PAYMENT ROUTES
app.use("/api/payments", paymentRoutes);
app.use("/uploads", express.static("uploads"));

// LEADER ROUTES
app.use("/api/leader", leaderRoutes);

// ADMIN ROUTES
app.use("/api/admins", adminRoutes);

// ADMIN AUTH ROUTES
app.use("/api/admin-auth", adminAuthRoutes);

// WITHDRAWAL ROUTES
app.use("/api/withdrawals", withdrawalRoutes);

// INJECTION ROUTES
app.use("/api/injections", injectionRoutes);

// SUPPORT ROUTES
app.use("/api/support", supportRoutes);

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
