import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../api/supabase';

export default function AuthScreen({ onAuthSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // 1. Register user securely in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        alert(error.message || 'Signup failed. Please try again.');
        setLoading(false);
        return;
      }

      if (!data.user) {
        alert('Signup failed. User could not be created.');
        setLoading(false);
        return;
      }

      alert('Account created successfully! Please log in with your credentials.');
      
      // 2. Safely switch to login screen so they log in with password
      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
    } catch (err) {
      console.log('Signup error:', err);
      alert('An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop' }} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#8FA39D"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Create a password"
                placeholderTextColor="#8FA39D"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#8FA39D"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          <TouchableOpacity 
            style={[styles.signupButton, loading && { opacity: 0.7 }]} 
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#111715" />
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={onSwitchToLogin}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' ? {
      height: 'calc(100vh - 56px)',
      maxHeight: 'calc(100vh - 56px)',
    } : {}),
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 14, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(17, 23, 21, 0.92)',
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 450,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  title: {
    color: '#FFCB9A',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#E8B486',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(23, 33, 30, 0.9)',
    color: '#E1F2EC',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 33, 30, 0.9)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#0A3B3D',
  },
  passwordInput: {
    flex: 1,
    color: '#E1F2EC',
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeBtn: {
    paddingHorizontal: 14,
  },
  eyeText: {
    fontSize: 18,
  },
  signupButton: {
    backgroundColor: '#C29B72',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
    shadowColor: '#C29B72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  signupButtonText: {
    color: '#111715',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#8FA39D',
    fontSize: 14,
  },
  loginLink: {
    color: '#FFCB9A',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
