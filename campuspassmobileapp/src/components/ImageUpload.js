import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Camera, X, Image as ImageIcon } from 'lucide-react-native';
import { useTheme } from '../utils/ThemeContext';

const ImageUpload = ({ onChange, preview = null, label = "Upload Image" }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const handleSelectImage = () => {
    // Parent can pass a picker callback or custom handler via onChange
    if (onChange) {
      onChange("pick");
    }
  };

  const handleRemoveImage = () => {
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <View style={styles.container}>
      {preview ? (
        <View style={styles.previewWrapper}>
          <Image source={{ uri: preview }} style={styles.previewImage} resizeMode="cover" />
          <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveImage}>
            <X size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.dropzone} onPress={handleSelectImage}>
          <View style={styles.iconCircle}>
            <Camera size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.dropzoneLabel}>{label}</Text>
          <Text style={styles.dropzoneSub}>Tap to select or take photo (PNG, JPG max 5MB)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      marginVertical: 4,
    },
    dropzone: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropzoneLabel: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    dropzoneSub: {
      color: theme.colors.textMuted,
      fontSize: 11,
      textAlign: 'center',
    },
    previewWrapper: {
      position: 'relative',
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      height: 180,
      backgroundColor: theme.colors.surface,
    },
    previewImage: {
      width: '100%',
      height: '100%',
    },
    removeBtn: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(239, 68, 68, 0.85)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default ImageUpload;
