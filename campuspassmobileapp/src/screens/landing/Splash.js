import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Sparkles, Calendar, Ticket, ShieldCheck, ArrowRight } from 'lucide-react-native';

import Logo from '../../components/Logo';
import { useTheme } from '../../utils/ThemeContext';

const Splash = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const features = [
    {
      icon: Calendar,
      title: "Discover Campus Events",
      desc: "Browse workshops, hackathons, sports, cultural festivals, and seminars happening across campus.",
    },
    {
      icon: Ticket,
      title: "Instant QR Passes",
      desc: "Reserve your seat in seconds and receive a secure digital QR pass instantly.",
    },
    {
      icon: ShieldCheck,
      title: "Organizer Control",
      desc: "Manage registrations, verify attendees, and monitor your events from one place.",
    },
    {
      icon: Sparkles,
      title: "Real-Time Updates",
      desc: "Receive notifications about schedule changes, announcements, and reminders.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <Logo size="large" />

          <View style={styles.badge}>
            <Sparkles size={14} color={theme.colors.primary} />
            <Text style={styles.badgeText}>Campus Event Management</Text>
          </View>

          <Text style={styles.mainTitle}>
            Discover & Experience {"\n"}
            <Text style={{ color: theme.colors.primary }}>Campus Life</Text>
          </Text>

          <Text style={styles.subtitle}>
            CampusPass makes discovering events, booking tickets, generating QR passes, and managing registrations simple for students and organizers.
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.primaryBtnText}>Explore Events</Text>
              <ArrowRight size={18} color={theme.colors.surface} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.secondaryBtnText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose CampusPass?</Text>
          <View style={styles.featureGrid}>
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <View key={idx} style={styles.featureCard}>
                  <View style={styles.iconCircle}>
                    <Icon size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDesc}>{item.desc}</Text>
                </View>
              );
            })}
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
      gap: 32,
    },
    heroSection: {
      alignItems: 'center',
      gap: 16,
      marginTop: 20,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.2)',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    badgeText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: 'bold',
    },
    mainTitle: {
      color: theme.colors.text,
      fontSize: 32,
      fontWeight: '900',
      textAlign: 'center',
      lineHeight: 40,
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 22,
    },
    buttonGroup: {
      width: '100%',
      gap: 12,
      marginTop: 12,
    },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      gap: 8,
    },
    primaryBtnText: {
      color: theme.colors.surface,
      fontSize: 16,
      fontWeight: 'bold',
    },
    secondaryBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      paddingVertical: 16,
    },
    secondaryBtnText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    featuresSection: {
      gap: 16,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    featureGrid: {
      gap: 12,
    },
    featureCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 18,
      gap: 8,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    featureDesc: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
  });

export default Splash;
