import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Bell } from 'lucide-react-native';
import { fetchUnreadCount } from '../redux/notificationSlice';

const NotificationBell = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { unreadCount } = useSelector((state) => state.notification);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, user]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Notifications')}
    >
      <Bell size={24} color="#ffffff" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    height: 18,
    minWidth: 18,
    borderRadius: 9,
    backgroundColor: '#f43f5e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#12121a',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  }
});

export default NotificationBell;
