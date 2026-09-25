const express = require("express");

const router = express.Router();

const {
  createOrder,
  verifyPayment,
  getPaymentDetails,
  refundPayment,
} = require("../controllers/paymentController.js");

const verifyToken = require("../middlewares/verifyToken");

const authorizeRole = require("../middlewares/authorizeRole");



router.post("/create-order", verifyToken, createOrder);

router.post("/verify", verifyToken, verifyPayment);

router.get("/:id", verifyToken, getPaymentDetails);



router.post("/refund/:id", verifyToken, authorizeRole("admin"), refundPayment);

module.exports = router;
