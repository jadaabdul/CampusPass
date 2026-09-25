import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import api from "../../api/axios";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import Logo from "../../components/Logo";
import { loginSuccess } from "../../redux/authSlice";
import { useTheme } from "../../utils/ThemeContext";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
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

    if (!form.email || !form.password) {
      return toast.error("Please enter email and password");
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", form);

      const { token, user } = response.data.data;

      localStorage.setItem("token", token);

      dispatch(
        loginSuccess({
          token,
          user,
        })
      );

      toast.success(`Welcome back, ${user.fullName}!`);

      const routes = {
        admin: "/admin/dashboard",
        organizer: "/organizer/dashboard",
        student: "/home",
      };

      navigate(routes[user.role] || "/", {
        replace: true,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Check your credentials.");
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
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 mx-auto max-w-sm space-y-6">
          <div className="rounded-3xl border border-border bg-background/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Official Event Pass</p>
                <h3 className="mt-1 text-2xl font-extrabold">Annual TechFest 2026</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                🎟️
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-surface p-4 border border-border">
              <p className="text-[10px] font-semibold uppercase text-text-muted">Access Role</p>
              <p className="text-sm font-bold">Verified Student Pass</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Confirmed
              </span>
              <span className="font-mono text-xs text-text-muted">#CP-2026-X9</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <span className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-text-muted">
              ✨ 1-Click Ticket Booking
            </span>
            <span className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-text-muted">
              ⚡ Instant QR Pass
            </span>
          </div>
        </div>

        <div className="relative z-10 text-xs text-text-muted">
          © {new Date().getFullYear()} CampusPass Platform. All rights reserved.
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 py-8 sm:px-12">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden flex justify-center">
              <Logo />
            </div>

            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl font-extrabold sm:text-4xl">Welcome Back</h1>
              <p className="text-sm text-text-muted">Sign in to manage your bookings and explore campus events.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Email Address"
                name="email"
                type="email"
                placeholder="student@college.edu"
                value={form.email}
                onChange={handleChange}
                icon={Mail}
              />

              <div className="relative">
                <InputField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
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

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <Button type="submit" loading={loading}>
                <span className="flex items-center gap-2">
                  Sign In to Account
                  <ArrowRight size={16} />
                </span>
              </Button>
            </form>

            <div className="text-center text-sm text-text-muted">
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-primary hover:underline">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
