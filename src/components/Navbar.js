import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

export default function Navbar({ user, activeTab, setActiveTab, onOpenLogin, onOpenSignup, onSignOut }) {
  // If user is NOT logged in (Public Home Page Navbar)
  if (!user) {
    return (
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <View style={styles.logoIconBox}>
            <Text style={styles.logoEmoji}>🧠✨</Text>
          </View>
          <View>
            <Text style={styles.logoText}>AI TUTOR</Text>
            <Text style={styles.logoSubtitle}>Language Companion</Text>
          </View>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.btnLogin} onPress={onOpenLogin} activeOpacity={0.8}>
            <Text style={styles.btnLoginText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSignup} onPress={onOpenSignup} activeOpacity={0.8}>
            <Text style={styles.btnSignupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If user IS logged in (Personalized Environment Navbar with exactly 3 options on left)
  return (
    <View style={styles.navbar}>
      <View style={styles.navLeft}>
        <View style={styles.logoIconBox}>
          <Text style={styles.logoEmoji}>🧠✨</Text>
        </View>

        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'AI Tutor' && styles.activeNavBtn]}
          onPress={() => setActiveTab('AI Tutor')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navBtnText, activeTab === 'AI Tutor' && styles.activeNavBtnText]}>AI Tutor</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'Grammar History' && styles.activeNavBtn]}
          onPress={() => setActiveTab('Grammar History')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navBtnText, activeTab === 'Grammar History' && styles.activeNavBtnText]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'Profile Settings' && styles.activeNavBtn]}
          onPress={() => setActiveTab('Profile Settings')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navBtnText, activeTab === 'Profile Settings' && styles.activeNavBtnText]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Right side: Clean, with Logout or User info */}
      <View style={styles.navRight}>
        <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 14,
    backgroundColor: 'rgba(10, 15, 14, 0.9)',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 203, 154, 0.2)',
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    } : {}),
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 203, 154, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 203, 154, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  logoEmoji: {
    fontSize: 18,
  },
  logoText: {
    color: '#FFCB9A',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 1.2,
  },
  logoSubtitle: {
    color: '#8FA39D',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  navBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 203, 154, 0.2)',
  },
  activeNavBtn: {
    backgroundColor: 'rgba(255, 203, 154, 0.15)',
    borderColor: '#FFCB9A',
  },
  navBtnText: {
    color: '#cbd5e0',
    fontSize: 13,
    fontWeight: '600',
  },
  activeNavBtnText: {
    color: '#FFCB9A',
    fontWeight: 'bold',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btnLogin: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 203, 154, 0.4)',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } : {}),
  },
  btnLoginText: {
    color: '#FFCB9A',
    fontSize: 14,
    fontWeight: '600',
  },
  btnSignup: {
    backgroundColor: '#FFCB9A',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFCB9A',
    shadowColor: '#FFCB9A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } : {}),
  },
  btnSignupText: {
    color: '#0F1715',
    fontSize: 14,
    fontWeight: 'bold',
  },
  signOutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
  },
  signOutText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '600',
  },
});
