import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, ArrowRight, Calendar, MapPin, Minus, Plus, ShieldCheck, Ticket } from 'lucide-react-native';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useTheme } from '../../utils/ThemeContext';

const BookTickets = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const { eventId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketId, setTicketId] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadBookingOptions = async () => {
      try {
        setLoading(true);
        const [eventResponse, ticketsResponse] = await Promise.all([
          api.get(`/events/${eventId}`),
          api.get(`/tickets/event/${eventId}`),
        ]);
        const availableTickets = (ticketsResponse.data.data || []).filter(
          (ticket) => ticket.status === "active" && ticket.remainingQuantity > 0
        );
        setEvent(eventResponse.data.data);
        setTickets(availableTickets);
        setTicketId(availableTickets[0]?._id || "");
      } catch (err) {
        Alert.alert("Error", "Failed to load booking options");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    if (eventId) {
      loadBookingOptions();
    }
  }, [eventId]);

  const selectedTicket = tickets.find((ticket) => ticket._id === ticketId);
  const maxQuantity = Math.min(5, selectedTicket?.remainingQuantity || 1);
  const total = (selectedTicket?.price || 0) * quantity;

  const selectTicket = (nextTicketId) => {
    setTicketId(nextTicketId);
    setQuantity(1);
  };

  const createBooking = async () => {
    if (!selectedTicket) return;
    try {
      setSubmitting(true);
      const response = await api.post("/bookings", { ticketId, quantity });
      const booking = response.data.data;

      if (booking.paymentStatus === "paid" || selectedTicket.price === 0) {
        Alert.alert("Success", "Pass Reserved Successfully!");
        navigation.replace("ETicket", { bookingId: booking._id || booking.id });
      } else {
        navigation.replace("Payment", { bookingId: booking._id || booking.id });
      }
    } catch (error) {
      Alert.alert("Booking Failed", error.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Ticket Tiers...</Text>
      </View>
    );
  }

  if (!event) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={16} color={theme.colors.textMuted} />
          <Text style={styles.backBtnText}>Back to Event</Text>
        </TouchableOpacity>

        <PageHeader
          breadcrumb="TICKET RESERVATION"
          title={`Select Passes — ${event.title}`}
          subtitle="Choose your ticket tier and quantity below."
        />

        <View style={styles.contentGrid}>
          <View style={styles.mainCard}>
            <Text style={styles.sectionTitle}>Available Ticket Tiers</Text>

            {tickets.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ticket size={24} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>No available ticket tiers for this event.</Text>
              </View>
            ) : (
              <View style={styles.tierList}>
                {tickets.map((t) => {
                  const isSelected = t._id === ticketId;
                  return (
                    <TouchableOpacity
                      key={t._id}
                      style={[styles.tierCard, isSelected && styles.tierCardSelected]}
                      onPress={() => selectTicket(t._id)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tierName}>{t.title || t.name || "General Pass"}</Text>
                        <Text style={styles.tierSeats}>{t.remainingQuantity} remaining</Text>
                      </View>
                      <Text style={styles.tierPrice}>{formatCurrency(t.price)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {selectedTicket && (
              <View style={styles.qtySection}>
                <Text style={styles.qtyTitle}>Quantity</Text>
                <View style={styles.qtyControls}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} color={theme.colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus size={16} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {selectedTicket && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Reservation Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tier</Text>
                <Text style={styles.summaryVal}>{selectedTicket.title || selectedTicket.name || "General Pass"}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quantity</Text>
                <Text style={styles.summaryVal}>{quantity} Seat(s)</Text>
              </View>

              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                <Text style={styles.summaryTotalVal}>{formatCurrency(total)}</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.disabledBtn]}
                onPress={createBooking}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={theme.colors.surface} size="small" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Confirm Reservation</Text>
                    <ArrowRight size={16} color={theme.colors.surface} />
                  </>
                )}
              </TouchableOpacity>
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
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
      gap: 20,
    },
    loadingText: {
      color: theme.colors.textMuted,
      fontSize: 14,
      marginTop: 12,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 8,
      alignSelf: 'flex-start',
    },
    backBtnText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: 'bold',
    },
    contentGrid: {
      gap: 20,
    },
    mainCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
      gap: 16,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    emptyBox: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 8,
    },
    emptyText: {
      color: theme.colors.textMuted,
      fontSize: 12,
    },
    tierList: {
      gap: 12,
    },
    tierCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      padding: 16,
    },
    tierCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
    },
    tierName: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    tierSeats: {
      color: theme.colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    tierPrice: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '900',
    },
    qtySection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 16,
      marginTop: 8,
    },
    qtyTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    qtyControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    qtyBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qtyText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '900',
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 20,
      gap: 14,
    },
    summaryTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
    },
    summaryVal: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: 'bold',
    },
    summaryTotalRow: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 12,
      marginTop: 4,
    },
    summaryTotalLabel: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    summaryTotalVal: {
      color: theme.colors.primary,
      fontSize: 18,
      fontWeight: '900',
    },
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      gap: 8,
      marginTop: 8,
    },
    submitBtnText: {
      color: theme.colors.surface,
      fontSize: 14,
      fontWeight: 'bold',
    },
    disabledBtn: {
      opacity: 0.6,
    },
  });

export default BookTickets;
