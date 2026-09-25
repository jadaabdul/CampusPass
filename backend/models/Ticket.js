const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: String,

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    remainingQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    saleStartDate: Date,

    saleEndDate: Date,

    status: {
      type: String,
      enum: ["active", "inactive", "sold_out"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Ticket", ticketSchema);
