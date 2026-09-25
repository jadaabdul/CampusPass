const Commission = require("../models/Commission");
const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");

// Admin: get all commission records (paginated)
const getAllCommissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {};
    if (status && ["pending", "paid"].includes(status)) {
      filter.status = status;
    }

    const [commissions, total] = await Promise.all([
      Commission.find(filter)
        .populate("organizerId", "fullName email")
        .populate("eventId", "title startDate")
        .populate("bookingId", "bookingCode totalAmount")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Commission.countDocuments(filter),
    ]);

    res.status(200).json(
      apiResponse(200, "Commissions fetched successfully", {
        commissions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

// Admin: mark a commission as paid (organizer payout done)
const markCommissionPaid = async (req, res, next) => {
  try {
    const commission = await Commission.findById(req.params.id);

    if (!commission) {
      throw new ApiError(404, "Commission record not found");
    }

    if (commission.status === "paid") {
      throw new ApiError(400, "Commission is already marked as paid");
    }

    commission.status = "paid";
    await commission.save();

    res.status(200).json(apiResponse(200, "Commission marked as paid", commission));
  } catch (error) {
    next(error);
  }
};

// Organizer: get their own commission records
const getOrganizerCommissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [commissions, total] = await Promise.all([
      Commission.find({ organizerId: req.user.id })
        .populate("eventId", "title startDate")
        .populate("bookingId", "bookingCode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Commission.countDocuments({ organizerId: req.user.id }),
    ]);

    res.status(200).json(
      apiResponse(200, "Organizer commissions fetched", {
        commissions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCommissions,
  markCommissionPaid,
  getOrganizerCommissions,
};
