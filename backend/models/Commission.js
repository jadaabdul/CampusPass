const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    commissionPercentage: {
      type: Number,
      default: 20,
    },

    commissionAmount: {
      type: Number,
      required: true,
    },

    organizerAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups
commissionSchema.index({ organizerId: 1 });
commissionSchema.index({ eventId: 1 });
commissionSchema.index({ status: 1 });
commissionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Commission", commissionSchema);
