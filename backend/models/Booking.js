const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    bookingCode: {
      type: String,
      unique: true,
      required: true,
    },

    qrCode: String,

    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "unpaid", "paid", "failed", "expired"],
      default: "pending",
    },

    checkedIn: {
      type: Boolean,
      default: false,
    },

    scannedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Booking", bookingSchema);
