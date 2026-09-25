import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  IndianRupee,
  Ticket,
  TrendingUp,
  CalendarDays,
  CheckCircle,
  Clock,
} from "lucide-react-native";

import api from "../../api/axios";
import { useTheme } from "../../utils/ThemeContext";
import PageHeader from "../../components/PageHeader";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const OrganizerAnalytics = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/analytics/organizer");
      setData(res.data.data);
    } catch {
      Alert.alert("Error", "Failed to load organizer analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  if (!data) return null;

  const { overview, monthlyTrends, eventPerformance } = data;

  const formattedTrends = (monthlyTrends || []).map((t) => ({
    name: `${MONTHS[(t._id?.month || 1) - 1]} ${t._id?.year || ''}`,
    revenue: t.revenue || 0,
    net: t.organizerEarnings || 0,
  }));

  const maxTrend = Math.max(...formattedTrends.map((t) => t.revenue), 1000);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PageHeader
        breadcrumb="ORGANIZER METRICS"
        title="Organizer Performance"
        subtitle="Track revenue, ticket sales, platform commissions, and event statistics."
      />

      {/* Overview Financial Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.iconWrapperSuccess}>
            <TrendingUp size={20} color="#34d399" />
          </View>
          <Text style={styles.statLabel}>Net Earnings (80%)</Text>
          <Text style={styles.statValSuccess}>{fmt(overview?.organizerEarnings)}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.iconWrapperPrimary}>
            <IndianRupee size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.statLabel}>Gross Revenue</Text>
          <Text style={styles.statVal}>{fmt(overview?.grossRevenue)}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.iconWrapperWarning}>
            <Clock size={20} color="#fbbf24" />
          </View>
          <Text style={styles.statLabel}>Platform Fee (20%)</Text>
          <Text style={styles.statValWarning}>{fmt(overview?.platformFee)}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.iconWrapperInfo}>
            <Ticket size={20} color="#60a5fa" />
          </View>
          <Text style={styles.statLabel}>Tickets Sold</Text>
          <Text style={styles.statValInfo}>{overview?.totalTicketsSold || 0}</Text>
        </View>
      </View>

      {/* Monthly Trends Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Revenue Trend</Text>

        {formattedTrends.length === 0 ? (
          <Text style={styles.emptyText}>No monthly trend data recorded</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScroll}>
            {formattedTrends.map((t, i) => {
              const barHeight = Math.max(12, Math.min(130, (t.revenue / maxTrend) * 130));
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barVal}>{fmt(t.revenue)}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: barHeight }]} />
                  </View>
                  <Text style={styles.barLabel}>{t.name}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Event Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Event Performance Breakdown</Text>

        {(eventPerformance || []).length === 0 ? (
          <Text style={styles.emptyText}>No event performance data available</Text>
        ) : (
          <View style={styles.eventList}>
            {eventPerformance.map((ev) => (
              <View key={ev.eventId} style={styles.eventRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {ev.eventTitle}
                  </Text>
                  <Text style={styles.eventTickets}>
                    {ev.bookedSeats} / {ev.capacity} seats ({ev.occupancyRate}% full)
                  </Text>
                </View>

                <View style={styles.eventRevBox}>
                  <Text style={styles.eventNet}>Net: {fmt(ev.organizerEarnings)}</Text>
                  <Text style={styles.eventGross}>Gross: {fmt(ev.totalRevenue)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
      gap: 20,
    },
    center: {
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      color: theme.colors.textMuted,
      fontSize: 14,
      marginTop: 12,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    statCard: {
      width: "48%",
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      gap: 6,
    },
    iconWrapperSuccess: {
      width: 36,
      height: 36,
      borderRadius: 14,
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrapperPrimary: {
      width: 36,
      height: 36,
      borderRadius: 14,
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrapperWarning: {
      width: 36,
      height: 36,
      borderRadius: 14,
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrapperInfo: {
      width: 36,
      height: 36,
      borderRadius: 14,
      backgroundColor: "rgba(96, 165, 250, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    statLabel: {
      color: theme.colors.textMuted,
      fontSize: 10,
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    statVal: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "900",
    },
    statValSuccess: {
      color: "#34d399",
      fontSize: 18,
      fontWeight: "900",
    },
    statValWarning: {
      color: "#fbbf24",
      fontSize: 18,
      fontWeight: "900",
    },
    statValInfo: {
      color: "#60a5fa",
      fontSize: 18,
      fontWeight: "900",
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
      gap: 14,
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    emptyText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      textAlign: "center",
      paddingVertical: 16,
    },
    chartScroll: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 18,
      paddingTop: 16,
      paddingBottom: 4,
    },
    barCol: {
      alignItems: "center",
      gap: 6,
      width: 60,
    },
    barVal: {
      color: theme.colors.textMuted,
      fontSize: 9,
      fontWeight: "600",
    },
    barTrack: {
      height: 130,
      width: 14,
      backgroundColor: theme.colors.border,
      borderRadius: 7,
      justifyContent: "flex-end",
      overflow: "hidden",
    },
    barFill: {
      width: "100%",
      backgroundColor: "#10b981",
      borderRadius: 7,
    },
    barLabel: {
      color: theme.colors.text,
      fontSize: 10,
      fontWeight: "bold",
    },
    eventList: {
      gap: 12,
    },
    eventRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
    },
    eventTitle: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: "bold",
    },
    eventTickets: {
      color: theme.colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    eventRevBox: {
      alignItems: "flex-end",
    },
    eventNet: {
      color: "#34d399",
      fontSize: 13,
      fontWeight: "900",
    },
    eventGross: {
      color: theme.colors.textMuted,
      fontSize: 10,
      marginTop: 2,
    },
  });

export default OrganizerAnalytics;
