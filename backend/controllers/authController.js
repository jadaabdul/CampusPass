const bcrypt = require("bcryptjs");

const User = require("../models/User");

const generateToken = require("../utils/generateToken");

const { generateOTP } = require("../services/otpService");

const { sendEmail } = require("../services/emailService");

const apiResponse = require("../utils/apiResponse");

const ApiError = require("../utils/ApiError");

const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, mobile, password, role } = req.body;
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      throw new ApiError(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      mobile,
      password: hashedPassword,
      role,
    });

    const token = generateToken({
      id: user._id,
      role: user.role,
    });

    res.status(201).json(
      apiResponse(201, "User registered successfully", {
        token,
        user: {
          fullName,
          email,
          mobile,
          role,
        },
      }),
    );
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    console.log("Login request:");
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = generateToken({
      id: user._id,
      role: user.role,
    });

    res.status(200).json(
      apiResponse(200, "Login successful", {
        token,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
        },
      }),
    );
  } catch (error) {
    next(error);
  }
};

const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const otp = generateOTP();

    user.otp = otp;

    user.otpExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail(
      email,
      "CampusPass - Email Verification OTP",
      `
  <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
    
    <div style="max-width:520px; margin:auto; background:#ffffff; padding:25px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.08);">
      
      <h2 style="text-align:center; color:#1f2937;">
        CampusPass Verification
      </h2>

      <p style="font-size:15px; color:#374151;">
        Hello,
      </p>

      <p style="font-size:15px; color:#4b5563;">
        Use the OTP below to verify your email address and activate your account.
      </p>

      <div style="text-align:center; margin:25px 0;">
        <div style="
          display:inline-block;
          font-size:26px;
          letter-spacing:6px;
          font-weight:bold;
          background:#f3f4f6;
          padding:12px 22px;
          border-radius:8px;
          color:#111827;
        ">
          ${otp}
        </div>
      </div>

      <p style="font-size:14px; color:#6b7280;">
        This OTP is valid for <b>10 minutes</b>. Do not share it with anyone.
      </p>

      <div style="margin-top:20px; padding-top:15px; border-top:1px solid #e5e7eb;">
        <p style="font-size:12px; color:#9ca3af; text-align:center;">
          If you did not request this verification, please ignore this email.
        </p>
      </div>

    </div>
  </div>
  `
    );

    res.status(200).json(apiResponse(200, "OTP sent successfully"));
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      throw new ApiError(400, "Invalid or expired OTP");
    }

    user.isVerified = true;

    user.otp = null;

    user.otpExpiry = null;

    await user.save();

    res.status(200).json(apiResponse(200, "OTP verified successfully"));
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const otp = generateOTP();

    user.otp = otp;

    user.otpExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail(
      email,
      "Reset Password OTP - CampusPass",
      `
  <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
    
    <div style="max-width:500px; margin:auto; background:#ffffff; padding:25px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      
      <h2 style="color:#2c3e50; text-align:center;">CampusPass</h2>
      
      <p style="font-size:16px; color:#333;">
        Hello,
      </p>

      <p style="font-size:15px; color:#555;">
        We received a request to reset your password. Use the OTP below to proceed:
      </p>

      <div style="text-align:center; margin:25px 0;">
        <span style="
          display:inline-block;
          font-size:24px;
          letter-spacing:5px;
          font-weight:bold;
          background:#f1f1f1;
          padding:12px 20px;
          border-radius:8px;
          color:#2c3e50;
        ">
          ${otp}
        </span>
      </div>

      <p style="font-size:14px; color:#777;">
        This OTP is valid for <b>10 minutes</b>. Do not share it with anyone.
      </p>

      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />

      <p style="font-size:12px; color:#999; text-align:center;">
        If you did not request this, you can ignore this email.
      </p>

    </div>
  </div>
  `
    );

    res.status(200).json(apiResponse(200, "Password reset OTP sent"));
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      throw new ApiError(400, "Invalid OTP");
    }

    user.password = await bcrypt.hash(password, 10);

    user.otp = null;

    user.otpExpiry = null;

    await user.save();

    res.status(200).json(apiResponse(200, "Password reset successful"));
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");


    res.status(200).json(apiResponse(200, "User fetched successfully", user));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};
