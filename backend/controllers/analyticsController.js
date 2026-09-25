const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const Commission = require("../models/Commission");
const User = require("../models/User");

const apiResponse = require("../utils/apiResponse");

// ==========================================
// ADMIN ANALYTICS
// ==========================================

const getAdminAnalytics = async (req, res, next) => {
  try {
    // ---- Summary Totals ----
    const [revenueData, bookingRevenueData, commissionData, totalPayments] = await Promise.all([
      Payment.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Booking.aggregate([
        { $match: { $or: [{ paymentStatus: "paid" }, { bookingStatus: "confirmed" }] } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Commission.aggregate([
        { $group: { _id: null, platformTotal: { $sum: "$commissionAmount" }, organizerTotal: { $sum: "$organizerAmount" } } },
      ]),
      Payment.countDocuments({ status: "paid" }),
    ]);

    const totalRevenue = revenueData[0]?.total || bookingRevenueData[0]?.total || 0;
    const totalPlatformCommission = commissionData[0]?.platformTotal || Math.round(totalRevenue * 0.2);
    const totalOrganizerPayouts = commissionData[0]?.organizerTotal || Math.round(totalRevenue * 0.8);

    // ---- Monthly Revenue (last 12 months) ----
    let monthlyRevenue = await Payment.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    if (!monthlyRevenue || monthlyRevenue.length === 0) {
      monthlyRevenue = await Booking.aggregate([
        { $match: { $or: [{ paymentStatus: "paid" }, { bookingStatus: "confirmed" }] } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]);
    }

    // ---- Weekly Revenue (last 12 weeks) ----
    let weeklyRevenue = await Payment.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, week: { $week: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
      { $limit: 12 },
    ]);

    if (!weeklyRevenue || weeklyRevenue.length === 0) {
      weeklyRevenue = await Booking.aggregate([
        { $match: { $or: [{ paymentStatus: "paid" }, { bookingStatus: "confirmed" }] } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, week: { $week: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.week": 1 } },
        { $limit: 12 },
      ]);
    }

    // ---- Revenue by Event ----
    const revenueByEvent = await Commission.aggregate([
      {
        $group: {
          _id: "$eventId",
          totalRevenue: { $sum: "$totalAmount" },
          platformCommission: { $sum: "$commissionAmount" },
          organizerEarnings: { $sum: "$organizerAmount" },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          eventId: "$_id",
          eventTitle: "$event.title",
          totalRevenue: 1,
          platformCommission: 1,
          organizerEarnings: 1,
          transactionCount: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    // ---- Revenue by Organizer ----
    const revenueByOrganizer = await Commission.aggregate([
      {
        $group: {
          _id: "$organizerId",
          totalRevenue: { $sum: "$totalAmount" },
          platformCommission: { $sum: "$commissionAmount" },
          organizerEarnings: { $sum: "$organizerAmount" },
          eventCount: { $addToSet: "$eventId" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "organizer",
        },
      },
      { $unwind: { path: "$organizer", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          organizerId: "$_id",
          organizerName: "$organizer.fullName",
          organizerEmail: "$organizer.email",
          totalRevenue: 1,
          platformCommission: 1,
          organizerEarnings: 1,
          eventCount: { $size: "$eventCount" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // ---- Commission Pending vs Paid ----
    const commissionStatus = await Commission.aggregate([
      {
        $group: {
          _id: "$status",
          total: { $sum: "$organizerAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(
      apiResponse(200, "Admin analytics fetched successfully", {
        summary: {
          totalRevenue,
          totalPlatformCommission,
          totalOrganizerPayouts,
          totalPayments,
        },
        monthlyRevenue,
        weeklyRevenue,
        revenueByEvent,
        revenueByOrganizer,
        commissionStatus,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ORGANIZER ANALYTICS
// ==========================================

const getOrganizerAnalytics = async (req, res, next) => {
  try {
    const organizerId = req.user.id;
    const mongoose = require("mongoose");
    const orgObjId = mongoose.Types.ObjectId.isValid(organizerId)
      ? new mongoose.Types.ObjectId(organizerId)
      : organizerId;

    const myEvents = await Event.find({ organizer: organizerId });
    const eventIds = myEvents.map((e) => e._id);

    const totalEvents = myEvents.length;
    const approvedEvents = myEvents.filter((e) => e.status === "approved" || e.status === "published").length;
    const pendingEvents = myEvents.filter((e) => e.status === "pending").length;

    // Ticket sales and revenue fallback from Bookings
    const bookings = await Booking.find({
      eventId: { $in: eventIds },
      $or: [{ bookingStatus: "confirmed" }, { paymentStatus: "paid" }],
    }).populate("ticketId");

    const totalTicketsSold = bookings.reduce((acc, b) => acc + (b.quantity || b.seatsCount || 1), 0);

    const bookingRevenue = bookings.reduce((acc, b) => {
      const amount = b.totalAmount || (b.ticketId?.price ? b.ticketId.price * (b.quantity || 1) : 0);
      return acc + amount;
    }, 0);

    // Commission summary
    const commissionData = await Commission.aggregate([
      { $match: { organizerId: orgObjId } },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: "$totalAmount" },
          platformCommission: { $sum: "$commissionAmount" },
          netEarnings: { $sum: "$organizerAmount" },
        },
      },
    ]);

    const commObj = commissionData[0] || {};
    const grossRevenue = commObj.grossRevenue || bookingRevenue;
    const platformCommission = commObj.platformCommission || Math.round(grossRevenue * 0.2);
    const netEarnings = commObj.netEarnings || Math.round(grossRevenue * 0.8);

    // Revenue over time (monthly)
    let revenueOverTime = await Commission.aggregate([
      { $match: { organizerId: orgObjId } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          commission: { $sum: "$commissionAmount" },
          earnings: { $sum: "$organizerAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    if (!revenueOverTime || revenueOverTime.length === 0) {
      revenueOverTime = await Booking.aggregate([
        { $match: { eventId: { $in: eventIds }, $or: [{ bookingStatus: "confirmed" }, { paymentStatus: "paid" }] } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            commission: { $sum: { $multiply: ["$totalAmount", 0.2] } },
            earnings: { $sum: { $multiply: ["$totalAmount", 0.8] } },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);
    }

    // Per-event performance
    const eventPerformance = await Commission.aggregate([
      { $match: { organizerId: orgObjId } },
      {
        $group: {
          _id: "$eventId",
          grossRevenue: { $sum: "$totalAmount" },
          platformCommission: { $sum: "$commissionAmount" },
          netEarnings: { $sum: "$organizerAmount" },
          ticketsSold: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          eventId: "$_id",
          eventTitle: "$event.title",
          eventStatus: "$event.status",
          grossRevenue: 1,
          platformCommission: 1,
          netEarnings: 1,
          ticketsSold: 1,
        },
      },
      { $sort: { grossRevenue: -1 } },
    ]);

    res.status(200).json(
      apiResponse(200, "Organizer analytics fetched successfully", {
        summary: {
          totalEvents,
          approvedEvents,
          pendingEvents,
          totalTicketsSold,
          grossRevenue,
          platformCommission,
          netEarnings,
        },
        revenueOverTime,
        eventPerformance,
      })
    );
  } catch (error) {
    next(error);
  }
};

// ==========================================
// EVENT ANALYTICS (per event)
// ==========================================

const getEventAnalyticsById = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const mongoose = require("mongoose");
    const eventObjId = mongoose.Types.ObjectId.isValid(eventId)
      ? new mongoose.Types.ObjectId(eventId)
      : eventId;

    const event = await Event.findById(eventId).populate("venue", "name capacity");

    if (!event) {
      return res.status(404).json(apiResponse(404, "Event not found"));
    }

    const [bookingStats, commissionStats] = await Promise.all([
      Booking.aggregate([
        { $match: { eventId: eventObjId } },
        {
          $group: {
            _id: "$bookingStatus",
            count: { $sum: 1 },
            totalTickets: { $sum: "$quantity" },
          },
        },
      ]),
      Commission.aggregate([
        { $match: { eventId: eventObjId } },
        {
          $group: {
            _id: null,
            grossRevenue: { $sum: "$totalAmount" },
            platformCommission: { $sum: "$commissionAmount" },
            organizerEarnings: { $sum: "$organizerAmount" },
          },
        },
      ]),
    ]);

    const bookingsByStatus = bookingStats.reduce((acc, curr) => {
      acc[curr._id] = { count: curr.count, tickets: curr.totalTickets };
      return acc;
    }, {});

    const totalTicketsSold = (bookingsByStatus.confirmed?.tickets || 0) + (bookingsByStatus.pending?.tickets || 0);

    const commissionData = commissionStats[0] || {};
    const fallbackRevenue = (event.price || 0) * totalTicketsSold;
    const grossRevenue = commissionData.grossRevenue || fallbackRevenue;
    const platformCommission = commissionData.platformCommission || Math.round(grossRevenue * 0.2);
    const organizerEarnings = commissionData.organizerEarnings || Math.round(grossRevenue * 0.8);

    const venueCapacity = event.venue?.capacity || event.capacity || 0;
    const remainingSeats = Math.max(0, venueCapacity - totalTicketsSold);
    const occupancyRate = venueCapacity > 0 ? ((totalTicketsSold / venueCapacity) * 100).toFixed(1) : 0;

    res.status(200).json(
      apiResponse(200, "Event analytics fetched successfully", {
        event: {
          id: event._id,
          title: event.title,
          status: event.status,
          price: event.price,
          startDate: event.startDate,
          venueName: event.venue?.name,
          venueCapacity,
        },
        occupancy: {
          capacity: venueCapacity,
          ticketsSold: totalTicketsSold,
          remainingSeats,
          occupancyRate: Number(occupancyRate),
        },
        financials: {
          grossRevenue,
          platformCommission,
          organizerEarnings,
        },
        bookingsByStatus,
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminAnalytics,
  getOrganizerAnalytics,
  getEventAnalyticsById,
};
