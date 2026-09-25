const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Ticket = require("../models/Ticket");
const Event = require("../models/Event");

const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");

const generateBookingCode = require("../utils/generateBookingCode");
const { generateQRCode } = require("../services/qrService");

const createBooking = async (req, res, next) => {
  try {
    const { ticketId, quantity } = req.body;
    const requestedQuantity = Number(quantity);

    if (
      !ticketId ||
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      throw new ApiError(
        400,
        "A ticket and a valid quantity are required"
      );
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new ApiError(404, "Ticket not found");
    }

    if (
      ticket.status !== "active" ||
      ticket.remainingQuantity < requestedQuantity
    ) {
      throw new ApiError(400, "Not enough tickets available");
    }

    const event = await Event.findById(ticket.eventId);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    const bookingCode = generateBookingCode();
    const totalAmount = ticket.price * requestedQuantity;

    const qrData = JSON.stringify({
      bookingCode,
      eventId: event._id,
      ticketId: ticket._id,
      userId: req.user.id,
    });

    const qrCode = await generateQRCode(qrData);

    const booking = await Booking.create({
      userId: req.user.id,
      eventId: event._id,
      ticketId: ticket._id,
      quantity: requestedQuantity,
      totalAmount,
      bookingCode,
      qrCode,
      bookingStatus: "pending",
      paymentStatus: ticket.price === 0 ? "paid" : "unpaid",
    });

    res
      .status(201)
      .json(apiResponse(201, "Booking created successfully", booking));
  } catch (error) {
    next(error);
  }
};

const confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.bookingStatus === "confirmed") {
      throw new ApiError(400, "Booking already confirmed");
    }

    const ticket = await Ticket.findById(booking.ticketId);

    if (!ticket || ticket.remainingQuantity < booking.quantity) {
      throw new ApiError(400, "Not enough tickets available");
    }

    booking.bookingStatus = "confirmed";
    booking.paymentStatus = "paid";
    await booking.save();

    ticket.remainingQuantity -= booking.quantity;

    if (ticket.remainingQuantity === 0) {
      ticket.status = "sold_out";
    }

    await ticket.save();

    res
      .status(200)
      .json(apiResponse(200, "Booking confirmed successfully", booking));
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.bookingStatus === "cancelled") {
      throw new ApiError(400, "Booking is already cancelled");
    }

    booking.bookingStatus = "cancelled";
    await booking.save();

    const ticket = await Ticket.findById(booking.ticketId);

    if (ticket) {
      ticket.remainingQuantity += booking.quantity;
      if (ticket.status === "sold_out" && ticket.remainingQuantity > 0) {
        ticket.status = "active";
      }
      await ticket.save();
    }

    res
      .status(200)
      .json(apiResponse(200, "Booking cancelled successfully", booking));
  } catch (error) {
    next(error);
  }
};

const getBookingDetails = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("eventId")
      .populate("ticketId");

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    res
      .status(200)
      .json(apiResponse(200, "Booking details fetched", booking));
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("eventId")
      .populate("ticketId")
      .sort({ createdAt: -1 });

    res.status(200).json(apiResponse(200, "User bookings fetched", bookings));
  } catch (error) {
    next(error);
  }
};

const downloadTicket = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    res.status(200).json(
      apiResponse(200, "Ticket download data", {
        bookingCode: booking.bookingCode,
        qrCode: booking.qrCode,
      }),
    );
  } catch (error) {
    next(error);
  }
};

const getQRCode = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    res.status(200).json(
      apiResponse(200, "QR code fetched", {
        qrCode: booking.qrCode,
      }),
    );
  } catch (error) {
    next(error);
  }
};

const toggleCheckIn = async (req, res, next) => {
  try {
    const { checkedIn } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    booking.checkedIn = checkedIn;
    if (checkedIn) {
      booking.scannedAt = new Date();
    } else {
      booking.scannedAt = undefined;
    }

    await booking.save();

    res.status(200).json(apiResponse(200, "Check-in status updated", booking));
  } catch (error) {
    next(error);
  }
};

const verifyBooking = async (req, res, next) => {
  try {
    const { code } = req.params;
    const query = mongoose.Types.ObjectId.isValid(code)
      ? { $or: [{ bookingCode: code }, { _id: code }] }
      : { bookingCode: code };

    const booking = await Booking.findOne(query)
      .populate("userId", "fullName email mobile")
      .populate("eventId", "title startDate venue")
      .populate("ticketId", "title price");

    if (!booking) {
      throw new ApiError(404, "Invalid or unverified ticket pass code");
    }

    res.status(200).json(
      apiResponse(200, "Ticket verified successfully", {
        _id: booking._id,
        bookingCode: booking.bookingCode,
        status: booking.bookingStatus,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        checkedIn: booking.checkedIn,
        seatsCount: booking.quantity || 1,
        quantity: booking.quantity || 1,
        user: booking.userId,
        event: booking.eventId,
        ticket: booking.ticketId,
        totalAmount: booking.totalAmount,
        createdAt: booking.createdAt,
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  confirmBooking,
  cancelBooking,
  getBookingDetails,
  getMyBookings,
  downloadTicket,
  getQRCode,
  toggleCheckIn,
  verifyBooking,
};
