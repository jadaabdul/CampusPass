import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Search, ChevronRight, User } from 'lucide-react-native';

import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';

const ManageUsers = () => {
  const navigation = useNavigation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const [role, setRole] = useState("all");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 1,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (role !== "all") params.role = role;

      const res = await api.get("/admin/users", { params });
      const data = res.data.data;

      setUsers(Array.isArray(data.users) ? data.users : []);
      setPagination(
        data.pagination || {
          page: 1,
          limit: 10,
          totalUsers: 0,
          totalPages: 1,
        }
      );
    } catch (error) {
      Alert.alert("Error", "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [page, role, search]);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const handleSearch = () => {
    setPage(1);
    setSearch(searchText.trim());
  };

  const handleFilter = (selectedRole) => {
    setRole(selectedRole);
    setPage(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
      <PageHeader
        breadcrumb="USER MODERATION"
        title="User Management"
        subtitle="View registered students, event organizers, and system admins across CampusPass."
      />

      <View style={styles.controlsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <View style={styles.filtersWrapper}>
            {[
              { label: "All Users", value: "all" },
              { label: "Students", value: "student" },
              { label: "Organizers", value: "organizer" },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => handleFilter(item.value)}
                style={[
                  styles.filterBtn,
                  role === item.value ? styles.filterBtnActive : styles.filterBtnInactive
                ]}
              >
                <Text style={role === item.value ? styles.filterTextActive : styles.filterTextInactive}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={16} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              placeholder="Search by name or email..."
              placeholderTextColor="#6b7280"
            />
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#60a5fa" />
        </View>
      ) : users.length === 0 ? (
        <EmptyState
          title="No Users Found"
          description="There are no user accounts matching your criteria."
          icon={User}
        />
      ) : (
        <View style={styles.listContainer}>
          {users.map((user) => (
            <TouchableOpacity
              key={user._id}
              style={styles.userCard}
              onPress={() => navigation.navigate('UserDetails', { id: user._id })}
            >
              <View style={styles.userInfo}>
                <View style={styles.userTitleRow}>
                  <Text style={styles.userName} numberOfLines={1}>{user.fullName}</Text>
                  <StatusBadge status={user.role} />
                </View>
                <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
              </View>

              <View style={styles.userActions}>
                <StatusBadge status={user.status === "blocked" ? "blocked" : "active"} />
                <ChevronRight size={18} color="#6b7280" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!loading && pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
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
  controlsContainer: {
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filtersWrapper: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterBtnInactive: {
    backgroundColor: '#181824',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterTextActive: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterTextInactive: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181824',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#ffffff',
    fontSize: 12,
  },
  searchBtn: {
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  searchBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  listContainer: {
    backgroundColor: 'rgba(18, 18, 26, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  userInfo: {
    flex: 1,
    marginRight: 16,
  },
  userTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    flexShrink: 1,
  },
  userEmail: {
    fontSize: 12,
    color: '#9ca3af',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});

export default ManageUsers;
