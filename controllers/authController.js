const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const axios = require("axios");
const useragent = require("useragent");

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// register user
const register = async (req, res) => {
  try {
    const { username, phoneNumber, password, withdrawalPassword, referredBy } =
      req.body;

    // 1. Validation
    if (
      !username ||
      !phoneNumber ||
      !password ||
      !withdrawalPassword ||
      !referredBy
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Duplicate check
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered!",
      });
    }

    let parentUser = null;
    let adminId = null;

    const refUser = await User.findOne({ myInvitationCode: referredBy });

    if (refUser) {
      parentUser = refUser._id;

      adminId = await getRootAdmin(refUser);
    } else {
      const refAdmin = await Admin.findOne({ referralCode: referredBy });

      if (!refAdmin) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code",
        });
      }

      adminId = refAdmin._id;
    }
    const getRootAdmin = async (user) => {
      if (!user.parentUser) {
        return user.adminId;
      }

      const parent = await User.findById(user.parentUser);

      if (!parent) {
        return user.adminId;
      }

      return getRootAdmin(parent);
    };

    // 6. Create user
    const newUser = await User.create({
      username,
      phoneNumber,
      password,
      withdrawalPassword,
      myInvitationCode: generateCode(),
      parentUser,
      adminId,
      referredBy,
      balance: 0,
      commission: 0,
      vipLevel: "VIP0",
      isOnline: true,
    });

    // 7. ADD TO ADMIN TEAM (IMPORTANT FIX)
    await Admin.findByIdAndUpdate(adminId, {
      $addToSet: {
        teamMembers: newUser._id,
      },
    });

    // 8. ADD TO PARENT USER TREE (optional referral chain)
    if (parentUser) {
      await User.findByIdAndUpdate(parentUser, {
        $addToSet: {
          teamMembers: newUser._id,
        },
      });

      await User.findByIdAndUpdate(parentUser, {
        $inc: { commission: 1.5 },
      });
    }

    // IP FIX
    let ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      null;

    if (ip === "::1") ip = "127.0.0.1";

    // GEO
    let country = null;
    let city = null;

    try {
      if (ip && ip !== "127.0.0.1") {
        const geo = await axios.get(`http://ip-api.com/json/${ip}`);

        country = geo.data?.country || null;
        city = geo.data?.city || null;
      }
    } catch (err) {
      console.log("Geo lookup failed:", err.message);
    }

    // USER AGENT
    const agent = useragent.parse(req.headers["user-agent"]);

    newUser.ip = ip;
    newUser.country = country;
    newUser.city = city;
    newUser.userAgent = agent.toString();
    newUser.lastLogin = new Date();

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      newUser,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone number and password are required",
      });
    }

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const match = (await password) === user.password;

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // IP FIX
    let ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      null;

    if (ip === "::1") ip = "127.0.0.1";

    // GEO
    let country = null;
    let city = null;

    try {
      if (ip && ip !== "127.0.0.1") {
        const geo = await axios.get(`http://ip-api.com/json/${ip}`);

        country = geo.data?.country || null;
        city = geo.data?.city || null;
      }
    } catch (err) {
      console.log("Geo lookup failed:", err.message);
    }

    // USER AGENT
    const agent = useragent.parse(req.headers["user-agent"]);

    user.ip = ip;
    user.country = country;
    user.city = city;
    user.userAgent = agent.toString();
    user.lastLogin = new Date();
    user.isOnline = true;

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -withdrawalPassword",
    );

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
