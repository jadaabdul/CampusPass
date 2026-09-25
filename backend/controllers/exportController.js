const Payment = require("../models/Payment");
const Commission = require("../models/Commission");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const User = require("../models/User");
const { Parser } = require("json-2-csv");
const PDFDocument = require("pdfkit");

const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");

// Helper: send CSV response
const sendCSV = (res, data, filename) => {
  const parser = new Parser();
  const csv = parser.parse(data);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
  res.status(200).send(csv);
};

// Helper: send PDF response
const sendPDF = (res, title, rows, headers, filename) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`);
  doc.pipe(res);

  // Title
  doc.fontSize(18).font("Helvetica-Bold").text(title, { align: "center" });
  doc.moveDown();
  doc.fontSize(10).font("Helvetica").text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
  doc.moveDown(1.5);

  // Table headers
  const colWidth = Math.floor((doc.page.width - 80) / headers.length);
  let y = doc.y;
  headers.forEach((h, i) => {
    doc.font("Helvetica-Bold").fontSize(9).text(h, 40 + i * colWidth, y, { width: colWidth, align: "left" });
  });
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
  doc.moveDown(0.3);

  // Table rows
  rows.forEach((row) => {
    y = doc.y;
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = doc.y;
    }
    row.forEach((cell, i) => {
      doc.font("Helvetica").fontSize(8).text(String(cell ?? ""), 40 + i * colWidth, y, { width: colWidth, align: "left" });
    });
    doc.moveDown(0.4);
  });

  doc.end();
};

// ---- Revenue Report ----
const exportRevenueReport = async (req, res, next) => {
  try {
    const { format = "csv" } = req.query;

    const payments = await Payment.find({ status: "paid" })
      .populate("userId", "fullName email")
      .populate("bookingId", "bookingCode totalAmount")
      .sort({ createdAt: -1 });

    const data = payments.map((p) => ({
      Date: new Date(p.createdAt).toLocaleDateString(),
      "Transaction ID": p.razorpayPaymentId || p._id,
      User: p.userId?.fullName || "N/A",
      Email: p.userId?.email || "N/A",
      "Amount (INR)": p.amount,
      Status: p.status,
    }));

    if (format === "pdf") {
      return sendPDF(
        res,
        "Revenue Report - CampusPass",
        data.map((d) => Object.values(d)),
        Object.keys(data[0] || {}),
        "revenue_report"
      );
    }

    sendCSV(res, data, "revenue_report");
  } catch (error) {
    next(error);
  }
};

// ---- Commission Report ----
const exportCommissionReport = async (req, res, next) => {
  try {
    const { format = "csv" } = req.query;

    const commissions = await Commission.find()
      .populate("organizerId", "fullName email")
      .populate("eventId", "title")
      .sort({ createdAt: -1 });

    const data = commissions.map((c) => ({
      Date: new Date(c.createdAt).toLocaleDateString(),
      Event: c.eventId?.title || "N/A",
      Organizer: c.organizerId?.fullName || "N/A",
      "Total Amount (INR)": c.totalAmount,
      "Commission %": c.commissionPercentage,
      "Platform Commission (INR)": c.commissionAmount,
      "Organizer Earning (INR)": c.organizerAmount,
      Status: c.status,
    }));

    if (format === "pdf") {
      return sendPDF(
        res,
        "Commission Report - CampusPass",
        data.map((d) => Object.values(d)),
        Object.keys(data[0] || {}),
        "commission_report"
      );
    }

    sendCSV(res, data, "commission_report");
  } catch (error) {
    next(error);
  }
};

// ---- Organizer Payout Report ----
const exportOrganizerPayoutReport = async (req, res, next) => {
  try {
    const { format = "csv" } = req.query;

    const payouts = await Commission.aggregate([
      {
        $group: {
          _id: "$organizerId",
          totalEarnings: { $sum: "$organizerAmount" },
          totalCommission: { $sum: "$commissionAmount" },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$organizerAmount", 0] },
          },
          paidAmount: {
            $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$organizerAmount", 0] },
          },
          eventCount: { $addToSet: "$eventId" },
        },
      },
      {
        $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "organizer" },
      },
      { $unwind: { path: "$organizer", preserveNullAndEmptyArrays: true } },
    ]);

    const data = payouts.map((p) => ({
      Organizer: p.organizer?.fullName || "N/A",
      Email: p.organizer?.email || "N/A",
      "Events Count": p.eventCount?.length || 0,
      "Total Earnings (INR)": p.totalEarnings,
      "Platform Commission (INR)": p.totalCommission,
      "Pending Payout (INR)": p.pendingAmount,
      "Paid Out (INR)": p.paidAmount,
    }));

    if (format === "pdf") {
      return sendPDF(
        res,
        "Organizer Payout Report - CampusPass",
        data.map((d) => Object.values(d)),
        Object.keys(data[0] || {}),
        "organizer_payout_report"
      );
    }

    sendCSV(res, data, "organizer_payout_report");
  } catch (error) {
    next(error);
  }
};

// ---- Event Performance Report ----
const exportEventPerformanceReport = async (req, res, next) => {
  try {
    const { format = "csv" } = req.query;

    const events = await Event.find().populate("organizer", "fullName").populate("venue", "name");

    const bookingCounts = await Booking.aggregate([
      { $group: { _id: "$eventId", confirmed: { $sum: { $cond: [{ $eq: ["$bookingStatus", "confirmed"] }, 1, 0] } } } },
    ]);
    const bookingMap = {};
    bookingCounts.forEach((b) => { bookingMap[b._id.toString()] = b.confirmed; });

    const commissions = await Commission.aggregate([
      { $group: { _id: "$eventId", revenue: { $sum: "$totalAmount" }, commission: { $sum: "$commissionAmount" }, earnings: { $sum: "$organizerAmount" } } },
    ]);
    const commissionMap = {};
    commissions.forEach((c) => { commissionMap[c._id.toString()] = c; });

    const data = events.map((e) => {
      const cm = commissionMap[e._id.toString()] || {};
      return {
        Title: e.title,
        Organizer: e.organizer?.fullName || "N/A",
        Venue: e.venue?.name || "N/A",
        Status: e.status,
        Capacity: e.capacity,
        "Tickets Sold": bookingMap[e._id.toString()] || 0,
        "Gross Revenue (INR)": cm.revenue || 0,
        "Platform Commission (INR)": cm.commission || 0,
        "Organizer Earnings (INR)": cm.earnings || 0,
      };
    });

    if (format === "pdf") {
      return sendPDF(
        res,
        "Event Performance Report - CampusPass",
        data.map((d) => Object.values(d)),
        Object.keys(data[0] || {}),
        "event_performance_report"
      );
    }

    sendCSV(res, data, "event_performance_report");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportRevenueReport,
  exportCommissionReport,
  exportOrganizerPayoutReport,
  exportEventPerformanceReport,
};
