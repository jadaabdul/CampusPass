const Booking = require("../models/Booking");
const Ticket = require("../models/Ticket");

const expireBookings = async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const expiredBookings = await Booking.find({
      paymentStatus: { $in: ["pending", "unpaid"] },
      bookingStatus: "pending",
      createdAt: { $lt: tenMinutesAgo },
    });

    if (expiredBookings.length === 0) return;

    console.log(`Found ${expiredBookings.length} expired bookings to cancel`);

    for (const booking of expiredBookings) {
      booking.paymentStatus = "expired";
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
    }
  } catch (error) {
    console.error("Error running expireBookings job:", error);
  }
};

module.exports = expireBookings;
