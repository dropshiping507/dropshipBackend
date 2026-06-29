const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    withdrawalPassword: {
      type: String,
      required: true,
    },
    frozenAmount: {
      type: Number,
      default: 0,
    },

    balance: {
      type: Number,
      default: 0,
    },

    commission: {
      type: Number,
      default: 0,
    },

    difference: {
      type: Number,
      default: 0,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    completedOrders: {
      type: Number,
      default: 0,
    },
    currentCycleOrders: {
      type: Number,
      default: 0,
    },
    undone: {
      type: Number,
      default: 0,
    },

    vipLevel: {
      type: String,
      default: "VIP0",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    parentUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    referredBy: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      default: null,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    myInvitationCode: {
      type: String,
      unique: true,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "leader"],
      default: "user",
    },
    bankCard: {
      type: String,
      default: "none",
    },
    ip: {
      type: String,
      default: null,
    },

    country: {
      type: String,
      default: null,
    },

    city: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
