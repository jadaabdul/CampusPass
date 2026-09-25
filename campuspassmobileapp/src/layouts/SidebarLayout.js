import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Sun, Moon, LogOut } from 'lucide-react-native';

import api from '../api/axios';
import { logout } from '../redux/authSlice';
import Logo from '../components/Logo';
import NotificationBell from '../components/NotificationBell';
import { getInitials } from '../utils/formatters';
import { useTheme } from '../utils/ThemeContext';

const SidebarLayout = ({ children, title }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);

  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    if (typeof imageData === "string") {
      if (imageData.startsWith("http://") || imageData.startsWith("https://") || imageData.startsWith("data:")) {
        return imageData;
      }
      return `${api.defaults.baseURL}/${imageData.replace(/^\//, "")}`;
    }
    if (typeof imageData === "object") {
      if (imageData.url) return getImageUrl(imageData.url);
      if (imageData.secure_url) return imageData.secure_url;
      if (imageData.path) return getImageUrl(imageData.path);
    }
    return null;
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const initials = getInitials(user?.fullName);
  const avatarUrl = getImageUrl(user?.profileImage);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header Bar */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.headerLeft}>
          <Logo />
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.iconBtn, { borderColor: theme.colors.border }]} 
            onPress={toggleTheme}
          >
            {isDark ? <Sun size={18} color={theme.colors.text} /> : <Moon size={18} color={theme.colors.text} />}
          </TouchableOpacity>

          <NotificationBell />

          <TouchableOpacity 
            style={[styles.avatarBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Profile')}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: theme.colors.surface }]}>{initials}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content View */}
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '900',
  },
  content: {
    flex: 1,
  },
});

export default SidebarLayout;
