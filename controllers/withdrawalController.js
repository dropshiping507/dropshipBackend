const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Injection = require("../models/Injection");
const generateTransactionId = () => {
  return "WD-" + Date.now() + Math.floor(Math.random() * 1000);
};

// create user withdrawals
const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, walletAddress, withdrawalPassword } = req.body;
    const amountNum = Number(amount);

    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal amount",
      });
    }

    if (!walletAddress || !withdrawalPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = withdrawalPassword === user.withdrawalPassword;

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal password",
      });
    }

    if (user.balance < amountNum) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }
    const activeInjection = await Injection.findOne({
      user: userId,
      status: "pending",
    }).sort({ createdAt: -1 });

    if (activeInjection) {
      return res.json({
        success: false,
        message: `You have a pending difference amount of ${"$" + activeInjection.injectionCost}`,
      });
    }
    const isRemainingOrders = user.currentCycleOrders > 0;
    if (isRemainingOrders) {
      return res.json({
        success: false,
        message: "You have remaining orders to be completed",
      });
    }


    await user.save();

    const withdrawal = await Withdrawal.create({
      userId: user._id,
      adminId: user.adminId,
      amount: amountNum,
      walletAddress,
      status: "pending",
      transactionId: generateTransactionId(),
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdrawal,
      balance: user.balance,
      frozenAmount: user.frozenAmount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// user withdrawals
const getWithdrawals = async (req, res) => {
  try {
    const userId = req.user.id;
    const withdrawals = await Withdrawal.find({
      userId,
    }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error("GET WITHDRAWALS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get admin withdrawals
const getAdminWithdrawals = async (req, res) => {
  try {
    const adminId = req.user.id;

    const withdrawals = await Withdrawal.find({ adminId })
      .populate("userId", "-password")
      .populate("adminId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// for leader all withdrawals
const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate("userId")
      .populate("adminId")
      .populate("processedBy")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error("GET ALL WITHDRAWALS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// for update leader
const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const withdrawal = await Withdrawal.findById(id);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal not found",
      });
    }

    const user = await User.findById(withdrawal.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    withdrawal.status = status;
    await withdrawal.save();

    // If approved
    if (status === "approved") {
      user.balance -= withdrawal.amount;
      user.commission = 0;

      await user.save();
    }
    return res.json({
      success: true,
      message: "status updated successfully",
      payment: withdrawal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
  requestWithdrawal,
  getWithdrawals,
  getAllWithdrawals,
  updateWithdrawalStatus,
  getAdminWithdrawals,
};
