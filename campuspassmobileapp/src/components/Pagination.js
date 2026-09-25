import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.arrowButton, currentPage === 1 && styles.disabled]}
        disabled={currentPage === 1}
        onPress={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={18} color={currentPage === 1 ? "#4b5563" : "#d1d5db"} />
      </TouchableOpacity>

      <View style={styles.pagesContainer}>
        {getPages().map((page, index) => (
          page === "..." ? (
            <View key={`ellipsis-${index}`} style={styles.pageButton}>
              <Text style={styles.ellipsis}>...</Text>
            </View>
          ) : (
            <TouchableOpacity
              key={`page-${page}`}
              style={[styles.pageButton, currentPage === page && styles.activePageButton]}
              onPress={() => onPageChange(page)}
            >
              <Text style={[styles.pageText, currentPage === page && styles.activePageText]}>
                {page}
              </Text>
            </TouchableOpacity>
          )
        ))}
      </View>

      <TouchableOpacity
        style={[styles.arrowButton, currentPage === totalPages && styles.disabled]}
        disabled={currentPage === totalPages}
        onPress={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={18} color={currentPage === totalPages ? "#4b5563" : "#d1d5db"} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  arrowButton: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  disabled: {
    opacity: 0.4,
  },
  pagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  pageButton: {
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  activePageButton: {
    backgroundColor: '#2563eb',
  },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
  },
  activePageText: {
    color: '#ffffff',
  },
  ellipsis: {
    color: '#6b7280',
    fontSize: 16,
  },
});

export default Pagination;
