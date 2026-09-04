import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Navbar({ user, activeTab, setActiveTab, onOpenLogin, onOpenSignup }) {
  return (
    <View style={styles.navbar}>
      {/* Left side: If logged in show Home, History, Profile. If not, show Brand Logo */}
      <View style={styles.navLeft}>
        <TouchableOpacity onPress={() => setActiveTab('Home')}>
          <Text style={styles.logoText}>SIRIN LABS</Text>
        </TouchableOpacity>

        {user && (
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.navBtn, activeTab === 'Home' && styles.activeNavBtn]}
              onPress={() => setActiveTab('Home')}
            >
              <Text style={[styles.navBtnText, activeTab === 'Home' && styles.activeNavBtnText]}>Home</Text>
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
        )}
      </View>

      {/* Right side: Login/Signup if logged out, or User email badge if logged in */}
      <View style={styles.navRight}>
        {!user ? (
          <>
            <TouchableOpacity style={styles.btnLogin} onPress={onOpenLogin}>
              <Text style={styles.btnLoginText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSignup} onPress={onOpenSignup}>
              <Text style={styles.btnSignupText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.userBadge}>
            <Text style={styles.userEmailText}>{user.email}</Text>
          </View>
        )}
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
    paddingVertical: 15,
    backgroundColor: 'rgba(7, 13, 16, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(219, 176, 140, 0.15)',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  logoText: {
    color: '#FFCB9A',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeNavBtn: {
    backgroundColor: 'rgba(219, 176, 140, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.3)',
  },
  navBtnText: {
    color: '#a0aec0',
    fontSize: 13,
  },
  activeNavBtnText: {
    color: '#FFCB9A',
    fontWeight: '600',
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
  userBadge: {
    backgroundColor: 'rgba(17, 30, 27, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  userEmailText: {
    color: '#D1E8E2',
    fontSize: 12,
  },
});
