const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },

    referralCode: {
      type: String,
      required: true,
      unique: true,
    },
    profileCode: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
    browser: {
      type: String,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    isLogin: {
      type: Boolean,
      default: false,
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    role: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Admin", adminSchema);
