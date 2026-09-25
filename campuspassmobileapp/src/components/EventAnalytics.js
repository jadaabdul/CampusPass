import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ticket, TrendingUp, Users } from 'lucide-react-native';
import api from '../api/axios';
import { useTheme } from '../utils/ThemeContext';

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const EventAnalytics = ({ eventId }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/analytics/event/${eventId}`);
        setData(res.data.data);
      } catch {
        // silently fail – analytics are supplementary
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [eventId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.colors.primary} size="small" />
      </View>
    );
  }

  if (!data) return null;

  const { event, bookings, revenue } = data;

  const stats = [
    {
      label: "Tickets Sold",
      value: bookings.ticketsSold,
      icon: Ticket,
      color: "#34d399",
      bg: "rgba(52, 211, 153, 0.1)",
    },
    {
      label: "Remaining",
      value: event.remainingSeats,
      icon: Users,
      color: "#60a5fa",
      bg: "rgba(96, 165, 250, 0.1)",
    },
    {
      label: "Gross Revenue",
      value: fmt(revenue.totalRevenue),
      icon: TrendingUp,
      color: theme.colors.text,
      bg: "rgba(255, 255, 255, 0.05)",
    },
    {
      label: "Organizer Earnings",
      value: fmt(revenue.organizerEarnings),
      icon: TrendingUp,
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.1)",
    },
  ];

  const fillPercent = event.capacity > 0
    ? Math.round((event.bookedSeats / event.capacity) * 100)
    : 0;

  return (
    <View style={styles.container}>
      {/* Stats Grid */}
      <View style={styles.grid}>
        {stats.map((s) => {
          const IconComponent = s.icon;
          return (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.iconWrapper, { backgroundColor: s.bg }]}>
                <IconComponent size={18} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Capacity Bar */}
      <View style={styles.capacityCard}>
        <View style={styles.capacityHeader}>
          <Text style={styles.capacityTitle}>Venue Occupancy</Text>
          <Text style={styles.capacityPercent}>{fillPercent}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.bar, { width: `${Math.min(100, Math.max(0, fillPercent))}%` }]} />
        </View>
        <View style={styles.capacityFooter}>
          <Text style={styles.capacityFooterText}>{event.bookedSeats} booked</Text>
          <Text style={styles.capacityFooterText}>{event.capacity} total capacity</Text>
        </View>
      </View>

      {/* Revenue Breakdown */}
      {revenue.totalRevenue > 0 && (
        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownBox}>
            <Text style={styles.breakdownLabel}>Gross Revenue</Text>
            <Text style={styles.breakdownValue}>{fmt(revenue.totalRevenue)}</Text>
          </View>
          <View style={styles.platformBox}>
            <Text style={styles.platformLabel}>Platform (20%)</Text>
            <Text style={styles.platformValue}>{fmt(revenue.platformCommission)}</Text>
          </View>
          <View style={styles.organizerBox}>
            <Text style={styles.organizerLabel}>Organizer (80%)</Text>
            <Text style={styles.organizerValue}>{fmt(revenue.organizerEarnings)}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      gap: 16,
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    statCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
    },
    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '900',
    },
    statLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    capacityCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      gap: 8,
    },
    capacityHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    capacityTitle: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: 'bold',
    },
    capacityPercent: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '900',
    },
    track: {
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
      overflow: 'hidden',
    },
    bar: {
      height: '100%',
      backgroundColor: '#10b981',
      borderRadius: 4,
    },
    capacityFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    capacityFooterText: {
      color: theme.colors.textMuted,
      fontSize: 10,
    },
    breakdownGrid: {
      flexDirection: 'row',
      gap: 8,
    },
    breakdownBox: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      padding: 10,
      alignItems: 'center',
    },
    platformBox: {
      flex: 1,
      backgroundColor: 'rgba(99, 102, 241, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(99, 102, 241, 0.2)',
      borderRadius: 14,
      padding: 10,
      alignItems: 'center',
    },
    organizerBox: {
      flex: 1,
      backgroundColor: 'rgba(16, 185, 129, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.2)',
      borderRadius: 14,
      padding: 10,
      alignItems: 'center',
    },
    breakdownLabel: {
      color: theme.colors.textMuted,
      fontSize: 9,
      fontWeight: '600',
    },
    breakdownValue: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: '900',
      marginTop: 2,
    },
    platformLabel: {
      color: '#818cf8',
      fontSize: 9,
      fontWeight: 'bold',
    },
    platformValue: {
      color: '#a5b4fc',
      fontSize: 12,
      fontWeight: '900',
      marginTop: 2,
    },
    organizerLabel: {
      color: '#34d399',
      fontSize: 9,
      fontWeight: 'bold',
    },
    organizerValue: {
      color: '#6ee7b7',
      fontSize: 12,
      fontWeight: '900',
      marginTop: 2,
    },
  });

export default EventAnalytics;
