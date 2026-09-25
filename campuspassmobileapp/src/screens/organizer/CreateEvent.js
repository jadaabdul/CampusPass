import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Calendar, Save, ChevronDown, Check } from 'lucide-react-native';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';

const CustomPicker = ({ label, options, selectedValue, onValueChange, placeholder }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedOption = options.find(o => o._id === selectedValue || o.id === selectedValue);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.pickerButton} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.pickerButtonText, !selectedOption && { color: '#6b7280' }]}>
          {selectedOption ? selectedOption.name : placeholder}
        </Text>
        <ChevronDown size={18} color="#9ca3af" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {label}</Text>
            <ScrollView style={styles.modalList}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt._id || opt.id}
                  style={styles.modalItem}
                  onPress={() => {
                    onValueChange(opt._id || opt.id);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, selectedValue === (opt._id || opt.id) && { color: '#60a5fa' }]}>
                    {opt.name}
                  </Text>
                  {selectedValue === (opt._id || opt.id) && <Check size={18} color="#60a5fa" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const CreateEvent = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const eventToEdit = route.params?.eventToEdit;
  const isEdit = !!eventToEdit;
  const eventId = eventToEdit?._id || eventToEdit?.id;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    venue: "",
    price: "0",
    startDate: "", // E.g. "2026-10-15T09:00"
    endDate: "",
    capacity: "100",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setPageLoading(true);
      await fetchCategories();
      await fetchVenues();
      
      if (isEdit) {
        setFormData({
          title: eventToEdit.title || "",
          description: eventToEdit.description || "",
          category: eventToEdit.category?._id || eventToEdit.category || "",
          venue: eventToEdit.venue?._id || eventToEdit.venue || "",
          price: eventToEdit.price !== undefined ? String(eventToEdit.price) : "0",
          startDate: eventToEdit.startDate ? eventToEdit.startDate.slice(0, 16) : "",
          endDate: eventToEdit.endDate ? eventToEdit.endDate.slice(0, 16) : "",
          capacity: eventToEdit.capacity ? String(eventToEdit.capacity) : "100",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPageLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data?.categories || res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchVenues = async () => {
    try {
      const res = await api.get("/venues");
      setVenues(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title?.trim()) {
      Alert.alert("Error", "Please enter an event title");
      return;
    }
    if (!formData.category) {
      Alert.alert("Error", "Please select an event category");
      return;
    }
    if (!formData.venue) {
      Alert.alert("Error", "Please select a campus venue");
      return;
    }
    if (!formData.startDate) {
      Alert.alert("Error", "Please select a start date and time");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        title: formData.title.trim(),
        description: formData.description || formData.title.trim(),
        category: formData.category,
        venue: formData.venue,
        price: Number(formData.price) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        capacity: Number(formData.capacity) || 100,
      };

      if (isEdit) {
        await api.put(`/events/${eventId}`, payload);
        Alert.alert("Success", "Event updated successfully!");
      } else {
        await api.post("/events", payload);
        Alert.alert("Success", "Event created successfully!");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Configuration...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={16} color="#d1d5db" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        <PageHeader
          breadcrumb="EVENT MANAGEMENT"
          title={isEdit ? "Edit Event" : "Host New Campus Event"}
          subtitle={
            isEdit
              ? "Update event details, ticket price, dates, or capacity."
              : "Fill in the details below to list your fest, hackathon, or workshop."
          }
        />

        <View style={styles.formCard}>
          <Text style={styles.noteText}>Note: Poster image upload is available via the web dashboard.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Annual Hackathon 2026"
              placeholderTextColor="#6b7280"
              value={formData.title}
              onChangeText={(val) => handleChange('title', val)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe what students will learn or experience..."
              placeholderTextColor="#6b7280"
              value={formData.description}
              onChangeText={(val) => handleChange('description', val)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <CustomPicker 
            label="Category" 
            options={categories} 
            selectedValue={formData.category} 
            onValueChange={(val) => handleChange('category', val)} 
            placeholder="Select Category"
          />

          <CustomPicker 
            label="Campus Venue" 
            options={venues} 
            selectedValue={formData.venue} 
            onValueChange={(val) => handleChange('venue', val)} 
            placeholder="Select Venue"
          />

          <View style={styles.rowGrid}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Start Date & Time *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DDTHH:mm"
                placeholderTextColor="#6b7280"
                value={formData.startDate}
                onChangeText={(val) => handleChange('startDate', val)}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>End Date & Time</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DDTHH:mm"
                placeholderTextColor="#6b7280"
                value={formData.endDate}
                onChangeText={(val) => handleChange('endDate', val)}
              />
            </View>
          </View>

          <View style={styles.rowGrid}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Capacity (Max Seats)</Text>
              <TextInput
                style={styles.input}
                placeholder="100"
                placeholderTextColor="#6b7280"
                value={formData.capacity}
                onChangeText={(val) => handleChange('capacity', val)}
                keyboardType="number-pad"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Ticket Price (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="0 for Free"
                placeholderTextColor="#6b7280"
                value={formData.price}
                onChangeText={(val) => handleChange('price', val)}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.disabledBtn]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Save size={18} color="#fff" />
                <Text style={styles.submitBtnText}>
                  {isEdit ? "Update Event" : "Create & List Event"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
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
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  backBtnText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    gap: 20,
  },
  noteText: {
    color: '#fbbf24',
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#181824',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
  },
  pickerButton: {
    backgroundColor: '#181824',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  rowGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#181824',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    padding: 20,
  },
  modalTitle: {
    color: '#ffffff',
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
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalItemText: {
    color: '#d1d5db',
    fontSize: 16,
  },
  modalCloseBtn: {
    backgroundColor: '#374151',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CreateEvent;
