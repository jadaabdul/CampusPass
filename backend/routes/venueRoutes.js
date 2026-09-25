const express = require("express");

const router = express.Router();


const {
  createVenue,
  updateVenue,
  deleteVenue,
  getAllVenues,
  getVenueById,
} = require("../controllers/venueController");


const verifyToken =
require("../middlewares/verifyToken");


const authorizeRole =
require("../middlewares/authorizeRole");




// ==========================
// Public Routes
// ==========================


// Get all active venues

router.get(
  "/",
  getAllVenues
);



// Get venue details

router.get(
  "/:id",
  getVenueById
);





// ==========================
// Admin Only Routes
// ==========================



// Create Venue

router.post(
  "/",
  verifyToken,
  authorizeRole("admin"),
  createVenue
);




// Update Venue

router.put(
  "/:id",
  verifyToken,
  authorizeRole("admin"),
  updateVenue
);




// Delete Venue

router.delete(
  "/:id",
  verifyToken,
  authorizeRole("admin"),
  deleteVenue
);




module.exports = router;