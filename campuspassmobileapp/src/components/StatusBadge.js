import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusStyle } from '../utils/formatters';

const StatusBadge = ({ status, style }) => {
  if (!status) return null;
  const styleClasses = getStatusStyle(status);

  return (
    <View style={[styles.badge, styleClasses.container, style]}>
      <View style={[styles.dot, { backgroundColor: styleClasses.text.color }]} />
      <Text style={[styles.text, styleClasses.text]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    marginRight: 6,
    opacity: 0.75,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'capitalize',
  },
});

export default StatusBadge;
