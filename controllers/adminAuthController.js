const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const UAParser = require("ua-parser-js");

// admin login
const adminLogin = async (req, res) => {
  try {
    const { phoneNumber, referralCode, profileCode, password } = req.body;

    if (!phoneNumber || !referralCode || !profileCode || !password) {
      return res.json({
        success: false,
        message: "All fields are required!",
      });
    }

    const admin = await Admin.findOne({
      phoneNumber,
      referralCode,
      profileCode,
    });

    if (!admin) {
      return res.json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const isMatch = (await password) === admin.password;

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid password",
      });
    }
    const parser = new UAParser(req.headers["user-agent"]);
    const browser = parser.getBrowser();

    admin.browser = `${browser.name || "Unknown"} ${browser.version || ""}`;
    admin.isLogin = true;
    admin.lastLogin = new Date();

    await admin.save();

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getLoginAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;
    const admin = await Admin.findById(adminId)
      .select("-password")
      .populate("teamMembers");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { adminLogin, getLoginAdmin };
