import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../../api/axios';
import { loginSuccess } from '../../redux/authSlice';
import { useTheme } from '../../utils/ThemeContext';
import Logo from '../../components/Logo';

const Login = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      return Alert.alert("Error", "Please enter email and password");
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/login", form);
      const { token, user } = response.data.data;

      await AsyncStorage.setItem("token", token);
      dispatch(loginSuccess({ token, user }));
    } catch (error) {
      Alert.alert("Login Failed", error.response?.data?.message || "Check your credentials.");
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
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Sign in to manage your bookings and explore campus events.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="student@college.edu"
                placeholderTextColor={theme.colors.textMuted}
                value={form.email}
                onChangeText={(val) => handleChange('email', val)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textMuted}
                value={form.password}
                onChangeText={(val) => handleChange('password', val)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={18} color={theme.colors.textMuted} /> : <Eye size={18} color={theme.colors.textMuted} />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.forgotBtnText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.surface} size="small" />
            ) : (
              <View style={styles.submitBtnContent}>
                <Text style={styles.submitBtnText}>Sign In to Account</Text>
                <ArrowRight size={16} color={theme.colors.surface} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace("Register")}>
            <Text style={styles.footerLink}>Create Account</Text>
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
      marginBottom: 36,
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
    forgotBtn: {
      alignSelf: 'flex-end',
      marginTop: -4,
    },
    forgotBtnText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.primary,
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
    footerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 32,
    },
    footerText: {
      color: theme.colors.textMuted,
      fontSize: 14,
    },
    footerLink: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: 'bold',
    },
  });

export default Login;
