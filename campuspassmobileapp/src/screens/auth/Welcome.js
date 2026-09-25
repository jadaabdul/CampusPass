import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LogIn, UserPlus } from 'lucide-react-native';
import Logo from '../../components/Logo';
import { useTheme } from '../../utils/ThemeContext';

const Welcome = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80' }}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Logo size="large" />
            <Text style={styles.subtitle}>
              Your all-in-one platform for discovering, managing, and attending campus events.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.loginBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate("Login")}
            >
              <LogIn size={20} color={theme.colors.surface} />
              <Text style={[styles.loginBtnText, { color: theme.colors.surface }]}>Log In to Account</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.registerBtn}
              onPress={() => navigation.navigate("Register")}
            >
              <UserPlus size={20} color="#ffffff" />
              <Text style={styles.registerBtnText}>Create New Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.75)',
    justifyContent: 'flex-end',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
    gap: 32,
  },
  header: {
    gap: 16,
    alignItems: 'center',
  },
  subtitle: {
    color: '#d1d5db',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  actions: {
    gap: 14,
    width: '100%',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  registerBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Welcome;
