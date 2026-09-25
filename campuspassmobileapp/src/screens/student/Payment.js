import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../utils/ThemeContext';

const Payment = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const { bookingId } = route.params || {};

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (bookingId) {
      api.get(`/bookings/${bookingId}`).then((response) => {
        const nextBooking = response.data.data;
        if (nextBooking.paymentStatus === "paid") {
          navigation.replace("ETicket", { bookingId });
        } else {
          setBooking(nextBooking);
        }
      }).catch(() => {
        Alert.alert("Error", "Unable to load this booking.");
        navigation.goBack();
      }).finally(() => setLoading(false));
    }
  }, [bookingId, navigation]);

  const startPayment = async () => {
    setProcessing(true);
    
    setTimeout(() => {
      setProcessing(false);
      Alert.alert(
        "Payment Simulation",
        "The native Razorpay SDK is required for real mobile payments. In a production app, the Razorpay bottom sheet would open here.",
        [
          { 
            text: "Understood", 
            style: "cancel"
          }
        ]
      );
    }, 1500);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading secure checkout...</Text>
      </View>
    );
  }

  if (!booking) return null;
  const event = booking.eventId || {};
  const amount = booking.totalAmount || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={16} color={theme.colors.textMuted} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        <PageHeader 
          breadcrumb="CHECKOUT & PAYMENT" 
          title="Complete ticket payment" 
          subtitle="Payments are processed securely by Razorpay." 
        />

        <View style={styles.contentGrid}>
          <View style={styles.mainSection}>
            <Text style={styles.sectionTitle}>Secure checkout</Text>
            <Text style={styles.sectionDesc}>
              Select your preferred UPI, card, wallet, or net-banking option in the checkout window.
            </Text>
            
            <View style={styles.secureAlert}>
              <ShieldCheck size={16} color="#6ee7b7" />
              <Text style={styles.secureAlertText}>Your payment details are handled by Razorpay, not CampusPass.</Text>
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Order summary</Text>
            <Text style={styles.summaryEventTitle}>{event.title || "Campus event pass"}</Text>
            <Text style={styles.summaryQty}>{booking.quantity || 1} ticket(s)</Text>
            
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(amount)}</Text>
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, processing && styles.submitBtnDisabled]}
              onPress={startPayment}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
              ) : (
                <CheckCircle2 size={18} color="#fff" style={{ marginRight: 8 }} />
              )}
              <Text style={styles.submitBtnText}>
                {processing ? "Opening payment..." : `Pay ${formatCurrency(amount)}`}
              </Text>
            </TouchableOpacity>
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
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
      gap: 20,
    },
    loadingText: {
      marginTop: 12,
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: 'bold',
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
    },
    backBtnText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: 'bold',
    },
    contentGrid: {
      gap: 20,
    },
    mainSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 24,
      gap: 16,
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    sectionDesc: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 22,
    },
    secureAlert: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 8,
    },
    secureAlertText: {
      color: '#6ee7b7',
      fontSize: 12,
      flex: 1,
    },
    summarySection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 24,
      gap: 16,
    },
    summaryTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    summaryEventTitle: {
      color: theme.colors.text,
      fontWeight: 'bold',
      fontSize: 16,
    },
    summaryQty: {
      color: theme.colors.textMuted,
      fontSize: 12,
    },
    totalSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 16,
      marginTop: 8,
    },
    totalLabel: {
      color: theme.colors.text,
      fontWeight: 'bold',
      fontSize: 16,
    },
    totalValue: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: 18,
    },
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#059669',
      borderRadius: 16,
      paddingVertical: 14,
    },
    submitBtnDisabled: {
      opacity: 0.5,
    },
    submitBtnText: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 14,
    },
  });

export default Payment;
