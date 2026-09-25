const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    poster: {
      type: String,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      default: "",
    },

    endTime: {
      type: String,
      default: "",
    },

    registrationDeadline: Date,

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    bookedSeats: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    tags: [
      {
        type: String,
      },
    ],

    contactEmail: String,

    contactPhone: String,
  },
  {
    timestamps: true,
  }
);

// Performance indexes
eventSchema.index({ venue: 1, startDate: 1, endDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ startDate: -1 });

module.exports = mongoose.model("Event", eventSchema);