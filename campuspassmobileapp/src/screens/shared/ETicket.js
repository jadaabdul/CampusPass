import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Printer, AlertTriangle } from 'lucide-react-native';
import api from '../../api/axios';
import QRCodeCard from '../../components/QRCodeCard';

const ETicket = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId } = route.params;

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bookings/${bookingId}`);
      const data = res.data.data;

      // Guard: if payment is not completed, redirect to payment page
      if (data.paymentStatus !== "paid" && data.totalAmount > 0) {
        Alert.alert("Payment Required", "Complete payment to view your QR pass.");
        navigation.replace("Payment", { bookingId });
        return;
      }

      setBooking(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load digital pass");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    Alert.alert("Notice", "Printing is not supported in the mobile app yet. Please screenshot this page or download the pass from the web portal.");
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Digital Pass...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.container, styles.center]}>
        <AlertTriangle size={48} color="#fbbf24" style={{ marginBottom: 16 }} />
        <Text style={styles.errorText}>Ticket Not Found</Text>
        <Text style={styles.errorSubText}>This pass may not exist or you may not have access to it.</Text>
        <TouchableOpacity style={styles.myBookingsBtn} onPress={() => navigation.navigate("MyBookings")}>
          <Text style={styles.myBookingsBtnText}>My Bookings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Top Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={16} color="#d1d5db" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
            <Printer size={14} color="#ffffff" />
            <Text style={styles.printBtnText}>Print Pass</Text>
          </TouchableOpacity>
        </View>

        {/* QR Pass Document */}
        <View style={styles.cardContainer}>
          <QRCodeCard booking={booking} onDownload={handlePrint} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorSubText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  myBookingsBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  myBookingsBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  backBtnText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: 'bold',
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  printBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContainer: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  }
});

export default ETicket;
