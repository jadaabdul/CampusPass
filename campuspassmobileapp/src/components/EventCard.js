import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Calendar, MapPin, Users, Eye, Pencil, Trash2, Send, Ban, Tag } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import StatusBadge from './StatusBadge';
import { formatDate, formatCurrency } from '../utils/formatters';
import { useTheme } from '../utils/ThemeContext';

const EventCard = ({
  event,
  showActions = false,
  compact = false,
  onView,
  onEdit,
  onPublish,
  onCancel,
  onDelete,
  onRemoveFavorite,
}) => {
  const user = useSelector((state) => state.auth.user);
  const role = user?.role || 'user';
  const { theme } = useTheme();
  const styles = getStyles(theme, compact);

  if (!event) return null;

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.poster || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80" }}
          style={styles.image}
        />
        <View style={styles.overlay} />
        
        {!compact && (
          <View style={styles.categoryBadge}>
            <Tag size={12} color={theme.colors.surface} />
            <Text style={styles.categoryText}>{event.category?.name || "Event"}</Text>
          </View>
        )}

        {event.status && !compact && (
          <View style={styles.statusBadge}>
            <StatusBadge status={event.status} />
          </View>
        )}

        {!compact && (
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{formatCurrency(event.price)}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={compact ? 1 : 2}>{event.title}</Text>
        
        {!compact && (
          <Text style={styles.description} numberOfLines={2}>
            {event.description || "Join us for an exciting campus event!"}
          </Text>
        )}

        <View style={styles.footerRow}>
          <View style={styles.dateContainer}>
            <Calendar size={14} color={theme.colors.textMuted} />
            <Text style={styles.dateText}>{formatDate(event.startDate)}</Text>
          </View>
          
          {(!showActions && !onRemoveFavorite) && (
            <TouchableOpacity style={styles.joinBtn} onPress={onView}>
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
          )}
        </View>

        {!compact && !showActions && (
           <View style={styles.infoRow}>
             <MapPin size={14} color={theme.colors.textMuted} />
             <Text style={styles.infoText} numberOfLines={1}>{event.venue?.name || "Campus Venue TBD"}</Text>
           </View>
        )}

        {showActions ? (
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionBtn} onPress={onView}>
              <Eye size={14} color={theme.colors.text} />
              <Text style={styles.actionText}>View</Text>
            </TouchableOpacity>

            {role === "organizer" && (
              <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
                <Pencil size={14} color={theme.colors.text} />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
            )}

            {role === "admin" && event.status !== "published" && (
              <TouchableOpacity style={[styles.actionBtn, styles.publishBtn]} onPress={onPublish}>
                <Send size={14} color="#34d399" />
                <Text style={styles.publishText}>Publish</Text>
              </TouchableOpacity>
            )}

            {role === "organizer" && event.status === "published" && (
              <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={onCancel}>
                <Ban size={14} color="#fbbf24" />
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}

            {(role === "organizer" || role === "admin") && (
              <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn, { flex: 2 }]} onPress={onDelete}>
                <Trash2 size={14} color="#fb7185" />
                <Text style={styles.deleteText}>Delete Event</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : onRemoveFavorite ? (
          <View style={styles.userActions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={onView}>
              <Eye size={14} color={theme.colors.background} />
              <Text style={styles.primaryBtnText}>Explore Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.favBtn} onPress={() => onRemoveFavorite()}>
              <Trash2 size={16} color="#fb7185" />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const getStyles = (theme, compact) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginVertical: compact ? 0 : 12,
  },
  imageContainer: {
    height: compact ? 120 : 200,
    width: '100%',
    position: 'relative',
    backgroundColor: theme.colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  categoryBadge: {
    position: 'absolute',
    left: 16,
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusBadge: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  priceBadge: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: '900',
  },
  content: {
    padding: compact ? 12 : 20,
  },
  title: {
    fontSize: compact ? 14 : 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  description: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: compact ? 8 : 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: compact ? 10 : 12,
    color: theme.colors.textMuted,
    marginLeft: 6,
  },
  joinBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  joinBtnText: {
    color: theme.mode === 'dark' ? '#0F0F13' : '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  actionText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  publishBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  publishText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  cancelBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  cancelText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderColor: 'rgba(244, 63, 94, 0.2)',
    width: '100%',
    marginTop: 4,
  },
  deleteText: {
    color: '#fb7185',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  userActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
  },
  primaryBtnText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  favBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
});

export default EventCard;
