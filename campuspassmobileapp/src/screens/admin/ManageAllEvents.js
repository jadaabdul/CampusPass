import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ClipboardList, CheckCircle2, XCircle, Trash2, Eye, Search, RefreshCw, Calendar, MapPin, Users } from 'lucide-react-native';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { formatDate, formatCurrency } from '../../utils/formatters';

const EventRow = ({ event, onApprove, onReject, onDelete, onView }) => {
  return (
    <View style={styles.eventRow}>
      <View style={styles.posterContainer}>
        <Image 
          source={{ uri: event.poster || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=200&q=60" }}
          style={styles.poster}
        />
      </View>

      <View style={styles.eventInfo}>
        <View style={styles.eventTitleRow}>
          <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
          <StatusBadge status={event.status} />
        </View>

        <Text style={styles.eventMeta} numberOfLines={1}>
          By <Text style={styles.boldText}>{event.organizer?.fullName || "Unknown"}</Text>
          {" · "}{event.category?.name || "General"}
          {" · "}{formatDate(event.startDate)}
        </Text>

        <Text style={styles.eventMetaSecondary} numberOfLines={1}>
          {event.venue?.name || "Venue TBD"}
          {" · "}{formatCurrency(event.price)}
          {" · "}
          <Text style={styles.boldWhiteText}>{event.capacity || 0}</Text> seats
        </Text>

        <View style={styles.eventActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onView}>
            <Eye size={14} color="#d1d5db" />
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>

          {event.status !== "published" && (
            <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={onApprove}>
              <CheckCircle2 size={14} color="#34d399" />
              <Text style={styles.approveText}>Approve</Text>
            </TouchableOpacity>
          )}

          {event.status !== "rejected" && event.status !== "cancelled" && (
            <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={onReject}>
              <XCircle size={14} color="#fbbf24" />
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
            <Trash2 size={14} color="#fb7185" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const ManageAllEvents = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events/admin/all");
      const raw = res.data.data;
      setEvents(Array.isArray(raw) ? raw : raw?.events || []);
    } catch (error) {
      Alert.alert("Error", "Failed to load events list");
    } finally {
      setLoading(false);
    }
  };

  const approveEvent = async (id) => {
    try {
      await api.patch(`/events/${id}/approve`);
      Alert.alert("Success", "Event approved & published live!");
      fetchAllEvents();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to approve event");
    }
  };

  const rejectEvent = async (id) => {
    try {
      await api.patch(`/events/${id}/reject`, { reason: "Admin rejected event." });
      Alert.alert("Success", "Event rejected");
      fetchAllEvents();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to reject event");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/events/${deleteTarget._id}`);
      Alert.alert("Success", "Event deleted from system");
      setDeleteTarget(null);
      fetchAllEvents();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q ||
        evt.title?.toLowerCase().includes(q) ||
        evt.description?.toLowerCase().includes(q) ||
        evt.organizer?.fullName?.toLowerCase().includes(q) ||
        evt.category?.name?.toLowerCase().includes(q);

      const matchStatus = !statusFilter || evt.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [events, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => {
    return events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {});
  }, [events]);

  const filterPills = [
    { label: "All", value: "", count: events.length },
    { label: "Pending", value: "pending", count: statusCounts.pending || 0 },
    { label: "Live", value: "published", count: statusCounts.published || statusCounts.approved || 0 },
    { label: "Rejected", value: "rejected", count: statusCounts.rejected || 0 },
  ];

  return (
    <>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAllEvents} tintColor="#60a5fa" />}
      >
        <PageHeader
          breadcrumb="SYSTEM MODERATION"
          title="Manage All Events"
          subtitle="Approve or reject draft events, moderate live events, and remove inappropriate content."
          action={
            <TouchableOpacity onPress={fetchAllEvents} style={styles.refreshBtn}>
              <RefreshCw size={14} color="#d1d5db" />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          }
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={styles.filtersContainer}>
            {filterPills.map((pill) => (
              <TouchableOpacity
                key={pill.value}
                onPress={() => setStatusFilter(pill.value)}
                style={[
                  styles.filterPill,
                  statusFilter === pill.value ? styles.filterPillActive : styles.filterPillInactive
                ]}
              >
                <Text style={statusFilter === pill.value ? styles.pillTextActive : styles.pillTextInactive}>
                  {pill.label}
                </Text>
                <View style={styles.pillBadge}>
                  <Text style={styles.pillBadgeText}>{pill.count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.searchContainer}>
          <Search size={16} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search by title, organizer..."
            placeholderTextColor="#6b7280"
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#60a5fa" />
          </View>
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No Events Found"
            description={statusFilter ? `There are no "${statusFilter}" events to moderate.` : "No events match your search."}
            icon={ClipboardList}
          />
        ) : (
          <View style={styles.listContainer}>
            {filteredEvents.map(evt => (
              <EventRow
                key={evt._id}
                event={evt}
                onView={() => navigation.navigate("EventDetails", { eventId: evt._id })} // Adjust route based on your stack
                onApprove={() => approveEvent(evt._id)}
                onReject={() => rejectEvent(evt._id)}
                onDelete={() => setDeleteTarget(evt)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Event"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Permanently delete <Text style={styles.modalBoldText}>{deleteTarget?.title}</Text>?
          </Text>
          <Text style={styles.modalWarning}>⚠ This action cannot be undone.</Text>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setDeleteTarget(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalDelete} 
              disabled={deleting} 
              onPress={confirmDelete}
            >
              <Text style={styles.modalDeleteText}>{deleting ? "Deleting..." : "Delete Event"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  refreshText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filtersScroll: {
    marginBottom: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  filterPillActive: {
    borderColor: 'rgba(59, 130, 246, 0.4)',
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  filterPillInactive: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  pillTextActive: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pillTextInactive: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pillBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pillBadgeText: {
    color: '#fff',
    fontSize: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#fff',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  listContainer: {
    gap: 16,
  },
  eventRow: {
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },
  posterContainer: {
    height: 120,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginRight: 8,
  },
  eventMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  eventMetaSecondary: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
  },
  boldText: {
    color: '#d1d5db',
    fontWeight: 'bold',
  },
  boldWhiteText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  eventActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  actionText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: 'bold',
  },
  approveBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  approveText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rejectBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  rejectText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderColor: 'rgba(244, 63, 94, 0.2)',
  },
  deleteText: {
    color: '#fb7185',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContent: {
    paddingTop: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  modalBoldText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalWarning: {
    fontSize: 12,
    color: '#fb7185',
    marginTop: 8,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
    gap: 12,
  },
  modalCancel: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalCancelText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalDelete: {
    backgroundColor: '#e11d48',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalDeleteText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ManageAllEvents;
