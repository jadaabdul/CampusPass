import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Bell, Trash2, Calendar, CreditCard, Ticket, ShieldCheck, CheckCheck } from 'lucide-react-native';
import { useDispatch } from 'react-redux';

import api from '../../api/axios';
import { decrementUnreadCount, resetUnreadCount } from '../../redux/notificationSlice';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { useTheme } from '../../utils/ThemeContext';

const Notifications = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data.data || []);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.patch(`/notifications/${id}/read`);
      dispatch(decrementUnreadCount());
      fetchNotifications();
    } catch (error) {
      Alert.alert("Error", "Failed to update notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      dispatch(resetUnreadCount());
      Alert.alert("Success", "All notifications marked as read");
      fetchNotifications();
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      Alert.alert("Error", "Delete failed");
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteNotification(id) }
      ]
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case "booking": return Calendar;
      case "payment": return CreditCard;
      case "ticket": return Ticket;
      case "admin": return ShieldCheck;
      default: return Bell;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <PageHeader
              breadcrumb="COMMUNICATION CENTER"
              title="Notifications"
              subtitle="Stay informed on ticket reservations, venue updates, and announcements."
            />
          </View>
          {notifications.length > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead}>
              <CheckCheck size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={{ marginTop: 24 }}>
            <EmptyState
              title="No Notifications"
              description="You're all caught up! You will receive alerts when your tickets are confirmed or venue details change."
              icon={Bell}
            />
          </View>
        ) : (
          <View style={styles.listContainer}>
            {notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const isUnread = !notification.isRead;

              return (
                <TouchableOpacity
                  key={notification._id}
                  style={[styles.notificationCard, isUnread && styles.unreadCard]}
                  onPress={() => markAsRead(notification._id, notification.isRead)}
                >
                  <View style={styles.iconContainer}>
                    <Icon size={20} color={theme.colors.primary} />
                  </View>

                  <View style={styles.contentContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title}>{notification.title}</Text>
                      {isUnread && (
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>NEW</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.message}>{notification.message}</Text>
                    <Text style={styles.dateText}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => confirmDelete(notification._id)}
                  >
                    <Trash2 size={16} color="#fb7185" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    markAllBtn: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      padding: 12,
      marginTop: 8,
    },
    loadingContainer: {
      marginTop: 40,
      alignItems: 'center',
    },
    listContainer: {
      gap: 12,
      marginTop: 16,
    },
    notificationCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      gap: 12,
    },
    unreadCard: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentContainer: {
      flex: 1,
      gap: 4,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },
    title: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    newBadge: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.3)',
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    newBadgeText: {
      color: theme.colors.primary,
      fontSize: 8,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    message: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
    dateText: {
      color: theme.colors.textMuted,
      fontSize: 10,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      marginTop: 4,
    },
    deleteBtn: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: 'rgba(244, 113, 133, 0.1)',
    },
  });

export default Notifications;
