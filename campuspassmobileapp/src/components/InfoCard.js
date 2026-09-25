import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InfoCard = ({
  icon: Icon,
  title,
  value,
  iconColor = "#60a5fa", // equivalent to text-blue-400
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <View style={styles.iconWrapper}>
          <Icon size={22} color={iconColor} />
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    marginVertical: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 16,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  }
});

export default InfoCard;
