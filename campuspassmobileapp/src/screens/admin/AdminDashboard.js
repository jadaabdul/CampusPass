import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Users, Building2, CalendarDays, IndianRupee, Ticket, ArrowRight, ShieldCheck, Tag, BarChart2 } from 'lucide-react-native';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../utils/ThemeContext';

const quickActions = [
  {
    id: 0,
    icon: BarChart2,
    label: "Revenue & Analytics",
    desc: "Detailed financial reports & commission splits",
    path: "AdminAnalytics",
    color: "#10b981",
  },
  {
    id: 1,
    icon: CalendarDays,
    label: "Manage All Events",
    desc: "Approve, publish, reject or delete events",
    path: "ManageAllEvents",
    color: "#4f46e5",
  },
  {
    id: 2,
    icon: Users,
    label: "Manage Users",
    desc: "Inspect, block or unblock system users",
    path: "ManageUsers",
    color: "#d946ef",
  },
  {
    id: 3,
    icon: Building2,
    label: "Campus Venues",
    desc: "Add or edit university venue locations",
    path: "ManageVenues",
    color: "#14b8a6",
  },
  {
    id: 4,
    icon: Tag,
    label: "Event Categories",
    desc: "Configure event category tags",
    path: "ManageCategories",
    color: "#f59e0b",
  },
];

const AdminDashboard = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizers: 0,
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard");
      const data = res.data.data;

      setStats({
        ...data,
        totalUsers: data.totalUsers > 0 ? data.totalUsers - 1 : 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboard} tintColor={theme.colors.primary} />}
      >
        <PageHeader
          breadcrumb="SYSTEM ADMINISTRATION"
          title="Admin Control Overview"
          subtitle="Executive dashboard for university event management, organizer oversight, and revenue statistics."
        />

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="#06b6d4"
            loading={loading}
          />
          <StatCard
            title="Organizers"
            value={stats.totalOrganizers}
            icon={Building2}
            color="#f97316"
            loading={loading}
          />
          <StatCard
            title="All Events"
            value={stats.totalEvents}
            icon={CalendarDays}
            color="#ec4899"
            loading={loading}
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Ticket}
            color="#8b5cf6"
            loading={loading}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={IndianRupee}
            color="#10b981"
            loading={loading}
          />
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Administrative Actions</Text>

          <View style={styles.actionsGrid}>
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.actionCard}
                  onPress={() => navigation.navigate(item.path)}
                  activeOpacity={0.7}
                >
                  <View style={styles.actionHeader}>
                    <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                      <Icon color={item.color} size={24} />
                    </View>
                    <ArrowRight color={theme.colors.textMuted} size={16} />
                  </View>
                  
                  <Text style={styles.actionTitle}>{item.label}</Text>
                  <Text style={styles.actionDesc}>{item.desc}</Text>
                </TouchableOpacity>
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
    contentContainer: {
      padding: 16,
      paddingBottom: 40,
      gap: 24,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'space-between',
    },
    actionsSection: {
      gap: 16,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    actionsGrid: {
      gap: 12,
    },
    actionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 18,
      gap: 12,
    },
    actionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    iconBox: {
      padding: 10,
      borderRadius: 14,
    },
    actionTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    actionDesc: {
      color: theme.colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
    },
  });

export default AdminDashboard;
