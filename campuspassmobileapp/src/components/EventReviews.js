import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Star, MessageSquare, Send, User } from 'lucide-react-native';
import api from '../api/axios';

const EventReviews = ({ eventId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/event/${eventId}`);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [eventId]);

  const handleSubmit = async () => {
    if (!rating) return;
    try {
      setSubmitting(true);
      await api.post("/reviews", {
        eventId,
        rating,
        comment,
      });
      setRating(5);
      setComment("");
      fetchReviews();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count, size = 14) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star
        key={idx}
        size={size}
        color={idx < count ? "#eab308" : "#4b5563"}
        fill={idx < count ? "#eab308" : "transparent"}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MessageSquare size={20} color="#60a5fa" />
        <Text style={styles.headerTitle}>Event Reviews</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{reviews.length}</Text>
        </View>
      </View>

      {user?.role === "student" && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Write a Review</Text>
          
          <Text style={styles.label}>RATING</Text>
          <View style={styles.ratingInputRow}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TouchableOpacity key={idx} onPress={() => setRating(idx + 1)}>
                <Star
                  size={24}
                  color={idx < rating ? "#eab308" : "#4b5563"}
                  fill={idx < rating ? "#eab308" : "transparent"}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>COMMENT (OPTIONAL)</Text>
          <TextInput
            style={styles.input}
            value={comment}
            onChangeText={setComment}
            placeholder="Share your experience..."
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity 
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? "Submitting..." : "Submit Review"}
            </Text>
            <Send size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.reviewsList}>
        {loading ? (
          <ActivityIndicator size="large" color="#60a5fa" style={{ marginTop: 20 }} />
        ) : reviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No reviews yet. Be the first to review this event!</Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View key={review._id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.userInfo}>
                  {review.userId?.profileImage ? (
                    <Image source={{ uri: review.userId.profileImage }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <User size={18} color="#60a5fa" />
                    </View>
                  )}
                  <View style={styles.userText}>
                    <Text style={styles.userName}>{review.userId?.fullName || "Anonymous"}</Text>
                    <Text style={styles.dateText}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.starsRow}>{renderStars(review.rating)}</View>
              </View>
              {review.comment ? (
                <Text style={styles.commentText}>{review.comment}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d1d5db',
  },
  formContainer: {
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginBottom: 8,
  },
  ratingInputRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#181824',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    color: '#ffffff',
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 12,
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewsList: {
    gap: 16,
  },
  emptyState: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: 'rgba(18, 18, 26, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userText: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dateText: {
    fontSize: 10,
    color: '#6b7280',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
});

export default EventReviews;
