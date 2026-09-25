import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, Phone, MapPin, Send, ArrowLeft } from 'lucide-react-native';

import api from '../../api/axios';
import { useTheme } from '../../utils/ThemeContext';
import PageHeader from '../../components/PageHeader';

const Contact = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/contact", formData);
      if (res.data.success) {
        Alert.alert("Success", "Thank you! Your message has been received.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={16} color={theme.colors.textMuted} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        <PageHeader
          breadcrumb="GET IN TOUCH"
          title="Contact Support"
          subtitle="Have questions about event hosting or registrations? Reach out to our campus team."
        />

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Aman Singh"
              placeholderTextColor={theme.colors.textMuted}
              value={formData.name}
              onChangeText={(val) => setFormData({ ...formData, name: val })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="aman@gmail.com"
              placeholderTextColor={theme.colors.textMuted}
              value={formData.email}
              onChangeText={(val) => setFormData({ ...formData, email: val })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Inquiry about event pass"
              placeholderTextColor={theme.colors.textMuted}
              value={formData.subject}
              onChangeText={(val) => setFormData({ ...formData, subject: val })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="How can we help you?"
              placeholderTextColor={theme.colors.textMuted}
              value={formData.message}
              onChangeText={(val) => setFormData({ ...formData, message: val })}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.surface} size="small" />
            ) : (
              <>
                <Send size={16} color={theme.colors.surface} />
                <Text style={styles.submitBtnText}>Send Message</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Mail size={18} color={theme.colors.primary} />
            <Text style={styles.infoText}>chandan7953@gmail.com</Text>
          </View>
          <View style={styles.infoRow}>
            <Phone size={18} color={theme.colors.primary} />
            <Text style={styles.infoText}>+91 98765 43210</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={18} color={theme.colors.primary} />
            <Text style={styles.infoText}>University Student Hub, Campus Center</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
      gap: 20,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
    },
    backBtnText: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: 'bold',
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
      gap: 16,
    },
    inputGroup: {
      gap: 6,
    },
    label: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
    input: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: theme.colors.text,
      fontSize: 14,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      gap: 8,
      marginTop: 6,
    },
    submitBtnText: {
      color: theme.colors.surface,
      fontSize: 14,
      fontWeight: 'bold',
    },
    disabledBtn: {
      opacity: 0.6,
    },
    infoCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
      gap: 14,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    infoText: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: 'bold',
    },
  });

export default Contact;
