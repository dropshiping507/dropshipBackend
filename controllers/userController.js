const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Withdrawal = require("../models/Withdrawal");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Injection = require("../models/Injection");
const Support = require("../models/Support");

// BIND BANK CARD
const bindBankCard = async (req, res) => {
  try {
    const { userId, bankCard, withdrawalPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 1. check withdrawal password
    const isMatch = (await withdrawalPassword) === user.withdrawalPassword;

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect withdrawal password",
      });
    }

    // 2. update bank card AFTER successful match
    user.bankCard = bankCard;

    await user.save();

    res.json({
      success: true,
      message: "Bank card updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [
      user,
      injections,
      withdrawals,
      recharges,
      orders,
      pendingInjection,
      supports,
    ] = await Promise.all([
      User.findById(userId).select("-password -withdrawalPassword"),

      Injection.find({ user: userId }).sort({
        createdAt: -1,
      }),

      Withdrawal.find({ userId }).sort({
        createdAt: -1,
      }),

      Payment.find({ user: userId }).sort({
        createdAt: -1,
      }),

      Order.find({ userId }).sort({
        createdAt: -1,
      }),

      Injection.findOne({
        user: userId,
        status: "pending",
      }),
      Support.find({ user: userId }).sort({
        createdAt: -1,
      }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
      withdrawals,
      recharges,
      orders,
      supports,
      injections,
      hasPendingInjection: !!pendingInjection,
    });
  } catch (error) {
    console.error("PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// GET ALL USERS for leader
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("adminId") // 👈 admin data
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      totalUsers,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update user detail by leader
const updateUserDetailsByLeader = async (req, res) => {
  try {
    const userId = req.params.id;

    const {
      username,
      phoneNumber,
      balance,
      bankCard,
      commission,
      completedOrders,
      joined,
      difference,
      frozenAmount,
      invitationCode,
      role,
      vipLevel,
      isActive,
      note,
      password,
      withdrawalPassword,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // UPDATE ONLY PROVIDED FIELDS (safe update)
    if (username !== undefined) user.username = username;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (balance !== undefined) user.balance = balance;
    if (bankCard !== undefined) user.bankCard = bankCard;
    if (commission !== undefined) user.commission = commission;
    if (completedOrders !== undefined) user.completedOrders = completedOrders;
    if (joined !== undefined) user.joined = joined;
    if (difference !== undefined) user.difference = difference;
    if (frozenAmount !== undefined) user.frozenAmount = frozenAmount;
    if (invitationCode !== undefined) user.invitationCode = invitationCode;
    if (role !== undefined) user.role = role;
    if (note !== undefined) user.note = note;
    if (vipLevel !== undefined) user.vipLevel = vipLevel;
    if (isActive !== undefined) user.isActive = isActive;
    if (password !== undefined) user.password = password;
    if (withdrawalPassword !== undefined)
      user.withdrawalPassword = withdrawalPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating user",
    });
  }
};

// GET SINGLE USER
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -withdrawalPassword",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password -withdrawalPassword");

    res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// edit notes by admin
const editNotesByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.note = note;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      user,
    });
  } catch (error) {
    console.error("EDIT NOTE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// update balance by admin
const updateBalanceByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { balance } = req.body;

    if (balance === undefined || isNaN(balance)) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newBalance = user.balance + Number(balance);

    if (newBalance < 0) {
      return res.status(400).json({
        success: false,
        message: "insufficient balance",
      });
    }

    user.balance = newBalance;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Balance updated successfully",
      balance: user.balance,
      user,
    });
  } catch (error) {
    console.error("UPDATE BALANCE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// handle logout
const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { isOnline: false },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  deleteUser,
  updateUser,
  getUserById,
  getAllUsers,
  getProfile,
  bindBankCard,
  editNotesByAdmin,
  updateUserDetailsByLeader,
  updateBalanceByAdmin,
  logoutUser,
};
