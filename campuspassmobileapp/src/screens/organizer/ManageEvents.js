import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { PlusCircle, ClipboardList, CheckCircle2, AlertCircle, Ban } from 'lucide-react-native';

import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import EventCard from '../../components/EventCard';
import SearchFilterBar from '../../components/SearchFilterBar';
import EmptyState from '../../components/EmptyState';

const ManageEvents = () => {
  const navigation = useNavigation();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events/organizer/my-events");
      setEvents(res.data.data || []);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const deleteEvent = async (id) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/events/${id}`);
              Alert.alert("Success", "Event deleted");
              fetchEvents();
            } catch (error) {
              Alert.alert("Error", error.response?.data?.message || "Delete failed");
            }
          }
        }
      ]
    );
  };

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const searchMatch =
        evt.title?.toLowerCase().includes(search.toLowerCase()) ||
        evt.description?.toLowerCase().includes(search.toLowerCase());
      const statusMatch = !statusFilter || evt.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [events, search, statusFilter]);

  const total = events.length;
  // Web checks 'approved', 'pending', 'rejected' but web component labels used 'published', 'draft', 'cancelled'. 
  // Let's stick to the web data values:
  const published = events.filter((e) => e.status === "approved").length;
  const draft = events.filter((e) => e.status === "pending").length;
  const cancelled = events.filter((e) => e.status === "rejected").length;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
    >
      <PageHeader
        breadcrumb="ORGANIZER PORTAL"
        title="Manage My Events"
        subtitle="Publish, edit, or track attendance for all your hosted campus events."
        action={
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => navigation.navigate("CreateEvent")}
          >
            <PlusCircle size={18} color="#fff" />
            <Text style={styles.headerActionText}>Create New Event</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.statsGrid}>
        <StatCard title="Total Events" value={total} icon={ClipboardList} color="from-blue-500 to-indigo-600" loading={loading} />
        <StatCard title="Published Live" value={published} icon={CheckCircle2} color="from-emerald-500 to-teal-500" loading={loading} />
        <StatCard title="Draft Stage" value={draft} icon={AlertCircle} color="from-amber-500 to-orange-500" loading={loading} />
        <StatCard title="Cancelled" value={cancelled} icon={Ban} color="from-rose-500 to-pink-500" loading={loading} />
      </View>

      <SearchFilterBar
        searchTerm={search}
        onSearchChange={setSearch}
        statusOptions={[
          { value: "approved", label: "Published Live" },
          { value: "pending", label: "Draft Stage" },
          { value: "rejected", label: "Cancelled" },
        ]}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
        placeholder="Filter your organized events..."
      />

      <View style={styles.eventsGrid}>
        {loading && !refreshing ? (
          <ActivityIndicator animating={true} size="large" color="#3b82f6" style={{ marginTop: 20 }} />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No Events Found"
            description="There are no events matching your current search or status filter."
            icon={ClipboardList}
            action={
              <TouchableOpacity
                onPress={() => {
                  setSearch("");
                  setStatusFilter("");
                }}
                style={styles.emptyActionBtn}
              >
                <Text style={styles.emptyActionText}>Clear Filters</Text>
              </TouchableOpacity>
            }
          />
        ) : (
          filteredEvents.map((evt) => (
            <EventCard
              key={evt._id || evt.id}
              event={evt}
              showActions
              onView={() => navigation.navigate('EventDetails', { id: evt._id || evt.id })}
              onEdit={() => navigation.navigate('CreateEvent', { eventToEdit: evt })}
              onDelete={() => deleteEvent(evt._id || evt.id)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 24,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  headerActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsGrid: {
    gap: 16,
  },
  eventsGrid: {
    gap: 16,
  },
  emptyActionBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ManageEvents;
