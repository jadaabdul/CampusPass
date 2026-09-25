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
} from "lucide-react-native";

export const STUDENT_NAV_LINKS = [
  {
    label: "Home",
    screen: "StudentHome",
    icon: Home,
  },
  {
    label: "Browse Events",
    screen: "BrowseEvents",
    icon: Search,
  },
  {
    label: "My Bookings",
    screen: "MyBookings",
    icon: Calendar,
  },
  {
    label: "Favorites",
    screen: "Favorites",
    icon: Heart,
  },
  {
    label: "Profile",
    screen: "Profile",
    icon: User,
  },
];

export const ORGANIZER_NAV_LINKS = [
  {
    label: "Dashboard",
    screen: "OrgDashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Analytics",
    screen: "OrganizerAnalytics",
    icon: BarChart2,
  },
  {
    label: "Manage Events",
    screen: "ManageEvents",
    icon: ClipboardList,
  },
  {
    label: "Create Event",
    screen: "CreateEvent",
    icon: PlusCircle,
  },
  {
    label: "Attendees",
    screen: "Attendees",
    icon: Users,
  },
  {
    label: "QR Scanner",
    screen: "QRScanPage",
    icon: ScanLine,
  },
  {
    label: "Notifications",
    screen: "Notifications",
    icon: Bell,
  },
  {
    label: "Profile",
    screen: "Profile",
    icon: User,
  },
];

export const ADMIN_NAV_LINKS = [
  {
    label: "Dashboard",
    screen: "AdminDashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Analytics",
    screen: "AdminAnalytics",
    icon: BarChart2,
  },
  {
    label: "All Events",
    screen: "ManageEventsAdmin",
    icon: ClipboardList,
  },
  {
    label: "Venues",
    screen: "ManageVenues",
    icon: Building2,
  },
  {
    label: "Categories",
    screen: "ManageCategories",
    icon: Tag,
  },
  {
    label: "Users Management",
    screen: "ManageUsers",
    icon: Users,
  },
  {
    label: "Notifications",
    screen: "Notifications",
    icon: Bell,
  },
  {
    label: "Profile",
    screen: "Profile",
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
      return "AdminTabs";
    case "organizer":
      return "OrganizerTabs";
    case "student":
    default:
      return "StudentTabs";
  }
};
