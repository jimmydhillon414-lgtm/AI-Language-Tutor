import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Navbar({ user, activeTab, setActiveTab, onOpenLogin, onOpenSignup, onSignOut }) {
  // If user is NOT logged in (Public Home Page Navbar)
  if (!user) {
    return (
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <Text style={styles.logoText}>AI TUTOR</Text>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity style={styles.btnLogin} onPress={onOpenLogin}>
            <Text style={styles.btnLoginText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSignup} onPress={onOpenSignup}>
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
        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'AI Tutor' && styles.activeNavBtn]}
          onPress={() => setActiveTab('AI Tutor')}
        >
          <Text style={[styles.navBtnText, activeTab === 'AI Tutor' && styles.activeNavBtnText]}>AI Tutor</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'Grammar History' && styles.activeNavBtn]}
          onPress={() => setActiveTab('Grammar History')}
        >
          <Text style={[styles.navBtnText, activeTab === 'Grammar History' && styles.activeNavBtnText]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'Profile Settings' && styles.activeNavBtn]}
          onPress={() => setActiveTab('Profile Settings')}
        >
          <Text style={[styles.navBtnText, activeTab === 'Profile Settings' && styles.activeNavBtnText]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Right side: Clean, with Logout or User info */}
      <View style={styles.navRight}>
        <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
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
    paddingVertical: 16,
    backgroundColor: 'rgba(7, 13, 16, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(219, 176, 140, 0.15)',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  logoText: {
    color: '#FFCB9A',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.5,
  },
  navBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(219, 176, 140, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.2)',
  },
  activeNavBtn: {
    backgroundColor: 'rgba(219, 176, 140, 0.2)',
    borderColor: '#FFCB9A',
  },
  navBtnText: {
    color: '#cbd5e0',
    fontSize: 13,
    fontWeight: '500',
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
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 6,
  },
  btnLoginText: {
    color: '#FFCB9A',
    fontSize: 13,
  },
  btnSignup: {
    backgroundColor: '#FFCB9A',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 6,
  },
  btnSignupText: {
    color: '#070D10',
    fontSize: 13,
    fontWeight: '600',
  },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 6,
  },
  signOutText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
  },
});
