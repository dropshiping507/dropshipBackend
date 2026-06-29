const Support = require("../models/Support");

// create message
const createSupport = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    let support = await Support.findOne({ user: userId });

    if (!support) {
      support = await Support.create({
        user: userId,
        messages: [
          {
            sender: "user",
            message,
            createdAt: new Date(),
          },
        ],
      });
    } else {
      support.messages.push({
        sender: "user",
        message,
        createdAt: new Date(),
      });

      await support.save();
    }

    res.json({
      success: true,
      support,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get all support messages
const getAllSupport = async (req, res) => {
  try {
    const supports = await Support.find()
      .populate("user")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      supports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// reply support
const replySupport = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const support = await Support.findById(id);

    if (!support) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    support.messages.push({
      sender: "leader",
      message,
      createdAt: new Date(),
    });

    support.status = "replied";

    await support.save();

    res.json({
      success: true,
      message: "Reply sent successfully",
      support,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get user support
const getUserSupport = async (req, res) => {
  try {
    const messages = await Support.find({
      user: req.user.id,
    }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getUserSupport, replySupport, getAllSupport, createSupport };
