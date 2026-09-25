import {
  Home,
  Search,
  Calendar,
  Heart,
  User,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Users,
  ScanLine,
  Tag,
  Bell,
  Building2,
  BarChart2,
} from "lucide-react";

export const STUDENT_NAV_LINKS = [
  {
    label: "Home",
    path: "/home",
    icon: Home,
  },
  {
    label: "Browse Events",
    path: "/browse",
    icon: Search,
  },
  {
    label: "My Bookings",
    path: "/bookings",
    icon: Calendar,
  },
  {
    label: "Favorites",
    path: "/favorites",
    icon: Heart,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: User,
  },
];

export const ORGANIZER_NAV_LINKS = [
  {
    label: "Dashboard",
    path: "/organizer/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Analytics",
    path: "/organizer/analytics",
    icon: BarChart2,
  },
  {
    label: "Manage Events",
    path: "/organizer/events",
    icon: ClipboardList,
  },
  {
    label: "Create Event",
    path: "/organizer/create",
    icon: PlusCircle,
  },
  {
    label: "Attendees",
    path: "/organizer/attendees",
    icon: Users,
  },
  {
    label: "QR Scanner",
    path: "/organizer/scan/demo",
    icon: ScanLine,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: User,
  },
];

export const ADMIN_NAV_LINKS = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Analytics",
    path: "/admin/analytics",
    icon: BarChart2,
  },
  {
    label: "All Events",
    path: "/admin/events",
    icon: ClipboardList,
  },
  {
    label: "Venues",
    path: "/admin/venues",
    icon: Building2,
  },
  {
    label: "Categories",
    path: "/admin/categories",
    icon: Tag,
  },
  {
    label: "Users Management",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: User,
  },
];

export const getNavLinksByRole = (role) => {
  switch (role) {
    case "admin":
      return ADMIN_NAV_LINKS;
    case "organizer":
      return ORGANIZER_NAV_LINKS;
    case "student":
    default:
      return STUDENT_NAV_LINKS;
  }
};

export const getHomeRouteByRole = (role) => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "organizer":
      return "/organizer/dashboard";
    case "student":
    default:
      return "/home";
  }
};
