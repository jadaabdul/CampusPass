import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Building2, MapPin, Users, Plus, ArrowLeft } from 'lucide-react-native';

import api from '../../api/axios';

const CreateVenue = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};

  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    collegeName: "",
    capacity: "",
    facilities: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (isEditMode) {
      fetchVenue();
    }
  }, [id]);

  const fetchVenue = async () => {
    try {
      const res = await api.get(`/venues/${id}`);
      const venue = res.data.data;

      setFormData({
        name: venue.name || "",
        address: venue.address || "",
        collegeName: venue.collegeName || "",
        capacity: venue.capacity ? String(venue.capacity) : "",
        facilities: venue.facilities ? venue.facilities.join(", ") : "",
        latitude: venue.latitude ? String(venue.latitude) : "",
        longitude: venue.longitude ? String(venue.longitude) : "",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to load venue");
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const data = {
        name: formData.name,
        address: formData.address,
        collegeName: formData.collegeName,
        capacity: Number(formData.capacity),
        facilities: formData.facilities
          .split(",")
          .map(item => item.trim())
          .filter(Boolean),
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
      };

      if (isEditMode) {
        await api.put(`/venues/${id}`, data);
        Alert.alert("Success", "Venue updated successfully");
      } else {
        await api.post("/venues", data);
        Alert.alert("Success", "Venue created successfully");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeft size={16} color="#d1d5db" />
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Building2 size={28} color="#60a5fa" />
        <View style={styles.headerText}>
          <Text style={styles.title}>{isEditMode ? "Edit Venue" : "Create Venue"}</Text>
          <Text style={styles.subtitle}>{isEditMode ? "Update venue details" : "Add a new event location"}</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Venue Name</Text>
          <View style={styles.inputContainer}>
            <Building2 size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(val) => handleChange('name', val)}
              placeholder="Main Auditorium"
              placeholderTextColor="#6b7280"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>College Name</Text>
          <View style={styles.inputContainer}>
            <Building2 size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.collegeName}
              onChangeText={(val) => handleChange('collegeName', val)}
              placeholder="ABC College"
              placeholderTextColor="#6b7280"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <View style={styles.inputContainer}>
            <MapPin size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(val) => handleChange('address', val)}
              placeholder="Pune, Maharashtra"
              placeholderTextColor="#6b7280"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Capacity</Text>
          <View style={styles.inputContainer}>
            <Users size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.capacity}
              onChangeText={(val) => handleChange('capacity', val)}
              placeholder="500"
              keyboardType="numeric"
              placeholderTextColor="#6b7280"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Facilities</Text>
          <View style={styles.inputContainerNoIcon}>
            <TextInput
              style={styles.input}
              value={formData.facilities}
              onChangeText={(val) => handleChange('facilities', val)}
              placeholder="Parking, AC, Projector"
              placeholderTextColor="#6b7280"
            />
          </View>
          <Text style={styles.hintText}>Separate facilities using commas</Text>
        </View>

        <View style={styles.rowGroup}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Latitude</Text>
            <View style={styles.inputContainerNoIcon}>
              <TextInput
                style={styles.input}
                value={formData.latitude}
                onChangeText={(val) => handleChange('latitude', val)}
                placeholder="18.5204"
                keyboardType="numeric"
                placeholderTextColor="#6b7280"
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Longitude</Text>
            <View style={styles.inputContainerNoIcon}>
              <TextInput
                style={styles.input}
                value={formData.longitude}
                onChangeText={(val) => handleChange('longitude', val)}
                placeholder="73.8567"
                keyboardType="numeric"
                placeholderTextColor="#6b7280"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Plus size={18} color="#ffffff" />
          <Text style={styles.submitBtnText}>
            {loading ? "Saving..." : isEditMode ? "Update Venue" : "Create Venue"}
          </Text>
        </TouchableOpacity>
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
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 24,
    gap: 8,
  },
  backBtnText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputContainerNoIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#ffffff',
    fontSize: 14,
  },
  hintText: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CreateVenue;
