const Payment = require("../models/Payment");
const User = require("../models/User");
const Injection = require("../models/Injection");
const mongoose = require("mongoose");
const Order = require("../models/Order");
// for user recharge
const createPayment = async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;

    if (!amount || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Amount and wallet address are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Screenshot is required",
      });
    }
    const user = await User.findById(req.user.id);

    const adminId = user.adminId;
    const payment = await Payment.create({
      user: req.user.id,
      transactionId: `TXN-${Date.now()}`,
      amount,
      adminId: adminId,
      walletAddress,
      screenshot: req.file.path.replace(/\\/g, "/"),
      status: "pending",
    });

    res.status(201).json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//  for user history
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get all admin payments
const getAllAdminPayments = async (req, res) => {
  try {
    const adminId = req.user.id;

    const users = await User.find({ adminId }).select("_id");

    const userIds = users.map((u) => u._id);

    const payments = await Payment.find({
      user: { $in: userIds },
    })
      .populate("user", "-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// for  leader dashboard
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "-password")
      .populate("adminId", "-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update payment status by leader
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Prevent double approval
    if (payment.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Payment already approved",
      });
    }

    // Update payment status first
    payment.status = status;
    await payment.save();

    let updatedUser = null;
    let injection = null;

    if (status === "approved") {
      const amount = Number(payment.amount);

      // 1. Add full payment to user balance
      updatedUser = await User.findByIdAndUpdate(
        payment.user,
        {
          $inc: { balance: amount },
        },
        { new: true },
      );

      // 2. Find latest pending injection
      injection = await Injection.findOne({
        user: payment.user,
        status: "pending",
      }).sort({ createdAt: -1 });

      console.log("🧾 Injection found:", injection);

      // 3. Apply injection logic
      if (injection) {
        const paymentAmount = Number(amount);

        // 1. Get last order
        const lastOrder = await Order.findOne({
          userId: payment.user,
        }).sort({ createdAt: -1 });

        console.log("📦 Last Order:", lastOrder);

        if (lastOrder) {
          const payment = Number(paymentAmount || 0);
          let remainingDifference =
            Number(lastOrder.differenceAmount || 0) - payment;

          console.log("💰 Payment:", payment);
          console.log("📉 Remaining order difference:", remainingDifference);

          if (remainingDifference <= 0) {
            const excess = Math.abs(remainingDifference);

            // fully cleared order
            lastOrder.differenceAmount = 0;
            lastOrder.requiresInjection = false;
            lastOrder.status = "completed";

            const updated = await Injection.findByIdAndUpdate(
              injection._id,
              {
                status: "completed",
                completedAt: new Date(),
              },
              { new: true },
            );
            const user = await User.findById(payment.user);
            user.undone -= 1;
            await user.save();
            console.log("✅ Updated Injection:", updated.status);
            // OPTIONAL: handle overpayment (VERY IMPORTANT)
            if (excess > 0) {
              // example: refund or add to wallet
              user.balance += excess;
              await user.save();

              console.log("💰 Excess refunded:", excess);
            }

            console.log("✅ Order fully cleared");
          } else {
            // partial payment
            lastOrder.differenceAmount = remainingDifference;
            console.log("⚠️ Order partially updated");
          }

          await lastOrder.save();
        }
      }
    }

    return res.json({
      success: true,
      message: "Status updated successfully",
      payment,
      user: updatedUser,
      injection,
    });
  } catch (error) {
    console.log("🔥 ERROR CAUGHT:");
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getMyPayments,
  getAllAdminPayments,
  getAllPayments,
  updatePaymentStatus,
};
