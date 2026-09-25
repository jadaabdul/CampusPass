const Ticket = require("../models/Ticket");
const Event = require("../models/Event");

const apiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");

const createTicket = async (req, res, next) => {
  try {
    const {
      eventId,
      title,
      description,
      price,
      quantity,
      saleStartDate,
      saleEndDate,
    } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    const ticket = await Ticket.create({
      eventId,
      title,
      description,
      price,
      quantity,
      remainingQuantity: quantity,
      saleStartDate,
      saleEndDate,
    });

    res
      .status(201)
      .json(apiResponse(201, "Ticket created successfully", ticket));
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!ticket) {
      throw new ApiError(404, "Ticket not found");
    }

    res
      .status(200)
      .json(apiResponse(200, "Ticket updated successfully", ticket));
  } catch (error) {
    next(error);
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new ApiError(404, "Ticket not found");
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.status(200).json(apiResponse(200, "Ticket deleted successfully"));
  } catch (error) {
    next(error);
  }
};

const getEventTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({
      eventId: req.params.eventId,
    });

    res
      .status(200)
      .json(apiResponse(200, "Tickets fetched successfully", tickets));
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("eventId");

    if (!ticket) {
      throw new ApiError(404, "Ticket not found");
    }

    res
      .status(200)
      .json(apiResponse(200, "Ticket fetched successfully", ticket));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  updateTicket,
  deleteTicket,
  getEventTickets,
  getTicketById,
};
