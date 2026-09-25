import React, { useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ArrowRight, Ticket, Bell, User } from 'lucide-react-native';
import api from '../../api/axios';
import { useTheme } from '../../utils/ThemeContext';
import { getInitials } from '../../utils/formatters';

import EventCard from '../../components/EventCard';
import SearchFilterBar from '../../components/SearchFilterBar';
import EmptyState from '../../components/EmptyState';

const Home = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [eventsRes, categoriesRes] = await Promise.allSettled([
        api.get("/events?status=published"),
        api.get("/categories"),
      ]);

      if (eventsRes.status === "fulfilled") {
        setEvents(eventsRes.value.data.data || []);
      }
      if (categoriesRes.status === "fulfilled") {
        setCategories(categoriesRes.value.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchInitialData();
    }, [])
  );

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory
      ? evt.category?._id === selectedCategory || evt.category?.name === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  const initials = getInitials(user?.fullName);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* App Header */}
        <View style={styles.appHeader}>
          <Text style={styles.logoText}>CampusPass</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Main Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            Campus <Text style={{ color: theme.colors.primary }}>Events</Text>
          </Text>
        </View>

        {/* Search & Category Filter */}
        <SearchFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          placeholder="Search"
        />

        {/* Featured Events */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Events</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              title="No events found"
              description="We couldn't find any events matching your search."
            />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {filteredEvents.map((evt) => (
                <TouchableOpacity 
                  key={evt._id || evt.id} 
                  onPress={() => navigation.navigate("EventDetails", { id: evt._id || evt.id })}
                  style={{ width: 280, marginRight: 16 }}
                >
                  <EventCard event={evt} compact />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Trending Categories (Visual grid style from mockup) */}
        {!searchTerm && categories.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Categories</Text>
            </View>
            <View style={styles.categoryGrid}>
               {categories.slice(0, 4).map((cat, idx) => (
                 <TouchableOpacity key={cat._id || cat.id} style={styles.trendCatCard} onPress={() => setSelectedCategory(cat._id || cat.name)}>
                    <View style={styles.trendCatImagePlaceholder}>
                      {/* Image placeholder with category tint */}
                    </View>
                    <Text style={styles.trendCatText}>{cat.name}</Text>
                 </TouchableOpacity>
               ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3A683', // Peach color for avatar to match mockup
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  titleContainer: {
    marginBottom: 8,
  },
  mainTitle: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  sectionContainer: {
    gap: 12,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  horizontalScroll: {
    paddingBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trendCatCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    height: 100,
  },
  trendCatImagePlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  trendCatText: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  }
});

export default Home;
