import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  icon: Icon,
  error,
  keyboardType = "default",
  autoCapitalize = "none"
}) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputContainer}>
        {Icon && (
          <View style={styles.iconContainer}>
            <Icon size={18} color="#6b7280" />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            Icon && styles.inputWithIcon,
            error && styles.inputError,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6b7280"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#d1d5db',
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#18181f',
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 44,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    marginTop: 4,
    fontSize: 14,
    color: '#ef4444',
  },
});

export default InputField;
