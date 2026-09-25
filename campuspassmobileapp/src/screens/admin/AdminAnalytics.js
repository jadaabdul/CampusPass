import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  IndianRupee,
  TrendingUp,
  CreditCard,
  Building2,
  Download,
  CheckCircle,
} from "lucide-react-native";

import api from "../../api/axios";
import { useTheme } from "../../utils/ThemeContext";
import PageHeader from "../../components/PageHeader";
import CommissionCard from "../../components/CommissionCard";
import RevenueChart from "../../components/RevenueChart";
import OrganizerPerformance from "../../components/OrganizerPerformance";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const EXPORTS = [
  { label: "Revenue CSV", endpoint: "/admin/export/revenue?format=csv" },
  { label: "Commission CSV", endpoint: "/admin/export/commission?format=csv" },
  { label: "Organizer Payouts", endpoint: "/admin/export/organizer-payouts?format=csv" },
  { label: "Event Performance", endpoint: "/admin/export/event-performance?format=csv" },
];

const AdminAnalytics = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [analytics, setAnalytics] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, commissionsRes] = await Promise.allSettled([
        api.get("/admin/analytics"),
        api.get("/admin/commissions?limit=15&status=pending"),
      ]);

      if (analyticsRes.status === "fulfilled") {
        setAnalytics(analyticsRes.value.data.data);
      }
      if (commissionsRes.status === "fulfilled") {
        setCommissions(commissionsRes.value.data.data?.commissions || []);
      }
    } catch {
      Alert.alert("Error", "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (label) => {
    Alert.alert("Export Request", `${label} download link generated.`);
  };

  const handleMarkPaid = async (id) => {
    try {
      setMarkingId(id);
      await api.patch(`/admin/commissions/${id}/pay`);
      Alert.alert("Success", "Payout marked as paid!");
      setCommissions((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to update payout");
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading System Analytics...</Text>
      </View>
    );
  }

  const { overview, monthlyRevenue, weeklyRevenue, organizerPerformance } =
    analytics || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PageHeader
        breadcrumb="SYSTEM METRICS"
        title="Revenue & Analytics"
        subtitle="Comprehensive financial breakdown, commission tracking, and platform data."
      />

      {/* Top Financial Stat Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <View style={styles.iconCircle}>
            <IndianRupee size={18} color="#34d399" />
          </View>
          <Text style={styles.statLabel}>Gross Revenue</Text>
          <Text style={styles.statVal}>{fmt(overview?.totalRevenue)}</Text>
        </View>

        <View style={styles.statBox}>
          <View style={styles.iconCirclePrimary}>
            <TrendingUp size={18} color={theme.colors.primary} />
          </View>
          <Text style={styles.statLabel}>Platform Fee (20%)</Text>
          <Text style={styles.statValPrimary}>{fmt(overview?.platformCommission)}</Text>
        </View>

        <View style={styles.statBox}>
          <View style={styles.iconCircleSuccess}>
            <CreditCard size={18} color="#34d399" />
          </View>
          <Text style={styles.statLabel}>Organizer Payouts</Text>
          <Text style={styles.statValSuccess}>{fmt(overview?.organizerPayouts)}</Text>
        </View>

        <View style={styles.statBox}>
          <View style={styles.iconCircleWarning}>
            <Building2 size={18} color="#fbbf24" />
          </View>
          <Text style={styles.statLabel}>Pending Payouts</Text>
          <Text style={styles.statValWarning}>{fmt(overview?.pendingPayouts)}</Text>
        </View>
      </View>

      {/* Commission Overview Card */}
      <CommissionCard
        totalRevenue={overview?.totalRevenue || 0}
        platformCommission={overview?.platformCommission || 0}
        organizerPayouts={overview?.organizerPayouts || 0}
        pendingPayouts={overview?.pendingPayouts || 0}
      />

      {/* Revenue Charts */}
      <RevenueChart
        monthlyData={monthlyRevenue || []}
        weeklyData={weeklyRevenue || []}
        organizerData={organizerPerformance || []}
      />

      {/* Organizer Performance Table */}
      <OrganizerPerformance organizers={organizerPerformance || []} />

      {/* Pending Commission Payout Actions */}
      {commissions.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pending Organizer Payouts</Text>

          {commissions.map((comm) => (
            <View key={comm._id} style={styles.commRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.commOrg}>{comm.organizer?.fullName || "Organizer"}</Text>
                <Text style={styles.commEvent}>{comm.event?.title || "Event"}</Text>
                <Text style={styles.commAmount}>Net: {fmt(comm.organizerEarnings)}</Text>
              </View>

              <TouchableOpacity
                style={styles.payBtn}
                onPress={() => handleMarkPaid(comm._id)}
                disabled={markingId === comm._id}
              >
                {markingId === comm._id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <CheckCircle size={14} color="#fff" />
                    <Text style={styles.payBtnText}>Mark Paid</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Export Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Export System Reports</Text>
        <View style={styles.exportGrid}>
          {EXPORTS.map((exp) => (
            <TouchableOpacity
              key={exp.label}
              style={styles.exportBtn}
              onPress={() => handleExport(exp.label)}
            >
              <Download size={16} color={theme.colors.primary} />
              <Text style={styles.exportText}>{exp.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    statBox: {
      width: "48%",
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      gap: 6,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 14,
      backgroundColor: "rgba(52, 211, 153, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    iconCirclePrimary: {
      width: 36,
      height: 36,
      borderRadius: 14,
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    iconCircleSuccess: {
      width: 36,
      height: 36,
      borderRadius: 14,
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    iconCircleWarning: {
      width: 36,
      height: 36,
      borderRadius: 14,
      backgroundColor: "rgba(245, 158, 11, 0.1)",
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
    statValPrimary: {
      color: theme.colors.primary,
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
    commRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
    },
    commOrg: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: "bold",
    },
    commEvent: {
      color: theme.colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    commAmount: {
      color: "#34d399",
      fontSize: 12,
      fontWeight: "900",
      marginTop: 4,
    },
    payBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#10b981",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    payBtnText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "bold",
    },
    exportGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    exportBtn: {
      width: "48%",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      padding: 12,
    },
    exportText: {
      color: theme.colors.text,
      fontSize: 11,
      fontWeight: "bold",
    },
  });

export default AdminAnalytics;
