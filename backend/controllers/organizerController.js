const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");

const getDashboardStats = async (req, res, next) => {
  try {
    const organizerId = req.user.id;

    const myEvents = await Event.find({ organizer: organizerId });

    let totalBookings = 0;
    let totalRevenue = 0;

    myEvents.forEach(evt => {
      const booked = Number(evt.bookedSeats) || 0;
      const price = Number(evt.price) || 0;
      totalBookings += booked;
      totalRevenue += booked * price;
    });

    res.status(200).json(
      apiResponse(200, "Dashboard stats fetched", {
        totalEvents: myEvents.length,
        totalBookings: totalBookings,
        totalRevenue: totalRevenue,
      }),
    );
  } catch (error) {
    next(error);
  }
};

const getRevenueStats = async (req, res, next) => {
  try {
    const myEvents = await Event.find({ organizer: req.user.id }).select("_id");
    const eventIds = myEvents.map(e => e._id);

    const bookings = await Booking.find({ eventId: { $in: eventIds } }).select("_id");
    const bookingIds = bookings.map(b => b._id);

    const revenue = await Payment.find({
      bookingId: { $in: bookingIds },
      status: "paid",
    }).sort({
      createdAt: -1,
    });

    res
      .status(200)
      .json(apiResponse(200, "Revenue stats fetched", revenue));
  } catch (error) {
    next(error);
  }
};

const getAttendees = async (req, res, next) => {
  try {
    const attendees = await Booking.find({
      eventId: req.params.eventId,
      bookingStatus: "confirmed",
    })
      .populate("userId", "fullName email mobile")
      .populate("ticketId");

    res.status(200).json(apiResponse(200, "Attendees fetched", attendees));
  } catch (error) {
    next(error);
  }
};

const scanTicket = async (req, res, next) => {
  try {
    const { bookingCode } = req.body;

    const booking = await Booking.findOne({
      bookingCode,
    });

    if (!booking) {
      throw new ApiError(404, "Invalid ticket");
    }

    if (booking.checkedIn) {
      throw new ApiError(400, "Ticket already used");
    }

    booking.checkedIn = true;
    booking.scannedAt = new Date();

    await booking.save();

    res
      .status(200)
      .json(apiResponse(200, "Ticket verified successfully", booking));
  } catch (error) {
    next(error);
  }
};

const exportAttendees = async (req, res, next) => {
  try {
    const attendees = await Booking.find({
      eventId: req.params.eventId,
      bookingStatus: "confirmed",
    }).populate("userId", "fullName email mobile");

    res
      .status(200)
      .json(apiResponse(200, "Attendee export data", attendees));
  } catch (error) {
    next(error);
  }
};

const getEventAnalytics = async (req, res, next) => {
  try {
    const events = await Event.find({
      organizer: req.user.id,
    });

    const analytics = await Promise.all(
      events.map(async (event) => {
        const bookings = await Booking.countDocuments({
          eventId: event._id,
        });

        return {
          eventId: event._id,
          title: event.title,
          bookings,
        };
      }),
    );

    res.status(200).json(apiResponse(200, "Analytics fetched", analytics));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getRevenueStats,
  getAttendees,
  scanTicket,
  exportAttendees,
  getEventAnalytics,
};
