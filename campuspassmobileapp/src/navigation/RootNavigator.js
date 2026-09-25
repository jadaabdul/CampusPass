import React from 'react';
import { useSelector } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Navigators
import StudentTabs from './StudentTabs';
import OrganizerTabs from './OrganizerTabs';
import AdminTabs from './AdminTabs';

// Landing & Guest Screens
import Splash from '../screens/landing/Splash';
import About from '../screens/landing/About';
import Contact from '../screens/landing/Contact';

// Auth Screens
import Welcome from '../screens/auth/Welcome';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import ForgotPassword from '../screens/auth/ForgotPassword';
import ResetPassword from '../screens/auth/ResetPassword';

// Shared Screens
import EventDetail from '../screens/shared/EventDetail';
import EventMap from '../screens/shared/EventMap';
import ETicket from '../screens/shared/ETicket';
import Notifications from '../screens/shared/Notifications';
import Profile from '../screens/shared/Profile';

// Student Screens
import BrowseEvents from '../screens/student/BrowseEvents';
import BookTickets from '../screens/student/BookTickets';
import Payment from '../screens/student/Payment';
import MyBookings from '../screens/student/MyBookings';
import Favorites from '../screens/student/Favorites';

// Organizer Screens
import OrganizerAnalytics from '../screens/organizer/OrganizerAnalytics';
import CreateEvent from '../screens/organizer/CreateEvent';
import ManageEvents from '../screens/organizer/ManageEvents';
import Attendees from '../screens/organizer/Attendees';
import QRScanPage from '../screens/organizer/QRScanPage';

// Admin Screens
import AdminAnalytics from '../screens/admin/AdminAnalytics';
import ManageAllEvents from '../screens/admin/ManageAllEvents';
import ManageUsers from '../screens/admin/ManageUsers';
import UserDetails from '../screens/admin/UserDetails';
import ManageCategories from '../screens/admin/ManageCategories';
import AddCategory from '../screens/admin/AddCategory';
import ManageVenues from '../screens/admin/ManageVenues';
import CreateVenue from '../screens/admin/CreateVenue';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Welcome" component={Welcome} />
    <Stack.Screen name="Splash" component={Splash} />
    <Stack.Screen name="About" component={About} />
    <Stack.Screen name="Contact" component={Contact} />
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
    <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    <Stack.Screen name="ResetPassword" component={ResetPassword} />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminTabs" component={AdminTabs} />
    <Stack.Screen name="AdminAnalytics" component={AdminAnalytics} />
    <Stack.Screen name="ManageAllEvents" component={ManageAllEvents} />
    <Stack.Screen name="ManageUsers" component={ManageUsers} />
    <Stack.Screen name="UserDetails" component={UserDetails} />
    <Stack.Screen name="ManageCategories" component={ManageCategories} />
    <Stack.Screen name="AddCategory" component={AddCategory} />
    <Stack.Screen name="ManageVenues" component={ManageVenues} />
    <Stack.Screen name="CreateVenue" component={CreateVenue} />
    <Stack.Screen name="QRScanPage" component={QRScanPage} />
    <Stack.Screen name="QRScan" component={QRScanPage} />
    <Stack.Screen name="EventDetails" component={EventDetail} />
    <Stack.Screen name="EventDetail" component={EventDetail} />
    <Stack.Screen name="Notifications" component={Notifications} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="About" component={About} />
    <Stack.Screen name="Contact" component={Contact} />
  </Stack.Navigator>
);

const OrganizerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OrganizerTabs" component={OrganizerTabs} />
    <Stack.Screen name="OrganizerAnalytics" component={OrganizerAnalytics} />
    <Stack.Screen name="CreateEvent" component={CreateEvent} />
    <Stack.Screen name="ManageEvents" component={ManageEvents} />
    <Stack.Screen name="Attendees" component={Attendees} />
    <Stack.Screen name="QRScanPage" component={QRScanPage} />
    <Stack.Screen name="QRScan" component={QRScanPage} />
    <Stack.Screen name="EventDetails" component={EventDetail} />
    <Stack.Screen name="EventDetail" component={EventDetail} />
    <Stack.Screen name="Notifications" component={Notifications} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="About" component={About} />
    <Stack.Screen name="Contact" component={Contact} />
  </Stack.Navigator>
);

const StudentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentTabs" component={StudentTabs} />
    <Stack.Screen name="BrowseEvents" component={BrowseEvents} />
    <Stack.Screen name="MyBookings" component={MyBookings} />
    <Stack.Screen name="Favorites" component={Favorites} />
    <Stack.Screen name="EventDetails" component={EventDetail} />
    <Stack.Screen name="EventDetail" component={EventDetail} />
    <Stack.Screen name="BookTickets" component={BookTickets} />
    <Stack.Screen name="Payment" component={Payment} />
    <Stack.Screen name="ETicket" component={ETicket} />
    <Stack.Screen name="EventMap" component={EventMap} />
    <Stack.Screen name="QRScanPage" component={QRScanPage} />
    <Stack.Screen name="QRScan" component={QRScanPage} />
    <Stack.Screen name="Notifications" component={Notifications} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="About" component={About} />
    <Stack.Screen name="Contact" component={Contact} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { user, token } = useSelector((state) => state.auth);

  if (!user || !token) {
    return <AuthStack />;
  }

  if (user.role === 'admin') {
    return <AdminStack />;
  }

  if (user.role === 'organizer') {
    return <OrganizerStack />;
  }

  return <StudentStack />;
};

export default RootNavigator;
