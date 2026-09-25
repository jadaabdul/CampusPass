import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, Building2, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { useTheme } from '../utils/ThemeContext';

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const CommissionCard = ({
  totalRevenue = 0,
  platformCommission = 0,
  organizerPayouts = 0,
  pendingPayouts = 0,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const platformPct =
    totalRevenue > 0
      ? ((platformCommission / totalRevenue) * 100).toFixed(1)
      : 0;
  const organizerPct =
    totalRevenue > 0 ? ((organizerPayouts / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <TrendingUp size={20} color="#10b981" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.subtitle}>Commission Overview</Text>
          <Text style={styles.title}>{fmt(totalRevenue)} Total Revenue</Text>
        </View>
      </View>

      {/* Visual Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${Math.min(100, Math.max(0, organizerPct))}%` }]} />
      </View>

      {/* Grid Stats */}
      <View style={styles.grid}>
        {/* Platform */}
        <View style={styles.platformBox}>
          <View style={styles.boxHeader}>
            <Text style={styles.platformLabel}>Platform (20%)</Text>
            <ArrowUpRight size={14} color={theme.colors.primary} />
          </View>
          <Text style={styles.amountText}>{fmt(platformCommission)}</Text>
          <Text style={styles.platformSub}>{platformPct}% of total revenue</Text>
        </View>

        {/* Organizer */}
        <View style={styles.organizerBox}>
          <View style={styles.boxHeader}>
            <Text style={styles.organizerLabel}>Organizer (80%)</Text>
            <Building2 size={14} color="#34d399" />
          </View>
          <Text style={styles.amountText}>{fmt(organizerPayouts)}</Text>
          <Text style={styles.organizerSub}>{organizerPct}% of total revenue</Text>
        </View>
      </View>

      {/* Pending Payouts */}
      {pendingPayouts > 0 && (
        <View style={styles.pendingBox}>
          <ArrowDownRight size={16} color="#fbbf24" />
          <Text style={styles.pendingText}>
            {fmt(pendingPayouts)} pending organizer payouts
          </Text>
        </View>
      )}
    </View>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
      gap: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 16,
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: {
      flex: 1,
    },
    subtitle: {
      color: theme.colors.textMuted,
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    title: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '900',
    },
    progressTrack: {
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.border,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#10b981',
      borderRadius: 5,
    },
    grid: {
      flexDirection: 'row',
      gap: 12,
    },
    platformBox: {
      flex: 1,
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.2)',
      borderRadius: 16,
      padding: 14,
    },
    organizerBox: {
      flex: 1,
      backgroundColor: 'rgba(16, 185, 129, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.2)',
      borderRadius: 16,
      padding: 14,
    },
    boxHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    platformLabel: {
      color: theme.colors.primary,
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    organizerLabel: {
      color: '#34d399',
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    amountText: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '900',
      marginTop: 6,
    },
    platformSub: {
      color: theme.colors.primary,
      fontSize: 10,
      marginTop: 2,
    },
    organizerSub: {
      color: '#34d399',
      fontSize: 10,
      marginTop: 2,
    },
    pendingBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(245, 158, 11, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.2)',
      borderRadius: 16,
      padding: 12,
    },
    pendingText: {
      color: '#fcd34d',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });

export default CommissionCard;
