const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const venueRoutes = require("./routes/venueRoutes");
const eventRoutes = require("./routes/eventRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const organizerRoutes = require("./routes/organizerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const contactRoutes = require("./routes/contactRoutes");
const aiRoutes = require("./routes/aiRoutes");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CampusPass Backend Running",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/venues", venueRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/tickets", ticketRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/organizer", organizerRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/contact", contactRoutes);

app.use("/api/ai", aiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

app.use(errorHandler);

module.exports = app;
