import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home as HomeIcon, Search, Calendar, Heart, User } from 'lucide-react-native';
import { useTheme } from '../utils/ThemeContext';

// Student Screens
import Home from '../screens/student/Home';
import BrowseEvents from '../screens/student/BrowseEvents';
import MyBookings from '../screens/student/MyBookings';
import Favorites from '../screens/student/Favorites';
import Profile from '../screens/shared/Profile';

const Tab = createBottomTabNavigator();

const StudentTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.colors.background, shadowColor: 'transparent', elevation: 0 },
        headerTintColor: theme.colors.text,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopWidth: 1, borderColor: theme.colors.border },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={Home} 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="BrowseEvents" 
        component={BrowseEvents} 
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="MyBookings" 
        component={MyBookings} 
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="Favorites" 
        component={Favorites} 
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile} 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }} 
      />
    </Tab.Navigator>
  );
};

export default StudentTabs;
