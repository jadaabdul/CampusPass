import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const Button = ({
  children,
  loading = false,
  disabled = false,
  onPress,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" style={styles.loader} />
      ) : null}
      <Text style={[styles.text, textStyle]}>
        {loading ? 'Loading...' : children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#2563eb', // blue-600
    paddingVertical: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loader: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    color: '#ffffff',
    fontSize: 16,
  },
});

export default Button;
