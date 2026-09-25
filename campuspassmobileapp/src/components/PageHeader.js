import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PageHeader = ({ title, subtitle, action, breadcrumb }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          dispatch(logout());
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerTopRow}>
        <View style={styles.textContainer}>
          {breadcrumb ? (
            <Text style={styles.breadcrumb}>{breadcrumb}</Text>
          ) : null}
          <Text style={styles.title}>{title}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}

      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 24,
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
  },
  breadcrumb: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#60a5fa',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: '#ffffff',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#9ca3af',
  },
  actionContainer: {
    marginTop: 16,
  },
});

export default PageHeader;
