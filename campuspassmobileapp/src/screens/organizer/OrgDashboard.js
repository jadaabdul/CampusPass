import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ClipboardList, PlusCircle, Users, IndianRupee, Ticket, ArrowRight, ScanLine, BarChart2 } from 'lucide-react-native';

import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import EventCard from '../../components/EventCard';
import EmptyState from '../../components/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../utils/ThemeContext';

const OrgDashboard = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, eventsRes] = await Promise.all([
        api.get("/organizer/dashboard"),
        api.get("/events/organizer/my-events")
      ]);
      setStats(statsRes.data.data);
      setEvents(eventsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching organizer dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        <PageHeader
          breadcrumb="ORGANIZER CONTROL CENTER"
          title="Organizer Dashboard"
          subtitle="Manage your campus event registrations, monitor seat bookings, and issue passes."
          action={
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => navigation.navigate("CreateEvent")}
            >
              <PlusCircle size={18} color={theme.colors.surface} />
              <Text style={styles.headerActionText}>Create New Event</Text>
            </TouchableOpacity>
          }
        />

        <View style={styles.statsGrid}>
          <StatCard
            title="My Organized Events"
            value={stats.totalEvents}
            icon={ClipboardList}
            color="#3b82f6"
            loading={loading}
          />
          <StatCard
            title="Total Tickets Reserved"
            value={stats.totalBookings}
            icon={Ticket}
            color="#8b5cf6"
            loading={loading}
          />
          <StatCard
            title="Estimated Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={IndianRupee}
            color="#10b981"
            loading={loading}
          />
        </View>

        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionCard} 
            onPress={() => navigation.navigate("OrganizerAnalytics")}
          >
            <View style={styles.quickActionContent}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <BarChart2 size={22} color="#34d399" />
              </View>
              <View style={styles.quickActionTextContainer}>
                <Text style={styles.quickActionTitle}>Revenue Analytics</Text>
                <Text style={styles.quickActionSubtitle}>Earnings, fees & seat occupancy</Text>
              </View>
            </View>
            <ArrowRight size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard} 
            onPress={() => navigation.navigate("CreateEvent")}
          >
            <View style={styles.quickActionContent}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <PlusCircle size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.quickActionTextContainer}>
                <Text style={styles.quickActionTitle}>Host New Event</Text>
                <Text style={styles.quickActionSubtitle}>Add dates, tickets & venue</Text>
              </View>
            </View>
            <ArrowRight size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard} 
            onPress={() => navigation.navigate("Attendees")}
          >
            <View style={styles.quickActionContent}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                <Users size={22} color="#c084fc" />
              </View>
              <View style={styles.quickActionTextContainer}>
                <Text style={styles.quickActionTitle}>Attendee List</Text>
                <Text style={styles.quickActionSubtitle}>Check registrations & status</Text>
              </View>
            </View>
            <ArrowRight size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionCard} 
            onPress={() => navigation.navigate("QRScanPage")}
          >
            <View style={styles.quickActionContent}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <ScanLine size={22} color="#fbbf24" />
              </View>
              <View style={styles.quickActionTextContainer}>
                <Text style={styles.quickActionTitle}>Scan QR Passes</Text>
                <Text style={styles.quickActionSubtitle}>Validate student entrance tickets</Text>
              </View>
            </View>
            <ArrowRight size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <Text style={styles.sectionTitle}>Your Active & Upcoming Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ManageEvents")}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator animating={true} size="large" color={theme.colors.primary} style={{ marginVertical: 32 }} />
          ) : events.length === 0 ? (
            <EmptyState 
              title="No events created yet" 
              subtitle="Start hosting events for your campus community today!"
              buttonText="Create Your First Event"
              onPress={() => navigation.navigate("CreateEvent")}
            />
          ) : (
            <View style={styles.eventList}>
              {events.slice(0, 5).map((event) => (
                <EventCard 
                  key={event._id || event.id} 
                  event={event}
                  onPress={() => navigation.navigate("EventDetails", { id: event._id || event.id })}
                />
              ))}
            </View>
          )}
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
    contentContainer: {
      padding: 16,
      paddingBottom: 40,
      gap: 24,
    },
    headerActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 14,
      gap: 8,
    },
    headerActionText: {
      color: theme.colors.surface,
      fontWeight: 'bold',
      fontSize: 13,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    quickActionsGrid: {
      gap: 12,
    },
    quickActionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
    },
    quickActionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      flex: 1,
    },
    iconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickActionTextContainer: {
      flex: 1,
    },
    quickActionTitle: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: 'bold',
    },
    quickActionSubtitle: {
      color: theme.colors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    eventsSection: {
      gap: 16,
    },
    eventsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    seeAllText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: 'bold',
    },
    eventList: {
      gap: 16,
    },
  });

export default OrgDashboard;
