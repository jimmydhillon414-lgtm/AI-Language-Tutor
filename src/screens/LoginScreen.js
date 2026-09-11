import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { supabase } from '../api/supabase';

export default function LoginScreen({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePressLogin = async () => {
    if (!email.trim() || !password) {
      alert('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        alert(error.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      const user = data.user;

      try {
        await supabase.from('user_login_logs').insert({
          user_id: user.id,
          email: user.email,
          logged_in_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.log('Session log insert note:', dbErr);
      }

      if (onLogin) {
        onLogin(user.email);
      }

    } catch (err) {
      console.log('Login error:', err);
      alert('An unexpected error occurred during login.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.backgroundImage}>
      {/* Sharp Background Image Layer */}
      <div style={styles.bgImageWrapperStyle}>
        <img src={require('../../assets/tutor_girl.png.png')} style={styles.bgImageStyle} alt="Background" />
        <div style={styles.bgOverlayStyle} />
      </div>

      {Platform.OS === 'web' && (
        <style type="text/css">{`
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px rgba(0, 0, 0, 0.4) inset !important;
            -webkit-text-fill-color: #FFFFFF !important;
            transition: background-color 5000s ease-in-out 0s;
          }
        `}</style>
      )}
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>AI TUTOR</Text>
          
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
                placeholder="Enter your password"
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

          <TouchableOpacity 
            style={[styles.loginButton, loading && { opacity: 0.7 }]} 
            onPress={handlePressLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onSwitchToSignup}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    minHeight: '100vh',
    backgroundColor: '#0F1715',
    position: 'relative',
    overflowX: 'hidden',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  bgImageWrapperStyle: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  bgImageStyle: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'none',
  },
  bgOverlayStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 21, 0.45)',
  },
  container: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    backgroundColor: 'rgba(24, 44, 37, 0.95)',
    borderWidth: 1.5,
    borderColor: '#116466', 
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 450,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#FFCB9A',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(11, 29, 27, 0.9)',
    color: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#116466',
    fontSize: 16,
    ...(Platform.OS === 'web' ? {
      outlineStyle: 'none',
    } : {}),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 29, 27, 0.9)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#116466',
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    ...(Platform.OS === 'web' ? {
      outlineStyle: 'none',
      backgroundColor: 'transparent',
    } : {}),
  },
  eyeBtn: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  eyeText: {
    fontSize: 18,
  },
  loginButton: {
    backgroundColor: '#116466',
    borderWidth: 1.5,
    borderColor: '#FFCB9A',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loginButtonText: {
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
    color: '#D1E8E2',
    fontSize: 14,
  },
  signupLink: {
    color: '#FFCB9A',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
