import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '../utils/ThemeContext';

const SearchFilterBar = ({
  searchTerm = "",
  onSearchChange,
  placeholder = "Search",
  categories = [],
  selectedCategory = "",
  onCategoryChange
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={searchTerm}
          onChangeText={onSearchChange}
          placeholder={placeholder}
          placeholderTextColor="#6b7280"
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => onSearchChange && onSearchChange("")} style={styles.clearButton}>
            <X size={16} color="#9ca3af" />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {categories && categories.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity 
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
            onPress={() => onCategoryChange && onCategoryChange("")}
          >
            <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>All</Text>
          </TouchableOpacity>
          
          {categories.map(cat => (
            <TouchableOpacity
              key={cat._id || cat.id}
              style={[
                styles.categoryChip, 
                selectedCategory === (cat._id || cat.name) && styles.categoryChipActive
              ]}
              onPress={() => onCategoryChange && onCategoryChange(cat._id || cat.name)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === (cat._id || cat.name) && styles.categoryTextActive
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    marginBottom: 16,
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 50,
  },
  searchIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  clearButton: {
    padding: 12,
  },
  categoryScroll: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryTextActive: {
    color: theme.mode === 'dark' ? '#0F0F13' : '#FFFFFF',
  }
});

export default SearchFilterBar;
