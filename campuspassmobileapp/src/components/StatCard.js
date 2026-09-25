import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "#3b82f6", // default blue
  loading = false,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          
          {loading ? (
            <ActivityIndicator animating={true} style={styles.loader} size="small" color={color} />
          ) : (
            <Text style={styles.value}>{value}</Text>
          )}

          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : null}

          {trend ? (
            <View style={styles.trendContainer}>
              <Text style={styles.trendText}>{trend}</Text>
            </View>
          ) : null}
        </View>

        {Icon && (
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Icon size={26} color="#fff" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    padding: 24,
    marginVertical: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#9ca3af',
    marginBottom: 8,
  },
  loader: {
    alignItems: 'flex-start',
    height: 36,
  },
  value: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#34d399',
  },
  iconContainer: {
    height: 56,
    width: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StatCard;
