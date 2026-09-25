const crypto = require("crypto");

const mongoose = require("mongoose");
const razorpay = require("../configs/razorpay");

const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const Commission = require("../models/Commission");

const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");

const createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.userId.toString() !== req.user.id) {
      throw new ApiError(403, "You are not allowed to pay for this booking");
    }

    if (booking.paymentStatus === "paid") {
      throw new ApiError(400, "This booking has already been paid");
    }

    if (booking.totalAmount === 0) {
      throw new ApiError(400, "This is a free booking and does not need payment");
    }

    const options = {
      amount: booking.totalAmount * 100,
      currency: "INR",
      receipt: booking.bookingCode,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId: req.user.id,
      bookingId,
      amount: booking.totalAmount,
      razorpayOrderId: order.id,
      status: "pending",
    });

    res.status(200).json(apiResponse(200, "Order created successfully", order));
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      throw new ApiError(400, "Missing payment details");
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      throw new ApiError(400, "Payment verification failed");
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      throw new ApiError(404, "Payment record not found");
    }

    if (!payment.userId) {
      throw new ApiError(
        500,
        "Payment record is missing user information"
      );
    }

    if (payment.userId.toString() !== req.user.id) {
      throw new ApiError(
        403,
        "You are not allowed to verify this payment"
      );
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "paid";

    await payment.save();

    const booking = await Booking.findById(payment.bookingId);

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.bookingStatus === "cancelled") {
      throw new ApiError(400, "Booking expired. Please contact support.");
    }

    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";

    await booking.save();

    // Increment bookedSeats on the Event
    const event = await Event.findById(booking.eventId);
    if (event) {
      event.bookedSeats += booking.quantity;
      await event.save();
    }

    // Auto-create Commission record (20% platform, 80% organizer)
    if (event && booking.totalAmount > 0) {
      const commissionPercentage = 20;
      const commissionAmount = (booking.totalAmount * commissionPercentage) / 100;
      const organizerAmount = booking.totalAmount - commissionAmount;

      await Commission.create({
        bookingId: booking._id,
        eventId: booking.eventId,
        organizerId: event.organizer,
        paymentId: payment._id,
        totalAmount: booking.totalAmount,
        commissionPercentage,
        commissionAmount,
        organizerAmount,
        status: "pending",
      });
    }

    res.status(200).json(
      apiResponse(200, "Payment verified successfully", {
        payment,
        booking,
      })
    );
  } catch (error) {
    next(error);
  }
};

const getPaymentDetails = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("bookingId");

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    res
      .status(200)
      .json(apiResponse(200, "Payment fetched successfully", payment));
  } catch (error) {
    next(error);
  }
};

const refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    payment.status = "refunded";

    await payment.save();

    res
      .status(200)
      .json(apiResponse(200, "Refund marked successfully", payment));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentDetails,
  refundPayment,
};
