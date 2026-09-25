import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, ClipboardList, Building2, Tag, Users } from 'lucide-react-native';
import { useTheme } from '../utils/ThemeContext';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import ManageAllEvents from '../screens/admin/ManageAllEvents';
import ManageVenues from '../screens/admin/ManageVenues';
import ManageCategories from '../screens/admin/ManageCategories';
import ManageUsers from '../screens/admin/ManageUsers';

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
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
        name="AdminDashboard" 
        component={AdminDashboard} 
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="ManageAllEvents" 
        component={ManageAllEvents} 
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="ManageVenues" 
        component={ManageVenues} 
        options={{
          title: 'Venues',
          tabBarIcon: ({ color, size }) => <Building2 color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="ManageCategories" 
        component={ManageCategories} 
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => <Tag color={color} size={size} />
        }} 
      />
      <Tab.Screen 
        name="ManageUsers" 
        component={ManageUsers} 
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />
        }} 
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;
