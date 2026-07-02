const Leader = require("../models/Leader");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Withdrawal = require("../models/Withdrawal");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Injection = require("../models/Injection");
const Support = require("../models/Support");
const Admin = require("../models/Admin");

// login leader
const loginLeader = async (req, res) => {
  try {
    const { username, password } = req.body;
    const leader = await Leader.findOne({ username });
    if (!leader) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isMatch = await bcrypt.compare(password, leader.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    leader.isOnline = true;
    await leader.save();

    const token = jwt.sign(
      { id: leader._id, role: "leader" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      success: true,
      token,
      leader,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get leader profile
const getLeader = async (req, res) => {
  try {
    const [leader, users, admins, recharges, withdrawals, supports] =
      await Promise.all([
        Leader.findById(req.user.id).select("-password"),

        User.find()
          .select("-password -withdrawalPassword")
          .sort({ createdAt: -1 }),

        Admin.find()
          .populate("teamMembers", "username balance commission totalOrders")
          .select("-password")
          .sort({ createdAt: -1 }),

        Payment.find().sort({ createdAt: -1 }),

        Withdrawal.find().sort({ createdAt: -1 }),

        Support.find().sort({ createdAt: -1 }),
      ]);

    if (!leader) {
      return res.status(404).json({
        success: false,
        message: "Leader not found",
      });
    }

    return res.status(200).json({
      success: true,
      leader,
      users,
      admins,
      recharges,
      withdrawals,
      supports,

      // Optional counts
      totalUsers: users.length,
      totalAdmins: admins.length,
      totalRecharges: recharges.length,
      totalWithdrawals: withdrawals.length,
      totalSupports: supports.length,
    });
  } catch (error) {
    console.error("LEADER PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leader profile",
    });
  }
};

// logout leader
const logoutLeader = async (req, res) => {
  try {
    await Leader.findByIdAndUpdate(req.user.id, {
      isOnline: false,
    });

    res.json({
      success: true,
      message: "Leader Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = { loginLeader, getLeader, logoutLeader };
