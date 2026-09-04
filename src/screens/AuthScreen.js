import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { supabase } from '../api/supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  async function handleAuth() {
    setStatusMessage('');
    if (!email || !password) {
      setStatusMessage('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setStatusMessage(error.message);
        else setStatusMessage('Account created! Logging in...');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setStatusMessage(error.message);
      }
    } catch (err) {
      setStatusMessage(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
      
      {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="name@example.com"
        placeholderTextColor="#64748b"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#64748b"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Log In'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => { setIsSignUp(!isSignUp); setStatusMessage(''); }} 
        style={styles.switchBtn}
      >
        <Text style={styles.switchText}>
          {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', justifyContent: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 24, textAlign: 'center' },
  label: { color: '#94a3b8', fontSize: 14, marginBottom: 6 },
  statusText: { color: '#818cf8', backgroundColor: '#1e1b4b', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#1e293b', color: '#fff', padding: 14, borderRadius: 8, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
  button: { backgroundColor: '#6366f1', padding: 16, borderRadius: 8, marginTop: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switchBtn: { marginTop: 20, alignment: 'center' },
  switchText: { color: '#818cf8', textAlign: 'center', fontSize: 14 },
});