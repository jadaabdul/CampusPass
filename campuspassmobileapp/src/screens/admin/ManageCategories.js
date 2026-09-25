import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, Tag, Search, Pencil, Trash2 } from 'lucide-react-native';

import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { formatDate } from '../../utils/formatters';

const ManageCategories = () => {
  const navigation = useNavigation();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCategories: 0,
    totalPages: 1,
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();

      const res = await api.get("/categories", { params });
      const data = res.data.data;

      setCategories(Array.isArray(data.categories) ? data.categories : Array.isArray(data) ? data : []);
      setPagination(
        data.pagination || {
          page: 1,
          limit: 10,
          totalCategories: data.length || 0,
          totalPages: 1,
        }
      );
    } catch (error) {
      Alert.alert("Error", "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

  const handleSearch = () => {
    setPage(1);
    setSearch(searchText.trim());
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;
    try {
      setDeleting(true);
      await api.delete(`/categories/${deleteCategory._id}`);
      Alert.alert("Success", "Category deleted!");
      setDeleteCategory(null);
      fetchCategories();
    } catch (error) {
      Alert.alert("Error", "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
      <PageHeader
        breadcrumb="SYSTEM CATEGORIES"
        title="Event Categories"
        subtitle="Manage category tags used by organizers to classify campus events."
        action={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("AddCategory")}
          >
            <Plus size={16} color="#ffffff" />
            <Text style={styles.addBtnText}>Add New Category</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={16} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            placeholder="Search category name..."
            placeholderTextColor="#6b7280"
          />
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#60a5fa" />
        </View>
      ) : categories.length === 0 ? (
        <EmptyState
          title="No Categories Found"
          description="Create your first event category to help organizers tag their fests."
          icon={Tag}
          action={
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => navigation.navigate("AddCategory")}
            >
              <Text style={styles.emptyAddBtnText}>Add Category</Text>
            </TouchableOpacity>
          }
        />
      ) : (
        <View style={styles.grid}>
          {categories.map((cat) => (
            <View key={cat._id} style={styles.card}>
              <View style={styles.cardInfo}>
                <View style={styles.iconContainer}>
                  {cat.icon?.url ? (
                    <Image source={{ uri: cat.icon.url }} style={styles.iconImage} />
                  ) : (
                    <Tag size={20} color="#60a5fa" />
                  )}
                </View>

                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{cat.name}</Text>
                  <Text style={styles.cardSubtitle}>Created {formatDate(cat.createdAt)}</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => navigation.navigate('AddCategory', { id: cat._id })}
                >
                  <Pencil size={16} color="#9ca3af" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconBtn, styles.deleteIconBtn]}
                  onPress={() => setDeleteCategory(cat)}
                >
                  <Trash2 size={16} color="#fb7185" />
                </TouchableOpacity>
              </View>
            </View>
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

      <Modal
        isOpen={Boolean(deleteCategory)}
        onClose={() => setDeleteCategory(null)}
        title="Delete Category"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Are you sure you want to delete <Text style={styles.modalBoldText}>{deleteCategory?.name}</Text>?
          </Text>
          <Text style={styles.modalWarning}>Events using this category tag may require updating.</Text>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setDeleteCategory(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalDelete} 
              disabled={deleting} 
              onPress={handleDelete}
            >
              <Text style={styles.modalDeleteText}>{deleting ? "Deleting..." : "Delete Category"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 12,
    marginBottom: 24,
    gap: 12,
  },
  searchInputWrapper: {
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
    height: 40,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18, 18, 26, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 16,
  },
  cardInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 16,
  },
  iconContainer: {
    height: 48,
    width: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  deleteIconBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
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

export default ManageCategories;
