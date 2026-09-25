const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");

const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalEvents = await Event.countDocuments();

    const totalBookings = await Booking.countDocuments();

    const revenueData = await Payment.aggregate([
      {
        $match: {
          status: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    const totalOrganizers = await User.countDocuments({
      role: "organizer",
    });

    res.status(200).json(
      apiResponse(200, "Dashboard stats fetched", {
        totalOrganizers,
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue,
      }),
    );
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const filter = {
      _id: {
        $ne: req.user.id,
      },
    };

    // Role filter

    if (role && ["student", "organizer", "admin"].includes(role)) {
      filter.role = role;
    }

    // Search filter

    if (search) {
      filter.$or = [
        {
          fullName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(Number(limit)),

      User.countDocuments(filter),
    ]);

    res.status(200).json(
      apiResponse(200, "Users fetched successfully", {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalUsers,
          totalPages: Math.ceil(totalUsers / limit),
        },
      }),
    );
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json(apiResponse(200, "User fetched successfully", user));
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: "blocked",
      },
      {
        new: true,
      },
    )
    .select("-password");


    if (!user) {
      throw new ApiError(
        404,
        "User not found"
      );
    }


    res.status(200).json(
      apiResponse(
        200,
        "User blocked successfully",
        user
      )
    );


  } catch (error) {
    next(error);
  }
};



const unblockUser = async (req, res, next) => {
  try {

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: "active",
      },
      {
        new: true,
      },
    )
    .select("-password");


    if (!user) {
      throw new ApiError(
        404,
        "User not found"
      );
    }


    res.status(200).json(
      apiResponse(
        200,
        "User unblocked successfully",
        user
      )
    );


  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    const allowedRoles = ["student", "organizer", "admin"];

    if (!allowedRoles.includes(role)) {
      throw new ApiError(400, "Invalid role");
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        role,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res
      .status(200)
      .json(apiResponse(200, "User role updated successfully", user));
  } catch (error) {
    next(error);
  }
};

const approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "approved",
        status: "published",
      },
      {
        new: true,
      },
    );

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    res
      .status(200)
      .json(apiResponse(200, "Event approved successfully", event));
  } catch (error) {
    next(error);
  }
};

const rejectEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus: "rejected",
      },
      {
        new: true,
      },
    );

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    res
      .status(200)
      .json(apiResponse(200, "Event rejected successfully", event));
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json(apiResponse(200, "Event deleted successfully"));
  } catch (error) {
    next(error);
  }
};

const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "fullName email")
      .sort({
        createdAt: -1,
      });

    res
      .status(200)
      .json(apiResponse(200, "Payments fetched successfully", payments));
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "fullName email")
      .populate("eventId")
      .sort({
        createdAt: -1,
      });

    res
      .status(200)
      .json(apiResponse(200, "Bookings fetched successfully", bookings));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
  updateUserRole,
  approveEvent,
  rejectEvent,
  deleteEvent,
  getAllPayments,
  getAllBookings,
};
