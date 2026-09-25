import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Sun, Moon, ChevronDown } from "lucide-react";

import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import api from "../../api/axios";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import Logo from "../../components/Logo";
import { loginSuccess } from "../../redux/authSlice";
import { useTheme } from "../../utils/ThemeContext";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isDark, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.mobile || !form.password) {
      return toast.error("Please fill all required fields");
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", form);

      const { token, user } = response.data.data;

      localStorage.setItem("token", token);

      dispatch(
        loginSuccess({
          token,
          user,
        })
      );

      toast.success("Account created successfully!");

      navigate("/home", {
        replace: true,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
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
        <div className="absolute right-10 bottom-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 mx-auto max-w-sm space-y-6">
          <div className="rounded-3xl border border-border bg-background/60 p-8 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Join CampusPass</p>

            <h2 className="mt-3 text-3xl font-extrabold leading-tight">Create Your Digital Campus Pass</h2>

            <div className="mt-6 space-y-3 rounded-2xl bg-surface p-4 border border-border text-xs text-text-muted">
              <p className="flex items-center gap-2 font-semibold">
                <span className="text-primary">✓</span>
                Instant QR Code Pass Generation
              </p>

              <p className="flex items-center gap-2 font-semibold">
                <span className="text-primary">✓</span>
                Real-Time Schedule Alerts
              </p>

              <p className="flex items-center gap-2 font-semibold">
                <span className="text-primary">✓</span>
                Connect With Campus Events
              </p>
            </div>
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

            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold sm:text-4xl">Create Account</h1>

              <p className="text-sm text-text-muted">Join students and organizers managing campus events.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Full Name"
                name="fullName"
                placeholder="Aman Singh"
                value={form.fullName}
                onChange={handleChange}
                icon={User}
              />

              <InputField
                label="Email Address"
                name="email"
                type="email"
                placeholder="aman@gmail.com"
                value={form.email}
                onChange={handleChange}
                icon={Mail}
              />

              <InputField
                label="Mobile Number"
                name="mobile"
                placeholder="9876543210"
                value={form.mobile}
                onChange={handleChange}
                icon={Phone}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-text">Account Type</label>
                <div className="relative">
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="student" className="bg-background text-text">
                      Student
                    </option>
                    <option value="organizer" className="bg-background text-text">
                      Organizer
                    </option>
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

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

              <Button type="submit" loading={loading}>
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight size={16} />
                </span>
              </Button>
            </form>

            <div className="text-center text-sm text-text-muted">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
