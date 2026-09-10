import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { supabase } from '../api/supabase';
import AppBackground from '../components/AppBackground';

export default function AuthScreen({ onAuthSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

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

      setSuccessBanner('Account Created Successfully');
      setTimeout(() => {
        if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      }, 1500);

    } catch (err) {
      console.log('Signup error:', err);
      alert('An unexpected error occurred during signup.');
      setLoading(false);
    }
  };

  return (
    <AppBackground>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>CREATE ACCOUNT</Text>

          {successBanner ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successBanner}</Text>
            </View>
          ) : null}
          
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
                activeOpacity={0.7}
              >
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your password"
                placeholderTextColor="#8FA39D"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.signupButton, loading && { opacity: 0.7 }]} 
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
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
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(15, 23, 21, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 203, 154, 0.3)',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 450,
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    } : {}),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    color: '#FFCB9A',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  successText: {
    color: '#34D399',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.25)', // Transparent input field
    color: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 203, 154, 0.35)',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 203, 154, 0.35)',
  },
  passwordInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeBtn: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeText: {
    fontSize: 18,
  },
  signupButton: {
    backgroundColor: 'rgba(255, 203, 154, 0.2)', // Semi-transparent button
    borderWidth: 1.5,
    borderColor: 'rgba(255, 203, 154, 0.6)',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  signupButtonText: {
    color: '#FFCB9A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#A3B8B0',
    fontSize: 14,
  },
  loginLink: {
    color: '#FFCB9A',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
