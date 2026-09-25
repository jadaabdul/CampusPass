import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const RevenueChart = ({
  monthlyData = [],
  weeklyData = [],
  organizerData = [],
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const formattedMonthly = monthlyData.map((d) => ({
    name: `${MONTHS[(d._id?.month || 1) - 1]} ${d._id?.year || ''}`,
    revenue: d.revenue || 0,
    count: d.count || 0,
  }));

  const formattedWeekly = weeklyData.map((d) => ({
    name: `W${d._id?.week || 1} ${d._id?.year || ''}`,
    revenue: d.revenue || 0,
  }));

  const maxMonthlyRevenue = Math.max(...formattedMonthly.map((m) => m.revenue), 1000);
  const maxWeeklyRevenue = Math.max(...formattedWeekly.map((w) => w.revenue), 1000);

  return (
    <View style={styles.container}>
      {/* Monthly Revenue Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Revenue</Text>
        
        {formattedMonthly.length === 0 ? (
          <Text style={styles.emptyText}>No monthly revenue data</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScroll}>
            {formattedMonthly.map((item, i) => {
              const barHeight = Math.max(12, Math.min(140, (item.revenue / maxMonthlyRevenue) * 140));
              return (
                <View key={i} style={styles.barColumn}>
                  <Text style={styles.barValue}>{fmt(item.revenue)}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: barHeight }]} />
                  </View>
                  <Text style={styles.barLabel}>{item.name}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Weekly Revenue Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Revenue</Text>

        {formattedWeekly.length === 0 ? (
          <Text style={styles.emptyText}>No weekly revenue data</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScroll}>
            {formattedWeekly.map((item, i) => {
              const barHeight = Math.max(12, Math.min(120, (item.revenue / maxWeeklyRevenue) * 120));
              return (
                <View key={i} style={styles.barColumn}>
                  <Text style={styles.barValue}>{fmt(item.revenue)}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFillSecondary, { height: barHeight }]} />
                  </View>
                  <Text style={styles.barLabel}>{item.name}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Revenue by Organizer Section */}
      {organizerData.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Revenue by Organizer</Text>
          <View style={styles.organizerList}>
            {organizerData.slice(0, 5).map((org, index) => {
              const gross = org.totalRevenue || 0;
              const earnings = org.organizerEarnings || 0;
              const commission = org.platformCommission || 0;
              
              return (
                <View key={org.organizerId || index} style={styles.organizerRow}>
                  <View style={styles.organizerInfo}>
                    <Text style={styles.orgName}>{org.organizerName || "Organizer"}</Text>
                    <Text style={styles.orgGross}>Gross: {fmt(gross)}</Text>
                  </View>

                  <View style={styles.organizerBreakdown}>
                    <View style={styles.badgeSuccess}>
                      <Text style={styles.badgeTextSuccess}>Net: {fmt(earnings)}</Text>
                    </View>
                    <View style={styles.badgePrimary}>
                      <Text style={styles.badgeTextPrimary}>Fee: {fmt(commission)}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
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
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 16,
    },
    emptyText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      textAlign: 'center',
      paddingVertical: 20,
    },
    chartScroll: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 20,
      paddingTop: 20,
      paddingBottom: 4,
    },
    barColumn: {
      alignItems: 'center',
      gap: 6,
      width: 60,
    },
    barValue: {
      color: theme.colors.textMuted,
      fontSize: 9,
      fontWeight: '600',
    },
    barTrack: {
      height: 140,
      width: 14,
      backgroundColor: theme.colors.border,
      borderRadius: 7,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    barFill: {
      width: '100%',
      backgroundColor: '#10b981',
      borderRadius: 7,
    },
    barFillSecondary: {
      width: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 7,
    },
    barLabel: {
      color: theme.colors.text,
      fontSize: 10,
      fontWeight: 'bold',
    },
    organizerList: {
      gap: 12,
    },
    organizerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    organizerInfo: {
      flex: 1,
    },
    orgName: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: 'bold',
    },
    orgGross: {
      color: theme.colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    organizerBreakdown: {
      flexDirection: 'row',
      gap: 6,
    },
    badgeSuccess: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.2)',
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    badgeTextSuccess: {
      color: '#34d399',
      fontSize: 10,
      fontWeight: 'bold',
    },
    badgePrimary: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.2)',
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    badgeTextPrimary: {
      color: theme.colors.primary,
      fontSize: 10,
      fontWeight: 'bold',
    },
  });

export default RevenueChart;
