import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, ClipboardList, PlusCircle, Users, User } from 'lucide-react-native';
import { useTheme } from '../utils/ThemeContext';

// Organizer Screens
import OrgDashboard from '../screens/organizer/OrgDashboard';
import ManageEvents from '../screens/organizer/ManageEvents';
import CreateEvent from '../screens/organizer/CreateEvent';
import Attendees from '../screens/organizer/Attendees';
import Profile from '../screens/shared/Profile';

const Tab = createBottomTabNavigator();

const OrganizerTabs = () => {
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
        name="OrgDashboard" 
        component={OrgDashboard} 
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="ManageEvents" 
        component={ManageEvents} 
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="CreateEvent" 
        component={CreateEvent} 
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="Attendees" 
        component={Attendees} 
        options={{
          title: 'Attendees',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />
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

export default OrganizerTabs;
