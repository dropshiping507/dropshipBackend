const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    commission: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["completed", "undone"],
      default: "undone",
    },
    productId: {
      type: Number,
    },
    requiresInjection: {
      type: Boolean,
      default: false,
    },
    differenceAmount: {
      type: Number,
      default: 0,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
