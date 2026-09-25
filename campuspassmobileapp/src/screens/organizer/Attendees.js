import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, Platform } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Users, CheckCircle2, XCircle, Search, Download, Phone, Mail, ChevronDown, Check } from 'lucide-react-native';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { useTheme } from '../../utils/ThemeContext';

const EventPicker = ({ events, selectedEventId, onSelect, theme }) => {
  const styles = getStyles(theme);
  const [modalVisible, setModalVisible] = useState(false);
  const selectedEvent = events.find(e => (e._id || e.id) === selectedEventId);

  return (
    <View style={styles.pickerContainer}>
      <Text style={[styles.pickerLabel, { color: theme.colors.textMuted }]}>Select Event:</Text>
      <TouchableOpacity 
        style={[styles.pickerButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.pickerButtonText, { color: theme.colors.text }]} numberOfLines={1}>
          {selectedEvent ? `${selectedEvent.title} (${selectedEvent.bookedSeats || 0} attendees)` : 'Loading events...'}
        </Text>
        <ChevronDown size={18} color={theme.colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Event</Text>
            <ScrollView style={styles.modalList}>
              {events.map((evt) => {
                const id = evt._id || evt.id;
                const isSelected = selectedEventId === id;
                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.modalItem, { borderBottomColor: theme.colors.border }]}
                    onPress={() => {
                      onSelect(id);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.modalItemText, { color: isSelected ? theme.colors.primary : theme.colors.text }]}>
                      {evt.title} ({evt.bookedSeats || 0} attendees)
                    </Text>
                    {isSelected && <Check size={18} color={theme.colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={[styles.modalCloseBtn, { backgroundColor: theme.colors.background }]} onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalCloseBtnText, { color: theme.colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const Attendees = () => {
  const route = useRoute();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const eventId = route.params?.eventId;

  const [loading, setLoading] = useState(true);
  const [attendees, setAttendees] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(eventId || "");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendees(selectedEventId);
    } else if (events.length > 0) {
      setSelectedEventId(events[0]._id || events[0].id);
      fetchAttendees(events[0]._id || events[0].id);
    } else {
      setLoading(false);
    }
  }, [selectedEventId, events]);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events/organizer/my-events");
      const list = res.data.data || [];
      setEvents(list);
      if (!selectedEventId && list.length > 0) {
        setSelectedEventId(list[0]._id || list[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAttendees = async (eId) => {
    try {
      setLoading(true);
      const res = await api.get(`/organizer/attendees/${eId}`);
      setAttendees(res.data.data || []);
    } catch (error) {
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInToggle = async (bookingId, currentCheckIn) => {
    try {
      await api.patch(`/bookings/${bookingId}/check-in`, { checkedIn: !currentCheckIn });
      Alert.alert("Success", currentCheckIn ? "Check-in undone" : "Attendee checked in!");
      fetchAttendees(selectedEventId);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update check-in status");
    }
  };

  const handleExport = () => {
    Alert.alert("Notice", "Export to CSV is available on the web dashboard.");
  };

  const filteredAttendees = attendees.filter((item) => {
    const user = item.userId || item.user || {};
    const nameMatch = user.fullName?.toLowerCase().includes(search.toLowerCase());
    const emailMatch = user.email?.toLowerCase().includes(search.toLowerCase());
    const codeMatch = (item.bookingCode || item._id || "").toLowerCase().includes(search.toLowerCase());
    return nameMatch || emailMatch || codeMatch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
        <PageHeader
          breadcrumb="ATTENDEE MANAGEMENT"
          title="Event Attendees"
          subtitle="Track registered students and verify check-ins."
          action={
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={handleExport}
            >
              <Download size={16} color={theme.colors.surface} />
              <Text style={styles.headerActionText}>Export CSV</Text>
            </TouchableOpacity>
          }
        />

        <View style={styles.controlsContainer}>
          {events.length > 0 && (
            <EventPicker 
              events={events} 
              selectedEventId={selectedEventId} 
              onSelect={setSelectedEventId} 
              theme={theme}
            />
          )}
          
          <View style={styles.searchWrapper}>
            <Search size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search name or ticket code..."
              placeholderTextColor={theme.colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator animating={true} size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
          ) : filteredAttendees.length === 0 ? (
            <EmptyState
              title="No Attendees Registered"
              description="There are no registered students matching your search criteria for this event."
              icon={Users}
            />
          ) : (
            filteredAttendees.map((item) => {
              const user = item.userId || item.user || {};
              const seats = item.quantity || item.seatsCount || 1;
              return (
                <View key={item._id} style={styles.attendeeCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.bookingCode}>{item.bookingCode || item._id?.substring(0, 8)}</Text>
                    <StatusBadge status={item.bookingStatus || item.status || "confirmed"} />
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.fullName || "Student Name"}</Text>
                    
                    <View style={styles.contactRow}>
                      <Mail size={14} color={theme.colors.textMuted} />
                      <Text style={styles.contactText}>{user.email || "student@college.edu"}</Text>
                    </View>
                    
                    {user.mobile ? (
                      <View style={styles.contactRow}>
                        <Phone size={14} color={theme.colors.textMuted} />
                        <Text style={styles.contactText}>{user.mobile}</Text>
                      </View>
                    ) : null}
                    
                    <View style={styles.seatsRow}>
                      <Text style={styles.seatsLabel}>Seats Reserved:</Text>
                      <Text style={styles.seatsValue}>{seats}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.checkInBtn,
                      item.checkedIn ? styles.checkedInBtn : styles.notCheckedInBtn
                    ]}
                    onPress={() => handleCheckInToggle(item._id, item.checkedIn)}
                  >
                    {item.checkedIn ? (
                      <>
                        <CheckCircle2 size={16} color="#34d399" />
                        <Text style={styles.checkedInText}>Checked In</Text>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} color={theme.colors.textMuted} />
                        <Text style={styles.notCheckedInText}>Mark as Check In</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function getStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 40,
      gap: 20,
    },
    headerActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      marginTop: 12,
      alignSelf: 'flex-start',
    },
    headerActionText: {
      color: theme.colors.surface,
      fontSize: 12,
      fontWeight: 'bold',
    },
    controlsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      gap: 16,
    },
    pickerContainer: {
      gap: 8,
    },
    pickerLabel: {
      color: theme.colors.textMuted,
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    pickerButton: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pickerButtonText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: 'bold',
      flex: 1,
    },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 44,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 14,
    },
    listContainer: {
      gap: 12,
    },
    attendeeCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 20,
      padding: 16,
      gap: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    bookingCode: {
      color: theme.colors.primary,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
      fontWeight: 'bold',
      fontSize: 14,
    },
    userInfo: {
      gap: 6,
    },
    userName: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    contactText: {
      color: theme.colors.textMuted,
      fontSize: 12,
    },
    seatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    seatsLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: 'bold',
    },
    seatsValue: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
    checkInBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
    },
    notCheckedInBtn: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
    },
    checkedInBtn: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    notCheckedInText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    checkedInText: {
      color: '#34d399',
      fontSize: 14,
      fontWeight: 'bold',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '60%',
      padding: 20,
    },
    modalTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
    },
    modalList: {
      marginBottom: 16,
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalItemText: {
      color: theme.colors.text,
      fontSize: 16,
    },
    modalCloseBtn: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
    },
    modalCloseBtnText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
  });
}

export default Attendees;
