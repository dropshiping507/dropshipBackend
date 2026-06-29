const Injection = require("../models/Injection");

// create injection
const createInjection = async (req, res) => {
  try {
    const {
      userId,
      injectionCost,
      injectionOrder,
      commissionRate,
      fixedCommission,
    } = req.body;

    const injection = await Injection.create({
      user: userId, // ✅ FIXED HERE
      injectionOrder,
      injectionCost,
      commissionRate,
      fixedCommission,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "injection created successfully",
      injection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get user injection
const getUserInjectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const injections = await Injection.find({
      user: id,
    })
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("createdBy");

    return res.status(200).json({
      success: true,
      injections,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update injection status by admin

const updateInjectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const injection = await Injection.findById(id);

    if (!injection) {
      return res.status(404).json({
        success: false,
        message: "Injection not found",
      });
    }

    injection.status = "completed";
    injection.completedAt = new Date();
    await injection.save();

    return res.json({
      success: true,
      message: "Injection completed",
      injection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// reject injection by admin
const rejectInjectionByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const injection = await Injection.findById(id);

    if (!injection) {
      return res.status(404).json({
        success: false,
        message: "Injection not found",
      });
    }

    injection.status = "rejected";
    injection.rejectedAt = new Date(); // ✅ correct field
    await injection.save();

    return res.json({
      success: true,
      message: "Injection rejected",
      injection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// delete injection by admin
const deleteInjection = async (req, res) => {
  try {
    const { id } = req.params;

    const injection = await Injection.findByIdAndDelete(id);

    if (!injection) {
      return res.status(404).json({
        success: false,
        message: "Injection not found",
      });
    }

    res.json({
      success: true,
      message: "Injection deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createInjection,
  getUserInjectionById,
  updateInjectionStatus,
  deleteInjection,
  rejectInjectionByAdmin,
};
