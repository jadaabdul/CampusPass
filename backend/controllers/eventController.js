const Event = require("../models/Event");
const User = require("../models/User");
const Category = require("../models/Category");
const Notification = require("../models/Notification");
const Venue = require("../models/Venue");
const Ticket = require("../models/Ticket");

const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");
const createNotification = require("../utils/createNotification");
const checkVenueAvailability = require("../utils/checkVenueAvailability");

const {
  uploadToCloudinary,
} = require("../services/cloudinaryService");


// Create Event

const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      venue,
      startDate,
      startTime,
      endDate,
      endTime,
      registrationDeadline,
      capacity,
      price,
    } = req.body;

    // Validate required fields
    if (!title || !category || !venue || !startDate) {
      throw new ApiError(400, "Title, Category, Venue, and Start Date are required");
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const finalDescription = description ? description.trim() : title.trim();

    /*
    --------------------------------
    Check Category Exists
    --------------------------------
    */
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new ApiError(404, "Category not found");
    }

    /*
    --------------------------------
    Check Venue Exists
    --------------------------------
    */
    const venueExists = await Venue.findById(venue);
    if (!venueExists) {
      throw new ApiError(404, "Venue not found");
    }

    /*
    --------------------------------
    Check Venue Availability (time-aware)
    --------------------------------
    */
    const { available, conflictingEvent } = await checkVenueAvailability(
      venue,
      startDate,
      startTime || "",
      endDate || startDate,
      endTime || ""
    );

    if (!available) {
      throw new ApiError(
        400,
        `Venue is already booked during this time. Conflict with event: "${conflictingEvent.title}"`
      );
    }

    /*
    --------------------------------
    Validate Dates
    --------------------------------
    */
    const deadline = registrationDeadline ? new Date(registrationDeadline) : null;

    if (start >= end) {
      throw new ApiError(400, "End date must be after start date");
    }

    if (deadline && deadline >= start) {
      throw new ApiError(400, "Registration deadline must be before start date");
    }

    if (deadline && deadline < new Date()) {
      throw new ApiError(400, "Registration deadline cannot be in the past");
    }

    /*
    --------------------------------
    Check Venue Capacity
    --------------------------------
    */
    const eventCapacity = Number(capacity);
    if (isNaN(eventCapacity) || eventCapacity <= 0) {
      throw new ApiError(400, "Capacity must be a positive number");
    }

    if (eventCapacity > venueExists.capacity) {
      throw new ApiError(400, `Event capacity (${eventCapacity}) exceeds venue capacity (${venueExists.capacity})`);
    }

    /*
    --------------------------------
    Validate Price
    --------------------------------
    */
    const eventPrice = Number(price) || 0;
    if (eventPrice < 0) {
      throw new ApiError(400, "Price cannot be negative");
    }

    /*
    --------------------------------
    FIX: Declare poster variable outside the if block
    Initialize it with empty string by default
    --------------------------------
    */
    let poster = req.body.poster || "";

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file, "campuspass/events");
        poster = result.secure_url;
      } catch (uploadError) {
        throw new ApiError(500, "Failed to upload poster image");
      }
    }

    /*
    --------------------------------
    Create Event
    --------------------------------
    */
    const event = await Event.create({
      title: title.trim(),
      description: finalDescription,
      poster,
      category,
      organizer: req.user.id,
      venue,
      startDate: start,
      startTime: startTime || "",
      endDate: end,
      endTime: endTime || "",
      registrationDeadline: deadline,
      capacity: eventCapacity,
      price: eventPrice,
      status: "pending"
    });

    /*
    --------------------------------
    Notification To Organizer
    --------------------------------
    */
    const Notification = require("../models/Notification");

    await createNotification({
      userId: req.user.id,
      title: "Event Submitted",
      message: `${title} has been submitted for approval.`,
      type: "event",
      data: {
        eventId: event._id
      }
    });

    /*
    --------------------------------
    Notification To Admins
    --------------------------------
    */
    const admins = await User.find({
      role: "admin",
      status: "active"
    }).select("_id");

    if (admins.length > 0) {
      const adminNotifications = admins.map((admin) => ({
        userId: admin._id,
        title: "New Event Approval Request",
        message: `${title} requires your approval.`,
        type: "event",
        data: {
          eventId: event._id,
          organizerId: req.user.id,
          eventTitle: title
        }
      }));

      await Notification.insertMany(adminNotifications);
    }

    /*
    --------------------------------
    Response
    --------------------------------
    */
    res.status(201).json(
      apiResponse(201, "Event created successfully", event)
    );

  } catch (error) {
    next(error);
  }
};







// Update Event


const updateEvent = async (req, res, next) => {

  try {


    const event =
      await Event.findById(
        req.params.id
      );



    if (!event) {

      throw new ApiError(
        404,
        "Event not found"
      );

    }




    if (
      event.organizer.toString()
      !== req.user.id
      &&
      req.user.role !== "admin"
    ) {

      throw new ApiError(
        403,
        "Unauthorized"
      );

    }





    Object.assign(event, req.body);

    // If venue or dates changed, re-validate venue availability
    if (req.body.venue || req.body.startDate || req.body.endDate || req.body.startTime || req.body.endTime) {
      const { available, conflictingEvent } = await checkVenueAvailability(
        event.venue,
        event.startDate,
        event.startTime || "",
        event.endDate,
        event.endTime || "",
        event._id.toString() // Exclude current event from check
      );

      if (!available) {
        throw new ApiError(
          400,
          `Venue is already booked during this time. Conflict with event: "${conflictingEvent.title}"`
        );
      }
    }

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file,
        "campuspass/events"
      );

      event.poster = result.secure_url;
    }




    await event.save();



    res
      .status(200)
      .json(
        apiResponse(
          200,
          "Event updated successfully",
          event
        )
      );



  } catch (error) {

    next(error);

  }

};








// Delete Event


const deleteEvent = async (req, res, next) => {

  try {


    const event =
      await Event.findById(
        req.params.id
      );



    if (!event) {

      throw new ApiError(
        404,
        "Event not found"
      );

    }



    if (
      event.organizer.toString()
      !== req.user.id
      &&
      req.user.role !== "admin"
    ) {

      throw new ApiError(
        403,
        "Unauthorized"
      );

    }




    await Event.findByIdAndDelete(
      req.params.id
    );



    res
      .status(200)
      .json(
        apiResponse(
          200,
          "Event deleted successfully"
        )
      );



  } catch (error) {

    next(error);

  }

};









// Public Events


const getAllEvents = async (req, res, next) => {

  try {


    const events =
      await Event.find({

        status: "approved"

      })
        .populate(
          "category"
        )
        .populate(
          "venue"
        )
        .populate(
          "organizer",
          "fullName email"
        )
        .sort({
          createdAt: -1
        })
        .lean();

    const tickets = await Ticket.find({
      eventId: { $in: events.map((e) => e._id) },
    });

    const eventsWithSeats = events.map((event) => {
      const eventTickets = tickets.filter(
        (t) => t.eventId.toString() === event._id.toString()
      );
      
      let availableSeats = 0;
      if (eventTickets.length > 0) {
        availableSeats = eventTickets.reduce(
          (sum, t) => sum + (t.status === "active" ? t.remainingQuantity : 0),
          0
        );
      } else {
        availableSeats = event.capacity - (event.bookedSeats || 0);
      }
      
      return {
        ...event,
        availableSeats,
      };
    });

    res
      .status(200)
      .json(
        apiResponse(
          200,
          "Events fetched successfully",
          eventsWithSeats
        )
      );



  } catch (error) {

    next(error);

  }

};









// Get Single Event


const getEventById =
  async (req, res, next) => {

    try {


      const event =
        await Event.findById(
          req.params.id
        )
          .populate("category")
          .populate("venue")
          .populate(
            "organizer",
            "fullName email"
          );



      if (!event) {

        throw new ApiError(
          404,
          "Event not found"
        );

      }



      res
        .status(200)
        .json(
          apiResponse(
            200,
            "Event fetched successfully",
            event
          )
        );



    } catch (error) {

      next(error);

    }

  };









// Organizer Events


const getMyEvents =
  async (req, res, next) => {

    try {


      const events =
        await Event.find({

          organizer: req.user.id

        })
          .sort({
            createdAt: -1
          });



      res
        .status(200)
        .json(
          apiResponse(
            200,
            "My events fetched successfully",
            events
          )
        );



    } catch (error) {

      next(error);

    }

  };









// Admin Approve Event


const approveEvent =
  async (req, res, next) => {

    try {


      const event =
        await Event.findByIdAndUpdate(

          req.params.id,

          {
            status: "approved"
          },

          {
            new: true
          }

        );



      if (!event) {

        throw new ApiError(
          404,
          "Event not found"
        );

      }

      await Ticket.create({
        eventId: event._id,
        title: "General Admission",
        description: "Standard entry pass",
        price: event.price || 0,
        quantity: event.capacity,
        remainingQuantity: event.capacity,
        status: "active"
      });





      await createNotification({

        userId: event.organizer,

        title: "Event Approved",

        message:
          `${event.title} has been approved.`,

        type: "event",

        data: {
          eventId: event._id
        }

      });




      res
        .status(200)
        .json(
          apiResponse(
            200,
            "Event approved successfully",
            event
          )
        );



    } catch (error) {

      next(error);

    }

  };









// Admin Reject Event


const rejectEvent =
  async (req, res, next) => {

    try {


      const {
        reason
      } = req.body;



      const event =
        await Event.findByIdAndUpdate(

          req.params.id,

          {
            status: "rejected",
            rejectionReason: reason
          },

          {
            new: true
          }

        );



      if (!event) {

        throw new ApiError(
          404,
          "Event not found"
        );

      }





      await createNotification({

        userId: event.organizer,

        title: "Event Rejected",

        message:
          `${event.title} was rejected.`,

        type: "event",

        data: {
          eventId: event._id
        }

      });





      res
        .status(200)
        .json(
          apiResponse(
            200,
            "Event rejected",
            event
          )
        );



    } catch (error) {

      next(error);

    }

  };









// Cancel Event


const cancelEvent =
  async (req, res, next) => {

    try {


      const event =
        await Event.findById(
          req.params.id
        );



      if (!event) {

        throw new ApiError(
          404,
          "Event not found"
        );

      }




      event.status = "cancelled";


      await event.save();





      await createNotification({

        userId: event.organizer,

        title: "Event Cancelled",

        message:
          `${event.title} has been cancelled.`,

        type: "event",

        data: {
          eventId: event._id
        }

      });





      res
        .status(200)
        .json(
          apiResponse(
            200,
            "Event cancelled",
            event
          )
        );



    } catch (error) {

      next(error);

    }

  };






// Get ALL events including unapproved (admin only)
const getAdminEvents = async (req, res, next) => {

  try {

    const events = await Event.find()
      .populate("category")
      .populate("venue")
      .populate("organizer", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json(
      apiResponse(200, "All events fetched successfully", events)
    );

  } catch (error) {

    next(error);

  }

};



module.exports = {

  createEvent,

  updateEvent,

  deleteEvent,

  getAllEvents,

  getEventById,

  getMyEvents,

  approveEvent,

  rejectEvent,

  cancelEvent,

  getAdminEvents

};