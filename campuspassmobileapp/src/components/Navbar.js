import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

// On mobile, routing is handled by Navigation (Bottom Tabs, Stacks), 
// so this component acts as a Top Header on screens rather than a true Navbar
const Navbar = ({ showBell = true }) => {
  return (
    <View style={styles.header}>
      <Logo />
      {showBell && (
        <View style={styles.actions}>
          <NotificationBell />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(10, 10, 15, 0.8)', // #0A0A0F
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});

export default Navbar;
