import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Switch, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { User, KeyRound, Save, Moon, Sun, CalendarDays, Ticket, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../../utils/ThemeContext';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { loginSuccess } from '../../redux/authSlice';
import { getInitials } from '../../utils/formatters';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = getStyles(theme);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [stats, setStats] = useState({ eventsCount: 0, ticketsCount: 0 });
  const [imgError, setImgError] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    mobile: user?.mobile || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        if (user?.role === "student") {
          const res = await api.get("/users/bookings");
          const bookings = res.data.data || [];
          setStats({
            eventsCount: new Set(bookings.map((b) => b.eventId?._id || b.eventId)).size,
            ticketsCount: bookings.reduce((sum, b) => sum + (b.seatsCount || b.quantity || 1), 0),
          });
        } else if (user?.role === "organizer") {
          const res = await api.get("/events/organizer/my-events");
          const events = res.data.data || [];
          setStats({
            eventsCount: events.length,
            ticketsCount: events.reduce((sum, e) => sum + (e.bookedSeats || 0), 0),
          });
        } else if (user?.role === "admin") {
          const res = await api.get("/events/admin/all");
          const events = res.data.data || [];
          setStats({
            eventsCount: events.length,
            ticketsCount: events.reduce((sum, e) => sum + (e.bookedSeats || 0), 0),
          });
        }
      } catch (err) {
        console.log("Stats error:", err);
      }
    };

    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    if (typeof imageData === "string") {
      if (imageData.startsWith("http://") || imageData.startsWith("https://") || imageData.startsWith("data:")) {
        return imageData;
      }
      return `${api.defaults.baseURL}/${imageData.replace(/^\//, "")}`;
    }
    if (typeof imageData === "object") {
      if (imageData.url) return getImageUrl(imageData.url);
      if (imageData.secure_url) return imageData.secure_url;
      if (imageData.path) return getImageUrl(imageData.path);
    }
    return null;
  };

  const handleProfileSubmit = async () => {
    try {
      setSavingProfile(true);
      const res = await api.put("/users/profile", profileForm);
      const updatedUser = res.data.data;

      dispatch(loginSuccess({ token, user: updatedUser }));
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      Alert.alert("Error", "Please fill in both current and new password");
      return;
    }
    try {
      setSavingPassword(true);
      await api.put("/users/change-password", passwordForm);
      Alert.alert("Success", "Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Password change failed");
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = getInitials(user?.fullName);
  const profileImageUrl = getImageUrl(user?.profileImage);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <PageHeader
          breadcrumb="ACCOUNT & SETTINGS"
          title="Profile Settings"
          subtitle="Manage your profile information, password, and system privileges."
        />

        {/* Profile Overview Card */}
        <View style={styles.profileOverviewCard}>
          <View style={styles.avatar}>
            {profileImageUrl && !imgError ? (
              <Image 
                source={{ uri: profileImageUrl }} 
                style={styles.avatarImage} 
                onError={() => setImgError(true)}
              />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.fullName}</Text>
              <StatusBadge status={user?.role || "student"} />
            </View>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.statusText}>
              Account Status: <Text style={styles.statusActive}>{user?.status || "Active & Verified"}</Text>
            </Text>
          </View>
        </View>

        {/* Account Activity Section */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <CalendarDays size={18} color={theme.colors.primary} />
            <Text style={styles.formTitle}>Account Activity</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <CalendarDays size={20} color={theme.colors.primary} />
              <Text style={styles.statNumber}>{stats.eventsCount}</Text>
              <Text style={styles.statLabel}>
                {user?.role === "organizer"
                  ? "Events Created"
                  : user?.role === "admin"
                  ? "Total Events"
                  : "Events Joined"}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Ticket size={20} color={theme.colors.primary} />
              <Text style={styles.statNumber}>{stats.ticketsCount}</Text>
              <Text style={styles.statLabel}>
                {user?.role === "organizer"
                  ? "Tickets Sold"
                  : user?.role === "admin"
                  ? "Total Bookings"
                  : "Tickets Purchased"}
              </Text>
            </View>

            <View style={styles.statBox}>
              <ShieldCheck size={20} color={theme.colors.primary} />
              <Text style={styles.statNumber}>{user?.status ? user.status : "Active"}</Text>
              <Text style={styles.statLabel}>Account Status</Text>
            </View>
          </View>
        </View>

        {/* Appearance Settings */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            {isDark ? <Moon size={18} color={theme.colors.primary} /> : <Sun size={18} color={theme.colors.primary} />}
            <Text style={styles.formTitle}>Appearance</Text>
          </View>
          <View style={[styles.inputGroup, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <Text style={styles.label}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <User size={18} color={theme.colors.primary} />
            <Text style={styles.formTitle}>Personal Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={profileForm.fullName}
              onChangeText={(val) => setProfileForm({ ...profileForm, fullName: val })}
              placeholderTextColor="#6b7280"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email || ""}
              editable={false}
            />
            <Text style={styles.helperText}>Email cannot be modified.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              value={profileForm.mobile}
              onChangeText={(val) => setProfileForm({ ...profileForm, mobile: val })}
              placeholderTextColor="#6b7280"
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryBtn, savingProfile && styles.disabledBtn]} 
            onPress={handleProfileSubmit}
            disabled={savingProfile}
          >
            {savingProfile ? <ActivityIndicator color="#fff" size="small" /> : <Save size={16} color="#fff" />}
            <Text style={styles.primaryBtnText}>{savingProfile ? "Saving..." : "Save Changes"}</Text>
          </TouchableOpacity>
        </View>

        {/* Password */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <KeyRound size={18} color={theme.colors.primary} />
            <Text style={styles.formTitle}>Security & Password</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={passwordForm.currentPassword}
              onChangeText={(val) => setPasswordForm({ ...passwordForm, currentPassword: val })}
              placeholder="••••••••"
              placeholderTextColor="#6b7280"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={passwordForm.newPassword}
              onChangeText={(val) => setPasswordForm({ ...passwordForm, newPassword: val })}
              placeholder="••••••••"
              placeholderTextColor="#6b7280"
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.secondaryBtn, savingPassword && styles.disabledBtn]} 
            onPress={handlePasswordSubmit}
            disabled={savingPassword}
          >
            {savingPassword ? <ActivityIndicator color="#fff" size="small" /> : <KeyRound size={16} color="#fff" />}
            <Text style={styles.secondaryBtnText}>{savingPassword ? "Updating..." : "Update Password"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 24,
  },
  profileOverviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 24,
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: theme.colors.surface,
    fontSize: 24,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  userName: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  userEmail: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  statusActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    gap: 16,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 12,
    marginBottom: 4,
  },
  formTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'flex-start',
    gap: 6,
  },
  statNumber: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.text,
    fontSize: 14,
  },
  disabledInput: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    color: theme.colors.textMuted,
  },
  helperText: {
    color: theme.colors.textMuted,
    fontSize: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  primaryBtnText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  secondaryBtnText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});

export default Profile;
