import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ticket, Calendar, MapPin, CheckCircle2, Download, AlertTriangle } from 'lucide-react-native';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/formatters';

const QRCodeCard = ({ booking, onDownload }) => {
  if (!booking) return null;

  const event = booking.eventId || booking.event || {};
  const bookingCode = booking.bookingCode || booking._id || "CP-000000";
  const isPaid = booking.paymentStatus === "paid";

  const qrImageSrc =
    booking.qrCode && (booking.qrCode.startsWith("data:") || booking.qrCode.startsWith("http"))
      ? booking.qrCode
      : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(bookingCode)}`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <Ticket color="#3b82f6" size={24} />
          <Text style={styles.brandText}>CAMPUSPASS</Text>
        </View>
        <StatusBadge status={booking.bookingStatus || "pending"} />
      </View>

      <View style={styles.qrContainer}>
        <View style={styles.qrImageWrapper}>
          <Image
            source={{ uri: qrImageSrc }}
            style={styles.qrImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.passId}>PASS ID: {bookingCode}</Text>

        {!isPaid && (
          <View style={styles.paymentPending}>
            <Text style={styles.paymentPendingText}>Payment Pending — QR active after payment</Text>
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <View>
          <Text style={styles.eventTitle} numberOfLines={1}>{event.title || "Campus Event"}</Text>
          <Text style={styles.eventCategory}>Category: {event.category?.name || "General"}</Text>
        </View>

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Calendar size={14} color="#60a5fa" />
            <Text style={styles.infoText}>{formatDate(event.startDate || new Date())}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={14} color="#60a5fa" />
            <Text style={styles.infoText} numberOfLines={1}>{event.venue?.name || "Campus Venue"}</Text>
          </View>
          
          {event.venue?.address && (
            <Text style={styles.addressText}>{event.venue.address}</Text>
          )}

          <View style={styles.infoRow}>
            <CheckCircle2 size={14} color="#34d399" />
            <Text style={styles.infoText}>{booking.quantity || 1} Ticket(s)</Text>
          </View>
        </View>
      </View>

      {onDownload && isPaid && (
        <TouchableOpacity style={styles.downloadButton} onPress={onDownload}>
          <Download size={18} color="#fff" />
          <Text style={styles.downloadText}>Download E-Ticket Pass</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#181824',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    marginVertical: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    color: '#ffffff',
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 8,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  qrImageWrapper: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 12,
    height: 192,
    width: 192,
  },
  qrImage: {
    flex: 1,
  },
  qrFallback: {
    height: 192,
    width: 192,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackTitle: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
  fallbackSub: {
    color: '#6b7280',
    fontSize: 10,
    marginTop: 4,
  },
  passId: {
    marginTop: 16,
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
  paymentPending: {
    marginTop: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  paymentPendingText: {
    color: '#fcd34d',
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
  },
  eventTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventCategory: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  infoList: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#d1d5db',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  addressText: {
    color: '#6b7280',
    fontSize: 11,
    marginLeft: 22,
    marginBottom: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 24,
  },
  downloadText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default QRCodeCard;
