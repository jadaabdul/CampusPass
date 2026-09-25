import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Save, Tag } from 'lucide-react-native';

import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';

const AddCategory = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/categories/${id}`);
      const category = res.data.data;
      setName(category.name || "");
    } catch (error) {
      Alert.alert("Error", "Failed to fetch category");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Category name is required");
      return;
    }

    try {
      setSaving(true);
      
      // We are dropping the image upload functionality for the mobile app
      // to avoid dealing with complex FormData and native image picker configurations
      // that weren't explicitly requested or set up in this environment.
      
      const payload = {
        name: name.trim()
      };

      if (isEdit) {
        await api.put(`/categories/${id}`, payload);
        Alert.alert("Success", "Category updated!");
      } else {
        await api.post("/categories", payload);
        Alert.alert("Success", "Category created!");
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Category...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeft size={16} color="#d1d5db" />
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>

      <PageHeader
        breadcrumb="CATEGORY BUILDER"
        title={isEdit ? "Edit Category" : "Add Event Category"}
        subtitle={isEdit ? "Update category label." : "Create a new tag for classifying campus events."}
      />

      <View style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>CATEGORY NAME *</Text>
          <View style={styles.inputContainer}>
            <Tag size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Hackathon, Cultural, Sports..."
              placeholderTextColor="#6b7280"
            />
          </View>
        </View>

        {/* Removed Image Picker UI to maintain stability across mobile */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>Icon graphics cannot be modified from the mobile app currently. Please use the web dashboard to upload graphics.</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveBtn, saving && styles.disabledBtn]} 
            onPress={handleSubmit}
            disabled={saving}
          >
            <Save size={16} color="#ffffff" />
            <Text style={styles.saveBtnText}>
              {saving ? "Saving..." : isEdit ? "Update Category" : "Save Category"}
            </Text>
          </TouchableOpacity>
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
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0f',
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
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 24,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d1d5db',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181824',
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
  noticeBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
    padding: 16,
  },
  noticeText: {
    color: '#fbbf24',
    fontSize: 12,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 24,
    gap: 12,
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});

export default AddCategory;
