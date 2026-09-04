import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export default function Navbar({ user, activeTab, setActiveTab, onSignOut }) {
  return (
    <View style={styles.navContainer}>
      <View style={styles.navLinks}>
        <TouchableOpacity onPress={() => setActiveTab('Home')}>
          <Text style={[styles.navText, activeTab === 'Home' && styles.activeText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('AI Tutor')}>
          <Text style={[styles.navText, activeTab === 'AI Tutor' && styles.activeText]}>AI Tutor</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Grammar History')}>
          <Text style={[styles.navText, activeTab === 'Grammar History' && styles.activeText]}>Grammar History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Profile Settings')}>
          <Text style={[styles.navText, activeTab === 'Profile Settings' && styles.activeText]}>Profile Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.authContainer}>
        {user ? (
          <TouchableOpacity style={styles.authButton} onPress={onSignOut}>
            <Text style={styles.authButtonText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.authButton} onPress={() => setActiveTab('Login')}>
              <Text style={styles.authButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.authButton, styles.signupBtn]} onPress={() => setActiveTab('Signup')}>
              <Text style={styles.authButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    height: 60,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  navLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  navText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '500',
  },
  activeText: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  authContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  authButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1E293B',
    borderRadius: 6,
  },
  signupBtn: {
    backgroundColor: '#3B82F6',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
