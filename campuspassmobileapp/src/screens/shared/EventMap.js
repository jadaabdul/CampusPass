import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MapPin, Navigation, ArrowLeft, Building2 } from 'lucide-react-native';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';

const EventMap = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.data.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load venue map");
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = () => {
    const venue = event?.venue || {};
    const query = encodeURIComponent(venue.address || venue.name || "Pune");
    const url = `https://maps.google.com/?q=${query}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open map app.");
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Venue Location...</Text>
      </View>
    );
  }

  if (!event) return null;
  const venue = event.venue || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={16} color="#d1d5db" />
          <Text style={styles.backBtnText}>Back to Event</Text>
        </TouchableOpacity>

        <PageHeader
          breadcrumb="CAMPUS NAVIGATION"
          title="Venue Map & Directions"
          subtitle={`Location guidance for ${event.title}`}
        />

        <View style={styles.gridContainer}>
          {/* Simulated Map Visual Card */}
          <View style={styles.mapCard}>
            <View style={styles.mapVisualPlaceholder}>
              <View style={styles.mapGridPattern} />
              <View style={styles.mapVisualContent}>
                <View style={styles.pinIconContainer}>
                  <MapPin size={32} color="#60a5fa" />
                </View>
                <Text style={styles.venueTitle}>{venue.name || "Main Campus Auditorium"}</Text>
                <Text style={styles.venueAddress}>{venue.address || "Building B, Central Quadrangle, Pune University Campus"}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.openMapsBtn} onPress={openInMaps}>
              <Navigation size={16} color="#ffffff" />
              <Text style={styles.openMapsBtnText}>Open in Maps App</Text>
            </TouchableOpacity>
          </View>

          {/* Venue Info Details */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Building2 size={18} color="#60a5fa" />
              <Text style={styles.infoCardTitle}>Venue Details</Text>
            </View>

            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>VENUE NAME</Text>
                <Text style={styles.infoValue}>{venue.name || "Main Auditorium"}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>CAPACITY</Text>
                <Text style={styles.infoValue}>{venue.capacity || event.capacity || 500} People</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>LANDMARK</Text>
                <Text style={styles.infoValue}>{venue.landmark || "Near University Library"}</Text>
              </View>
            </View>
          </View>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  loadingText: {
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#12121a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 8,
  },
  backBtnText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gridContainer: {
    gap: 16,
  },
  mapCard: {
    backgroundColor: '#12121a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    gap: 16,
  },
  mapVisualPlaceholder: {
    height: 280,
    backgroundColor: '#181824',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapGridPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    backgroundColor: '#3b82f6', 
    // Usually achieved with image patterns or SVG, using simple color for placeholder
  },
  mapVisualContent: {
    alignItems: 'center',
    padding: 24,
  },
  pinIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  venueTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  venueAddress: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  openMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  openMapsBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoCardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoList: {
    gap: 16,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EventMap;
