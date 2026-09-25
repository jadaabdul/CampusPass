import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

const Logo = () => {
  return (
    <View style={styles.container}>
      <Svg width="30" height="30" viewBox="0 0 64 64">
        <Rect width="64" height="64" rx="16" fill="#3b82f6" />
        <Rect
          x="8"
          y="12"
          width="48"
          height="40"
          rx="8"
          fill="none"
          stroke="white"
          strokeWidth="3"
        />
        <Rect
          x="16"
          y="18"
          width="32"
          height="10"
          rx="3"
          fill="white"
          opacity="0.4"
        />
        <Rect
          x="16"
          y="36"
          width="20"
          height="7"
          rx="2"
          fill="white"
          opacity="0.4"
        />
      </Svg>
      <Text style={styles.text}>CampusPass</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#ffffff',
    marginLeft: 12,
  },
});

export default Logo;
