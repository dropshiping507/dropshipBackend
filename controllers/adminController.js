const Admin = require("../models/Admin");
const Withdrawal = require("../models/Withdrawal");
const Payment = require("../models/Payment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// add admin
const addAdmins = async (req, res) => {
  try {
    const { username, phoneNumber, profileCode, referralCode, password } =
      req.body;

    if (
      !username ||
      !phoneNumber ||
      !password ||
      !profileCode ||
      !referralCode
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // check if admin already exists
    const existingAdmin = await Admin.findOne({ phoneNumber });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }
    // create admin
    const newAdmin = await Admin.create({
      username,
      phoneNumber,
      referralCode,
      profileCode,
      password,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: newAdmin,
    });
  } catch (error) {
    console.log("FULL ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().lean();

    const result = await Promise.all(
      admins.map(async (admin) => {
        const users = await User.find({ adminId: admin._id });

        return {
          ...admin,
          teamMembers: users,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      admins: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// delete an admin
const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.body;

    const deletedAdmin = await Admin.findByIdAndDelete(adminId);

    if (!deletedAdmin) {
      return res.json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      message: "Admin deleted successfully!",
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// get all users for an admin
const getAllUsersAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;
    const users = await User.find({ adminId }).sort({ createdAt: -1 });

    // attach withdrawals + recharges manually
    const usersWithData = await Promise.all(
      users.map(async (user) => {
        const withdrawals = await Withdrawal.find({ user: user._id });
        const recharges = await Payment.find({ user: user._id });

        return {
          ...user.toObject(),
          withdrawals,
          recharges,
        };
      }),
    );

    res.status(200).json({
      success: true,
      users: usersWithData,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// const admin logout
const adminLogout = async (req, res) => {
  try {
    await Admin.findByIdAndUpdate(req.user.id, {
      isLogin: false,
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addAdmins,
  getAllAdmins,
  deleteAdmin,
  getAllUsersAdmin,
  adminLogout,
};
