import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FolderOpen } from 'lucide-react-native';

const EmptyState = ({
  title = "No data found",
  description = "There are no records matching your request right now.",
  icon: Icon = FolderOpen,
  action,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon size={32} color="#60a5fa" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 300,
    flexDirection: 'col',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(18, 18, 26, 0.4)',
    padding: 32,
    marginVertical: 16,
  },
  iconContainer: {
    height: 64,
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 24,
  },
});

export default EmptyState;
