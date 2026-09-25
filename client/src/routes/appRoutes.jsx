import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import SidebarLayout from "../layouts/SidebarLayout";

// Route Guards
import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";

// Landing Pages
import Splash from "../pages/landing/Splash";
import About from "../pages/landing/About";
import Contact from "../pages/landing/Contact";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Shared Pages
import EventDetail from "../pages/shared/EventDetail";
import EventMap from "../pages/shared/EventMap";
import ETicket from "../pages/shared/ETicket";
import Notifications from "../pages/shared/Notifications";
import Profile from "../pages/shared/Profile";

// Student Pages
import Home from "../pages/student/Home";
import BrowseEvents from "../pages/student/BrowseEvents";
import BookTickets from "../pages/student/BookTickets";
import Payment from "../pages/student/Payment";
import MyBookings from "../pages/student/MyBookings";
import Favorites from "../pages/student/Favorites";

// Organizer Pages
import OrgDashboard from "../pages/organizer/OrgDashboard";
import CreateEvent from "../pages/organizer/CreateEvent";
import ManageEvents from "../pages/organizer/ManageEvents";
import Attendees from "../pages/organizer/Attendees";
import QRScanPage from "../pages/organizer/QRScanPage";
import OrganizerAnalytics from "../pages/organizer/OrganizerAnalytics";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import ManageAllEvents from "../pages/admin/ManageAllEvents";
import ManageUsers from "../pages/admin/ManageUsers";
import UserDetails from "../pages/admin/UserDetails";
import ManageCategories from "../pages/admin/ManageCategories";
import AddCategory from "../pages/admin/AddCategory";
import ManageVenues from "../pages/admin/ManageVenues";
import CreateVenue from "../pages/admin/CreateVenue";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Guest Routes */}
      <Route element={<GuestRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Splash />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Shared Protected Pages */}
      <Route element={<ProtectedRoute />}>
        <Route element={<SidebarLayout />}>
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/event/:id/map" element={<EventMap />} />
          <Route path="/ticket/:bookingId" element={<ETicket />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Student Routes */}
      <Route element={<ProtectedRoute role="student" />}>
        <Route element={<SidebarLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/browse" element={<BrowseEvents />} />
          <Route path="/browse/event/:id" element={<EventDetail />} />
          <Route path="/event/:id/book" element={<BookTickets />} />
          <Route path="/payment/:bookingId" element={<Payment />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/favorites" element={<Favorites />} />
        </Route>
      </Route>

      {/* Organizer Routes */}
      <Route element={<ProtectedRoute role="organizer" />}>
        <Route element={<SidebarLayout />}>
          <Route path="/organizer/dashboard" element={<OrgDashboard />} />
          <Route path="/organizer/analytics" element={<OrganizerAnalytics />} />
          <Route path="/organizer/create" element={<CreateEvent />} />
          <Route path="/organizer/events" element={<ManageEvents />} />
          <Route path="/organizer/events/:id" element={<EventDetail />} />
          <Route path="/organizer/events/edit/:eventId" element={<CreateEvent />} />
          <Route path="/organizer/attendees" element={<Attendees />} />
          <Route path="/organizer/attendees/:eventId" element={<Attendees />} />
          <Route path="/organizer/scan/demo" element={<QRScanPage />} />
          <Route path="/organizer/scan/:eventId" element={<QRScanPage />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<SidebarLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/events" element={<ManageAllEvents />} />
          <Route path="/admin/events/:id" element={<EventDetail />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/users/:id" element={<UserDetails />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
          <Route path="/admin/categories/add" element={<AddCategory />} />
          <Route path="/admin/categories/edit/:id" element={<AddCategory />} />
          <Route path="/admin/venues" element={<ManageVenues />} />
          <Route path="/admin/venues/add" element={<CreateVenue />} />
          <Route path="/admin/venues/edit/:id" element={<CreateVenue />} />
        </Route>
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
