import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Users, CalendarDays, Ticket, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react-native';

import { useTheme } from '../../utils/ThemeContext';
import PageHeader from '../../components/PageHeader';

const About = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const features = [
    {
      icon: CalendarDays,
      title: "Discover Campus Events",
      description: "Browse technical, cultural, sports, workshops, hackathons, and college festivals all from one portal.",
    },
    {
      icon: Ticket,
      title: "Instant Digital Passes",
      description: "Register in seconds and receive your verified digital E-Ticket with QR code directly on your profile.",
    },
    {
      icon: Users,
      title: "Student Chapter Network",
      description: "Connect with student organizations, clubs, and peers to collaborate on impactful events.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Verification",
      description: "Fast QR scanning for organizers with instant attendee check-in and anti-duplication protection.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={16} color={theme.colors.textMuted} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        <PageHeader
          breadcrumb="ABOUT CAMPUSPASS"
          title="Simple, Digital & Instant Campus Events"
          subtitle="CampusPass eliminates paper passes and queues for university students & organizers."
        />

        <View style={styles.sectionCard}>
          <Text style={styles.cardBadge}>OUR MISSION</Text>
          <Text style={styles.cardTitle}>Empowering Campus Communities</Text>
          <Text style={styles.cardBody}>
            We build modern digital experiences connecting students, club leads, and faculty administrators seamlessly across college events.
          </Text>
        </View>

        <View style={styles.featureGrid}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <View key={i} style={styles.featureCard}>
                <View style={styles.iconCircle}>
                  <Icon size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.description}</Text>
              </View>
            );
          })}
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
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
      gap: 8,
    },
    cardBadge: {
      color: theme.colors.primary,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '900',
    },
    cardBody: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 20,
    },
    featureGrid: {
      gap: 12,
    },
    featureCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      gap: 8,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureTitle: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: 'bold',
    },
    featureDesc: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
    },
  });

export default About;
