import React, { useState, useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Grid, List } from 'lucide-react-native';
import api from '../../api/axios';

import EventCard from '../../components/EventCard';
import PageHeader from '../../components/PageHeader';
import SearchFilterBar from '../../components/SearchFilterBar';
import EmptyState from '../../components/EmptyState';
import { useTheme } from '../../utils/ThemeContext';

const BrowseEvents = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPriceFilter, setSelectedPriceFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events?status=published");
      setEvents(res.data.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory
      ? evt.category?._id === selectedCategory || evt.category?.name === selectedCategory
      : true;

    let matchesPrice = true;
    if (selectedPriceFilter === "free") {
      matchesPrice = Number(evt.price || 0) === 0;
    } else if (selectedPriceFilter === "paid") {
      matchesPrice = Number(evt.price || 0) > 0;
    }

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <PageHeader
              breadcrumb="DISCOVER & EXPLORE"
              title="Browse Campus Events"
              subtitle="Filter through hackathons, cultural nights, and workshops."
            />
          </View>
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              onPress={() => setViewMode("grid")}
              style={[styles.toggleBtn, viewMode === "grid" && styles.toggleBtnActive]}
            >
              <Grid size={16} color={viewMode === "grid" ? theme.colors.surface : theme.colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode("list")}
              style={[styles.toggleBtn, viewMode === "list" && styles.toggleBtnActive]}
            >
              <List size={16} color={viewMode === "list" ? theme.colors.surface : theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <SearchFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          placeholder="Filter by event title or venue..."
        />

        <View style={styles.priceFilterContainer}>
          {["all", "free", "paid"].map(priceOpt => (
            <TouchableOpacity
              key={priceOpt}
              style={[
                styles.priceChip,
                selectedPriceFilter === priceOpt && styles.priceChipActive
              ]}
              onPress={() => setSelectedPriceFilter(priceOpt)}
            >
              <Text style={[
                styles.priceText,
                selectedPriceFilter === priceOpt && styles.priceTextActive
              ]}>
                {priceOpt === "all" ? "All Prices" : priceOpt === "free" ? "Free Events" : "Paid Passes"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : filteredEvents.length === 0 ? (
          <View style={{ marginTop: 24 }}>
            <EmptyState
              title="No Matching Events"
              description="We couldn't find any events matching your selected filters. Try resetting your search."
              action={
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setSelectedPriceFilter("all");
                  }}
                >
                  <Text style={styles.clearBtnText}>Reset All Filters</Text>
                </TouchableOpacity>
              }
            />
          </View>
        ) : (
          <View style={styles.eventsGrid}>
            {filteredEvents.map((evt) => (
              <TouchableOpacity 
                key={evt._id || evt.id} 
                onPress={() => navigation.navigate("EventDetails", { id: evt._id || evt.id })}
              >
                <EventCard event={evt} layout={viewMode} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    viewModeToggle: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      padding: 4,
      marginTop: 8,
    },
    toggleBtn: {
      padding: 8,
      borderRadius: 12,
    },
    toggleBtnActive: {
      backgroundColor: theme.colors.primary,
    },
    priceFilterContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 20,
    },
    priceChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    priceChipActive: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: theme.colors.primary,
    },
    priceText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: 'bold',
    },
    priceTextActive: {
      color: theme.colors.primary,
    },
    eventsGrid: {
      gap: 16,
    },
    clearBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 16,
      marginTop: 16,
    },
    clearBtnText: {
      color: theme.colors.surface,
      fontWeight: 'bold',
    },
  });

export default BrowseEvents;
