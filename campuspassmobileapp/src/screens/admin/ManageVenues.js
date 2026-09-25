import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, MapPin, Users, Trash2, Edit, Building2 } from 'lucide-react-native';

import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

const ManageVenues = () => {
  const navigation = useNavigation();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await api.get("/venues");
      setVenues(res.data.data || []);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch venue locations");
    } finally {
      setLoading(false);
    }
  };

  const deleteVenue = async (id) => {
    // Note: React Native's Alert.alert is a better native approach, but sticking to straightforward execution here
    // as toast can provide a non-blocking UI. In a real app, an Alert confirm would be used.
    try {
      await api.delete(`/venues/${id}`);
      Alert.alert("Success", "Venue deleted");
      fetchVenues();
    } catch (error) {
      Alert.alert("Error", "Delete failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
      <PageHeader
        breadcrumb="CAMPUS INFRASTRUCTURE"
        title="Manage Venues & Locations"
        subtitle="Configure auditorium halls, sports complexes, and lab venues for event hosting."
        action={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("CreateVenue")}
          >
            <Plus size={16} color="#ffffff" />
            <Text style={styles.addBtnText}>Add Campus Venue</Text>
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#60a5fa" />
        </View>
      ) : venues.length === 0 ? (
        <EmptyState
          title="No Venues Configured"
          description="Add campus auditoriums and halls so organizers can select them when creating events."
          icon={Building2}
          action={
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => navigation.navigate("CreateVenue")}
            >
              <Text style={styles.emptyAddBtnText}>Add Venue</Text>
            </TouchableOpacity>
          }
        />
      ) : (
        <View style={styles.grid}>
          {venues.map((venue) => (
            <View key={venue._id} style={styles.venueCard}>
              <View style={styles.venueHeaderRow}>
                <View style={styles.venueIconContainer}>
                  <Building2 size={22} color="#60a5fa" />
                </View>
                <View style={styles.venueTitleBox}>
                  <Text style={styles.venueName} numberOfLines={1}>{venue.name}</Text>
                  <Text style={styles.venueCollege}>{venue.collegeName || "Main University Campus"}</Text>
                </View>
              </View>

              <View style={styles.venueDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={14} color="#34d399" style={styles.detailIcon} />
                  <Text style={styles.detailText} numberOfLines={1}>{venue.address || "Main Building Block"}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Users size={14} color="#a78bfa" style={styles.detailIcon} />
                  <Text style={styles.detailText}>Max Capacity: <Text style={styles.boldWhiteText}>{venue.capacity || 500} Seats</Text></Text>
                </View>
              </View>

              {venue.facilities?.length > 0 && (
                <View style={styles.facilitiesRow}>
                  {venue.facilities.map((fac, idx) => (
                    <View key={idx} style={styles.facilityBadge}>
                      <Text style={styles.facilityText}>{fac}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate('CreateVenue', { id: venue._id })}
                >
                  <Edit size={14} color="#d1d5db" />
                  <Text style={styles.editBtnText}>Edit Venue</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteVenue(venue._id)}
                >
                  <Trash2 size={14} color="#fb7185" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 8,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyAddBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 16,
  },
  emptyAddBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  grid: {
    gap: 16,
  },
  venueCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  venueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  venueIconContainer: {
    height: 48,
    width: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueTitleBox: {
    flex: 1,
    justifyContent: 'center',
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  venueCollege: {
    fontSize: 12,
    color: '#9ca3af',
  },
  venueDetails: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    color: '#d1d5db',
    fontSize: 12,
  },
  boldWhiteText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  facilityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  facilityText: {
    color: '#d1d5db',
    fontSize: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 10,
    gap: 6,
  },
  editBtnText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
    borderRadius: 16,
    paddingVertical: 10,
    gap: 6,
  },
  deleteBtnText: {
    color: '#fb7185',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ManageVenues;
