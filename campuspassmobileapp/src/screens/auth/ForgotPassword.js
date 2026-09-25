import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, ArrowLeft, Send } from 'lucide-react-native';

import api from '../../api/axios';
import { useTheme } from '../../utils/ThemeContext';
import Logo from '../../components/Logo';

const ForgotPassword = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      return Alert.alert("Error", "Please enter your registered email address");
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/forgot-password", { email });
      Alert.alert("Success", res.data?.message || "Reset code sent to your email!");
      navigation.navigate("ResetPassword", { email });
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Something went wrong.");
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={18} color={theme.colors.textMuted} />
          <Text style={styles.backBtnText}>Back to Sign In</Text>
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Logo />
          <Text style={styles.headerTitle}>Forgot Password?</Text>
          <Text style={styles.headerSubtitle}>Enter your registered email address and we'll send you instructions to reset your password.</Text>
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
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
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
                <Text style={styles.submitBtnText}>Send Reset Instructions</Text>
                <Send size={16} color={theme.colors.surface} />
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
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 24,
    },
    backBtnText: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: 'bold',
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

export default ForgotPassword;
