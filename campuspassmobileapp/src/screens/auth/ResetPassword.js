import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Lock, KeyRound, Eye, EyeOff, CheckCircle } from 'lucide-react-native';

import api from '../../api/axios';
import { useTheme } from '../../utils/ThemeContext';
import Logo from '../../components/Logo';

const ResetPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const initialEmail = route.params?.email || "";

  const [form, setForm] = useState({
    email: initialEmail,
    resetToken: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.email || !form.resetToken || !form.newPassword) {
      return Alert.alert("Error", "Please fill in email, reset token, and new password");
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/reset-password", form);
      Alert.alert("Success", res.data?.message || "Password reset successful!");
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Reset Failed", error.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Logo />
          <Text style={styles.headerTitle}>Reset Password</Text>
          <Text style={styles.headerSubtitle}>Enter the reset code sent to your email and your new password.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reset Code / Token</Text>
            <View style={styles.inputWrapper}>
              <KeyRound size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter reset token"
                placeholderTextColor={theme.colors.textMuted}
                value={form.resetToken}
                onChangeText={(val) => handleChange('resetToken', val)}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textMuted}
                value={form.newPassword}
                onChangeText={(val) => handleChange('newPassword', val)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={18} color={theme.colors.textMuted} /> : <Eye size={18} color={theme.colors.textMuted} />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.surface} size="small" />
            ) : (
              <View style={styles.submitBtnContent}>
                <Text style={styles.submitBtnText}>Confirm New Password</Text>
                <CheckCircle size={16} color={theme.colors.surface} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    headerContainer: {
      marginBottom: 32,
      gap: 10,
    },
    headerTitle: {
      fontSize: 30,
      fontWeight: '900',
      color: theme.colors.text,
      marginTop: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.textMuted,
      lineHeight: 20,
    },
    formContainer: {
      gap: 20,
    },
    inputGroup: {
      gap: 8,
    },
    label: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 14,
    },
    eyeBtn: {
      padding: 8,
    },
    submitBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    submitBtnDisabled: {
      opacity: 0.6,
    },
    submitBtnContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    submitBtnText: {
      color: theme.colors.surface,
      fontSize: 14,
      fontWeight: 'bold',
    },
  });

export default ResetPassword;
