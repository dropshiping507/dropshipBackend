const Leader = require("../models/Leader");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    const leader = await Leader.findById(req.user.id).select("-password");

    if (!leader) {
      return res.status(404).json({
        success: false,
        message: "Leader not found",
      });
    }

    res.json({
      success: true,
      leader,
    });
  } catch (error) {
    console.log("CURRENT LEADER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = { loginLeader, getLeader };
