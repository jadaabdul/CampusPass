import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Share, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Calendar, MapPin, Users, Tag, Clock, Ticket, Heart, Share2, ArrowLeft, Map, CheckCircle, Building2 } from 'lucide-react-native';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import EventReviews from '../../components/EventReviews';
import { formatDate, formatCurrency } from '../../utils/formatters';

const EventDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [availableSeats, setAvailableSeats] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [savingFav, setSavingFav] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    if (user) checkFavoriteStatus();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const eventRes = await api.get(`/events/${id}`);
      setEvent(eventRes.data.data);

      try {
        const ticketsRes = await api.get(`/tickets/event/${id}`);
        const tickets = ticketsRes.data.data || [];

        if (tickets.length > 0) {
          const seats = tickets.reduce(
            (total, t) => total + (t.status === "active" ? t.remainingQuantity : 0),
            0
          );
          setAvailableSeats(seats);
        } else {
          setAvailableSeats(null);
        }
      } catch {
        setAvailableSeats(null);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const res = await api.get("/users/favorites");
      const favList = res.data.data || [];
      setIsFavorite(favList.some((fav) => fav.event?._id === id || fav.event === id));
    } catch {
      // Silent
    }
  };

  const toggleFavorite = async () => {
    try {
      setSavingFav(true);
      if (isFavorite) {
        await api.delete(`/users/favorites/${id}`);
        setIsFavorite(false);
        Alert.alert("Success", "Removed from favorites");
      } else {
        await api.post(`/users/favorites/${id}`);
        setIsFavorite(true);
        Alert.alert("Success", "Added to favorites");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update favorites");
    } finally {
      setSavingFav(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event: ${event?.title}!`,
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Event Details...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Event Not Found</Text>
        <Text style={styles.errorSubText}>The event you are looking for does not exist or has been removed.</Text>
        <TouchableOpacity style={styles.backBtnLarge} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnLargeText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const venue = event.venue || {};
  const seatsAvailable = availableSeats !== null ? availableSeats : (event.capacity || 0) - (event.bookedSeats || 0);
  const isBookable = user?.role === "student" && event.status === "approved" && seatsAvailable > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={16} color="#d1d5db" />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            {user && (
              <TouchableOpacity
                onPress={toggleFavorite}
                disabled={savingFav}
                style={[styles.favBtn, isFavorite && styles.favBtnActive]}
              >
                <Heart size={16} color={isFavorite ? "#fb7185" : "#d1d5db"} fill={isFavorite ? "#fb7185" : "transparent"} />
                <Text style={[styles.favBtnText, isFavorite && { color: '#fb7185' }]}>
                  {isFavorite ? "Saved" : "Save Event"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Share2 size={16} color="#d1d5db" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroCard}>
          <Image
            source={{
              uri: event.poster || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />
          
          <View style={styles.floatingBadges}>
            <View style={styles.categoryBadge}>
              <Tag size={12} color="#60a5fa" style={{ marginRight: 4 }} />
              <Text style={styles.categoryBadgeText}>{event.category?.name || "Campus Fest"}</Text>
            </View>
            <StatusBadge status={event.status || "pending"} />
          </View>

          <View style={styles.heroDetails}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>{event.title}</Text>
              <Text style={styles.heroOrganizer}>Organized by: {event.organizer?.fullName || "Campus Student Council"}</Text>
            </View>
            <View style={styles.priceBadge}>
              <Text style={styles.priceLabel}>TICKET PRICE</Text>
              <Text style={styles.priceValue}>{formatCurrency(event.price)}</Text>
            </View>
          </View>
        </View>

        {/* Action Row */}
        {user?.role === "student" && event.status === "approved" && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate("BookTickets", { eventId: event._id || event.id })}
              disabled={seatsAvailable <= 0}
              style={[styles.bookBtn, seatsAvailable <= 0 && styles.disabledBookBtn]}
            >
              <Ticket size={18} color="#fff" />
              <Text style={styles.bookBtnText}>{seatsAvailable > 0 ? "Book Pass Now" : "Sold Out"}</Text>
            </TouchableOpacity>

            {venue.latitude && venue.longitude && (
              <TouchableOpacity
                onPress={() => navigation.navigate("EventMap", { eventId: event._id || event.id, venue })}
                style={styles.mapBtn}
              >
                <Map size={18} color="#fff" />
                <Text style={styles.mapBtnText}>Venue Map</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Info Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>About This Event</Text>
            <Text style={styles.descriptionText}>
              {event.description || "Join us for an incredible campus experience!"}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Guidelines & Details</Text>
            <View style={styles.guidelineItem}>
              <CheckCircle size={16} color="#34d399" />
              <Text style={styles.guidelineText}>E-Ticket QR pass is required at the venue entrance.</Text>
            </View>
            <View style={styles.guidelineItem}>
              <CheckCircle size={16} color="#34d399" />
              <Text style={styles.guidelineText}>College Student ID Card must be produced alongside your ticket.</Text>
            </View>
            <View style={styles.guidelineItem}>
              <CheckCircle size={16} color="#34d399" />
              <Text style={styles.guidelineText}>Please report 15 minutes prior to the scheduled start time.</Text>
            </View>
            {event.registrationDeadline && (
              <View style={styles.guidelineItem}>
                <CheckCircle size={16} color="#34d399" />
                <Text style={styles.guidelineText}>Registration closes: {formatDate(event.registrationDeadline)}</Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Event Logistics</Text>
            <View style={styles.logisticsItem}>
              <Calendar size={18} color="#60a5fa" />
              <View>
                <Text style={styles.logisticsLabel}>DATE</Text>
                <Text style={styles.logisticsValue}>{formatDate(event.startDate)}</Text>
                {event.endDate && event.endDate !== event.startDate && (
                  <Text style={styles.logisticsSubValue}>to {formatDate(event.endDate)}</Text>
                )}
              </View>
            </View>
            <View style={styles.logisticsItem}>
              <Clock size={18} color="#60a5fa" />
              <View>
                <Text style={styles.logisticsLabel}>TIME</Text>
                <Text style={styles.logisticsValue}>
                  {new Date(event.startDate || Date.now()).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
            <View style={styles.logisticsItem}>
              <Users size={18} color="#60a5fa" />
              <View>
                <Text style={styles.logisticsLabel}>AVAILABILITY</Text>
                <Text style={styles.logisticsValue}>
                  {seatsAvailable > 0 ? `${seatsAvailable} seats remaining` : "Fully Booked"}
                </Text>
                {event.capacity && (
                  <Text style={styles.logisticsSubValue}>Total capacity: {event.capacity}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Building2 size={18} color="#60a5fa" />
              <Text style={[styles.cardTitle, { marginBottom: 0, marginLeft: 8 }]}>Venue Details</Text>
            </View>
            
            <View style={styles.logisticsItem}>
              <MapPin size={18} color="#60a5fa" />
              <View>
                <Text style={styles.logisticsValue}>{venue.name || "Campus Auditorium"}</Text>
                {venue.address && <Text style={styles.logisticsSubValue}>{venue.address}</Text>}
              </View>
            </View>

            {venue.collegeName && (
              <View style={styles.logisticsItem}>
                <Building2 size={18} color="#60a5fa" />
                <View>
                  <Text style={styles.logisticsLabel}>INSTITUTION</Text>
                  <Text style={styles.logisticsValue}>{venue.collegeName}</Text>
                </View>
              </View>
            )}

            {venue.capacity && (
              <View style={styles.logisticsItem}>
                <Users size={18} color="#60a5fa" />
                <View>
                  <Text style={styles.logisticsLabel}>VENUE CAPACITY</Text>
                  <Text style={styles.logisticsValue}>{venue.capacity} seats</Text>
                </View>
              </View>
            )}

            {venue.facilities && venue.facilities.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.logisticsLabel}>FACILITIES AVAILABLE</Text>
                <View style={styles.facilitiesRow}>
                  {venue.facilities.map((facility, idx) => (
                    <View key={idx} style={styles.facilityBadge}>
                      <Text style={styles.facilityText}>{facility}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        <EventReviews eventId={id} user={user} />
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
    gap: 20,
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
    marginBottom: 20,
  },
  backBtnLarge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnLargeText: {
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  backBtnText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  favBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  favBtnActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  favBtnText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: 'bold',
  },
  shareBtn: {
    backgroundColor: '#12121a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 8,
  },
  heroCard: {
    backgroundColor: '#12121a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 26, 0.4)',
  },
  floatingBadges: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroDetails: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroOrganizer: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  priceLabel: {
    color: '#93c5fd',
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  priceValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bookBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  disabledBookBtn: {
    opacity: 0.5,
  },
  bookBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mapBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  mapBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gridContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 12,
    marginBottom: 4,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  descriptionText: {
    color: '#d1d5db',
    fontSize: 13,
    lineHeight: 20,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  guidelineText: {
    color: '#d1d5db',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  logisticsItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  logisticsLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  logisticsValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logisticsSubValue: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  facilityBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  facilityText: {
    color: '#d1d5db',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default EventDetail;
