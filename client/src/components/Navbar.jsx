import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, Sun, Moon } from "lucide-react";
import Logo from "./Logo";
import { useTheme } from "../utils/ThemeContext";
import Button from "./Button";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const linkClass = ({ isActive }) =>
    `rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
      isActive ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-surface-secondary hover:text-text"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-surface/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
        <NavLink to="/" onClick={() => setIsOpen(false)}>
          <Logo />
        </NavLink>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>

          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>

          <div className="ml-4 flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition-all hover:scale-105 hover:bg-surface"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => navigate("/login")}
              className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold transition-all hover:border-primary hover:text-primary"
            >
              Sign In
            </button>

            <button
              onClick={() => navigate("/register")}
              className="group flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Get Started
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden border-t border-border bg-surface transition-all duration-300 md:hidden ${isOpen ? "max-h-96 py-5" : "max-h-0 py-0"}`}
      >
        <nav className="flex flex-col gap-5 px-6">
          <NavLink to="/" className={linkClass} onClick={() => setIsOpen(false)}>
            Home
          </NavLink>

          <NavLink to="/about" className={linkClass} onClick={() => setIsOpen(false)}>
            About
          </NavLink>

          <NavLink to="/contact" className={linkClass} onClick={() => setIsOpen(false)}>
            Contact
          </NavLink>

          <Button
            onClick={() => navigate("/login")}
            className="w-auto border border-border bg-surface text-text shadow-none px-5 py-2.5 hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            Sign In
          </Button>

          <Button onClick={() => navigate("/register")} className="group w-auto px-5 py-2.5">
            <span>Get Started</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
