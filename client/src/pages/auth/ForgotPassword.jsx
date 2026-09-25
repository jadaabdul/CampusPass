import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import Logo from "../../components/Logo";
import { useTheme } from "../../utils/ThemeContext";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const { isDark, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your registered email");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/forgot-password", {
        email,
      });

      toast.success("Verification code sent to your email!");

      navigate("/reset-password", {
        state: {
          email,
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong sending reset code.");
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

        <div className="relative z-10 mx-auto max-w-sm space-y-6">
          <div className="rounded-3xl border border-border bg-background/60 p-8 shadow-xl backdrop-blur-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">SECURITY & ACCESS</span>

            <h2 className="mt-2 text-3xl font-extrabold">Account Recovery</h2>

            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              We'll send a verification OTP to your registered email address to safely reset your password.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold text-text-muted">Secure Verification</p>

              <p className="mt-1 text-sm font-bold">OTP Based Password Reset</p>
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
            <h1 className="text-3xl font-extrabold sm:text-4xl">Forgot Password?</h1>

            <p className="text-sm text-text-muted">Enter your email address to receive an OTP verification code.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
            />

            <Button type="submit" loading={loading}>
              <span className="flex items-center justify-center gap-2">
                Send Verification OTP
                <ArrowRight size={16} />
              </span>
            </Button>
          </form>

          <div className="text-center text-sm text-text-muted">
            Remembered your password?{" "}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
