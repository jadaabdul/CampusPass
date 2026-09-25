import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import Navbar from '../components/Navbar';
import { useTheme } from '../utils/ThemeContext';

const MainLayout = ({ children, showNavbar = true }) => {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {showNavbar && <Navbar />}
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
  content: {
    flex: 1,
  },
});

export default MainLayout;
