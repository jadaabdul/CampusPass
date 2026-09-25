const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} = require("../controllers/authController");

const verifyToken = require("../middlewares/verifyToken");


router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/send-otp", sendOTP);

router.post("/verify-otp", verifyOTP);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);


router.get("/me", verifyToken, getCurrentUser);

module.exports = router;
