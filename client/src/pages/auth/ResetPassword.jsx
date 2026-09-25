import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowRight, Sun, Moon } from "lucide-react";

import toast from "react-hot-toast";

import api from "../../api/axios";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import Logo from "../../components/Logo";
import { useTheme } from "../../utils/ThemeContext";

const ResetPassword = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const { isDark, toggleTheme } = useTheme();

  const emailFromState = location.state?.email || "";

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: emailFromState,
    otp: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.otp || !form.password) {
      toast.error("Please fill in email, OTP, and new password");

      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", form);

      toast.success("Password reset successfully! Please sign in.");

      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-text">
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition hover:scale-105 hover:bg-surface"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-border bg-surface p-12 lg:flex">
        <div className="absolute -left-20 top-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 mx-auto max-w-sm">
          <div className="rounded-3xl border border-border bg-background/60 p-8 shadow-xl backdrop-blur-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">VERIFICATION</span>

            <h2 className="mt-2 text-3xl font-extrabold">Set New Password</h2>

            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              Enter the OTP verification code received in your email and create a new secure password.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold text-text-muted">Secure Reset</p>

              <p className="mt-1 text-sm font-bold">OTP Protected Account Recovery</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-text-muted">
          © {new Date().getFullYear()} CampusPass Platform. All rights reserved.
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold sm:text-4xl">Reset Password</h1>

            <p className="text-sm text-text-muted">Verify your OTP and choose a new password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@college.edu"
              icon={Mail}
            />

            <InputField
              label="OTP Code"
              name="otp"
              type="text"
              value={form.otp}
              onChange={handleChange}
              placeholder="Enter 6-digit OTP"
              icon={KeyRound}
            />

            <div className="relative">
              <InputField
                label="New Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={Lock}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10 text-text-muted hover:text-primary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button type="submit" loading={loading}>
              <span className="flex items-center justify-center gap-2">
                Update Password
                <ArrowRight size={16} />
              </span>
            </Button>
          </form>

          <div className="text-center text-sm text-text-muted">
            Remembered password?{" "}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
