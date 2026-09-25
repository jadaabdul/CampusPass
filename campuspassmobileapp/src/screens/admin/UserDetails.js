import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, UserCog } from 'lucide-react-native';

import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';

const UserDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};

  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users/${id}`);
      const userData = res.data.data;
      setUser(userData);
      setRole(userData.role);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    try {
      setSaving(true);
      await api.patch(`/admin/users/${id}/role`, { role });
      Alert.alert("Success", "User role updated!");
      fetchUser();
    } catch (error) {
      Alert.alert("Error", "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const handleBlockToggle = async () => {
    try {
      setSaving(true);
      const endpoint = user.status === "blocked" ? `/admin/users/${id}/unblock` : `/admin/users/${id}/block`;
      await api.patch(endpoint);
      Alert.alert("Success", user.status === "blocked" ? "User unblocked" : "User blocked");
      fetchUser();
    } catch (error) {
      Alert.alert("Error", "Action failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading User Profile...</Text>
      </View>
    );
  }

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeft size={16} color="#d1d5db" />
        <Text style={styles.backBtnText}>Back to Users List</Text>
      </TouchableOpacity>

      <PageHeader
        breadcrumb="USER DETAILS"
        title={user.fullName}
        subtitle={`Account Management for ${user.email}`}
      />

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.fullName?.substring(0, 2).toUpperCase()}</Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.fullName}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge status={user.role} />
            <StatusBadge status={user.status === "blocked" ? "blocked" : "active"} />
          </View>
        </View>
      </View>

      <View style={styles.controlsCard}>
        <View style={styles.controlsHeader}>
          <UserCog size={18} color="#60a5fa" />
          <Text style={styles.controlsTitle}>Admin Moderation Controls</Text>
        </View>

        <View style={styles.controlSection}>
          <Text style={styles.controlLabel}>CHANGE ACCOUNT ROLE</Text>
          
          <View style={styles.roleSelector}>
            {/* Custom role selector instead of Picker to avoid extra dependencies if not available */}
            <View style={styles.roleOptions}>
              {['student', 'organizer'].map((r) => (
                <TouchableOpacity 
                  key={r}
                  style={[styles.roleOption, role === r && styles.roleOptionActive]}
                  onPress={() => setRole(r)}
                >
                  <Text style={[styles.roleOptionText, role === r && styles.roleOptionTextActive]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, saving && styles.disabledBtn]} 
              onPress={handleRoleUpdate}
              disabled={saving || role === user.role}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.controlSection}>
          <Text style={styles.controlLabel}>ACCOUNT STATUS ACTION</Text>
          <TouchableOpacity
            onPress={handleBlockToggle}
            disabled={saving}
            style={[
              styles.blockBtn, 
              user.status === "blocked" ? styles.unblockBtn : styles.blockBtn,
              saving && styles.disabledBtn
            ]}
          >
            <Text style={styles.blockBtnText}>
              {user.status === "blocked" ? "Unblock Account Access" : "Block User Account"}
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
  profileCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 24,
  },
  avatar: {
    height: 80,
    width: 80,
    borderRadius: 24,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  profileEmail: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  controlsCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 24,
  },
  controlsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 12,
    marginBottom: 24,
    gap: 8,
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  controlSection: {
    marginBottom: 24,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d1d5db',
    marginBottom: 12,
  },
  roleSelector: {
    gap: 12,
  },
  roleOptions: {
    flexDirection: 'row',
    backgroundColor: '#181824',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 4,
  },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  roleOptionActive: {
    backgroundColor: '#2563eb',
  },
  roleOptionText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: 'bold',
  },
  roleOptionTextActive: {
    color: '#ffffff',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  blockBtn: {
    backgroundColor: '#e11d48',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  unblockBtn: {
    backgroundColor: '#059669',
  },
  blockBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default UserDetails;
