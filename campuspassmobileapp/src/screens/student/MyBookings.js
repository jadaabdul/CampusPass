import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar, Ticket, MapPin, QrCode, CreditCard, XCircle } from 'lucide-react-native';
import api from '../../api/axios';

import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../utils/ThemeContext';

const MyBookings = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings/my-bookings");
      setBookings(res.data.data || []);
    } catch (error) {
      Alert.alert("Error", "Failed to load your event passes");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    return (b.bookingStatus || "").toLowerCase() === activeTab;
  });

  const counts = bookings.reduce(
    (acc, b) => {
      const s = (b.bookingStatus || "pending").toLowerCase();
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {}
  );

  const TABS = [
    { key: "all", label: `All Passes (${bookings.length})` },
    { key: "pending", label: `Pending (${counts.pending || 0})` },
    { key: "confirmed", label: `Confirmed (${counts.confirmed || 0})` },
    { key: "cancelled", label: `Cancelled (${counts.cancelled || 0})` },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PageHeader
          breadcrumb="MY DIGITAL PASSES"
          title="My Bookings"
          subtitle="Manage your reserved event passes and access QR codes."
        />

        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : filteredBookings.length === 0 ? (
          <View style={{ marginTop: 24 }}>
            <EmptyState
              title="No Bookings Found"
              description="You haven't reserved any event tickets in this category yet."
              icon={Ticket}
              action={
                <TouchableOpacity
                  style={styles.browseBtn}
                  onPress={() => navigation.navigate("BrowseEvents")}
                >
                  <Text style={styles.browseBtnText}>Browse Events Now</Text>
                </TouchableOpacity>
              }
            />
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {filteredBookings.map((booking) => {
              const event = booking.eventId || {};
              const isPaid = booking.paymentStatus === "paid";
              const isConfirmed = booking.bookingStatus === "confirmed";
              const isCancelled = booking.bookingStatus === "cancelled";
              const isPending = booking.bookingStatus === "pending";

              return (
                <View key={booking._id || booking.id} style={styles.bookingCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <StatusBadge status={booking.bookingStatus || "pending"} />
                      <Text style={styles.eventTitle} numberOfLines={1}>{event.title || "Campus Event"}</Text>
                    </View>
                    <View style={styles.seatBadge}>
                      <Text style={styles.seatBadgeText}>{booking.quantity || 1} Seat(s)</Text>
                    </View>
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <Calendar size={14} color={theme.colors.primary} />
                      <Text style={styles.detailText}>{formatDate(event.startDate)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MapPin size={14} color={theme.colors.primary} />
                      <Text style={styles.detailText} numberOfLines={1}>{event.venue?.name || "Campus Venue"}</Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.amountLabel}>{isPaid ? "PAID AMOUNT" : "AMOUNT DUE"}</Text>
                      <Text style={styles.amountValue}>{formatCurrency(booking.totalAmount || event.price)}</Text>
                    </View>

                    {isConfirmed && isPaid ? (
                      <TouchableOpacity
                        style={styles.actionBtnPrimary}
                        onPress={() => navigation.navigate("ETicket", { bookingId: booking._id || booking.id })}
                      >
                        <QrCode size={14} color={theme.colors.surface} />
                        <Text style={styles.actionBtnPrimaryText}>View Pass QR</Text>
                      </TouchableOpacity>
                    ) : isPending ? (
                      <TouchableOpacity
                        style={styles.actionBtnSuccess}
                        onPress={() => navigation.navigate("Payment", { bookingId: booking._id || booking.id })}
                      >
                        <CreditCard size={14} color="#fff" />
                        <Text style={styles.actionBtnSuccessText}>Pay Now</Text>
                      </TouchableOpacity>
                    ) : isCancelled ? (
                      <View style={styles.cancelledBadge}>
                        <XCircle size={14} color="#fb7185" />
                        <Text style={styles.cancelledText}>Cancelled</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.actionBtnPrimary}
                        onPress={() => navigation.navigate("ETicket", { bookingId: booking._id || booking.id })}
                      >
                        <QrCode size={14} color={theme.colors.surface} />
                        <Text style={styles.actionBtnPrimaryText}>View Pass</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    tabsScroll: {
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: 16,
      marginBottom: 16,
    },
    tabBtn: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tabBtnActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    tabText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: 'bold',
    },
    tabTextActive: {
      color: theme.colors.surface,
    },
    bookingsList: {
      gap: 16,
    },
    bookingCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
      gap: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    cardHeaderLeft: {
      flex: 1,
      alignItems: 'flex-start',
      gap: 8,
    },
    eventTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    seatBadge: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(59, 130, 246, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    seatBadgeText: {
      color: theme.colors.primary,
      fontSize: 10,
      fontWeight: 'bold',
    },
    cardDetails: {
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 12,
      gap: 8,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    detailText: {
      color: theme.colors.textMuted,
      fontSize: 12,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    amountLabel: {
      color: theme.colors.textMuted,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    amountValue: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '900',
      marginTop: 2,
    },
    actionBtnPrimary: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 16,
      gap: 6,
    },
    actionBtnPrimaryText: {
      color: theme.colors.surface,
      fontSize: 12,
      fontWeight: 'bold',
    },
    actionBtnSuccess: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#059669',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 16,
      gap: 6,
    },
    actionBtnSuccessText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    cancelledBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(244, 63, 94, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(244, 63, 94, 0.2)',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 16,
      gap: 6,
    },
    cancelledText: {
      color: '#fb7185',
      fontSize: 12,
      fontWeight: 'bold',
    },
    browseBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 16,
      marginTop: 16,
    },
    browseBtnText: {
      color: theme.colors.surface,
      fontWeight: 'bold',
    },
  });

export default MyBookings;
