const express = require("express");

const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
  addFavorite,
  removeFavorite,
  getFavorites,
  getMyBookings,
} = require("../controllers/userController");

const verifyToken = require("../middlewares/verifyToken");

const upload = require("../configs/multer");



router.get("/profile", verifyToken, getProfile);

router.put("/profile", verifyToken, updateProfile);


router.patch("/change-password", verifyToken, changePassword);


router.patch(
  "/profile-image",
  verifyToken,
  upload.single("profileImage"),
  uploadProfileImage,
);


router.post("/favorites/:eventId", verifyToken, addFavorite);

router.delete("/favorites/:eventId", verifyToken, removeFavorite);

router.get("/favorites", verifyToken, getFavorites);


router.get("/bookings", verifyToken, getMyBookings);

module.exports = router;
