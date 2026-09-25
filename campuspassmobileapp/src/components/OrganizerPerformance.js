import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const OrganizerPerformance = ({ organizers = [] }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  if (!organizers.length) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No organizer revenue data yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Organizer Performance</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: 140 }]}>Organizer</Text>
            <Text style={[styles.th, { width: 60 }]}>Events</Text>
            <Text style={[styles.th, { width: 100 }]}>Gross Rev</Text>
            <Text style={[styles.th, { width: 100 }]}>Platform Fee</Text>
            <Text style={[styles.th, { width: 100 }]}>Net Earnings</Text>
          </View>

          {/* Table Body */}
          {organizers.map((org, index) => (
            <View 
              key={org.organizerId || index} 
              style={[styles.tableRow, index === organizers.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={{ width: 140 }}>
                <Text style={styles.orgName} numberOfLines={1}>
                  {org.organizerName || "N/A"}
                </Text>
                <Text style={styles.orgEmail} numberOfLines={1}>
                  {org.organizerEmail || ""}
                </Text>
              </View>
              <Text style={[styles.tdText, { width: 60 }]}>{org.eventCount || 0}</Text>
              <Text style={[styles.tdBold, { width: 100 }]}>{fmt(org.totalRevenue)}</Text>
              <Text style={[styles.tdPrimary, { width: 100 }]}>{fmt(org.platformCommission)}</Text>
              <Text style={[styles.tdSuccess, { width: 100 }]}>{fmt(org.organizerEarnings)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
      overflow: 'hidden',
    },
    emptyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 24,
      alignItems: 'center',
    },
    emptyText: {
      color: theme.colors.textMuted,
      fontSize: 12,
    },
    header: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    title: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    table: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingVertical: 10,
    },
    th: {
      color: theme.colors.textMuted,
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.05)',
      paddingVertical: 12,
    },
    orgName: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
    orgEmail: {
      color: theme.colors.textMuted,
      fontSize: 10,
    },
    tdText: {
      color: theme.colors.textMuted,
      fontSize: 12,
    },
    tdBold: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
    tdPrimary: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: 'bold',
    },
    tdSuccess: {
      color: '#34d399',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });

export default OrganizerPerformance;
