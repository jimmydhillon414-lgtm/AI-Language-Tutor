import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Navbar({ user, activeTab, setActiveTab, onSignOut, onOpenLogin, onOpenSignup }) {
  return (
    <View style={styles.navbar}>
      {/* Replaced Sirin Labs with Home */}
      <TouchableOpacity onPress={() => setActiveTab('Home')} style={styles.navLeft}>
        <Text style={styles.logoText}>Home</Text>
      </TouchableOpacity>

      <View style={styles.navRight}>
        <TouchableOpacity 
          style={styles.shopNowBtn}
          onPress={() => {
            if (!user) {
              onOpenLogin();
            } else {
              setActiveTab('AI Tutor');
            }
          }}
        >
          <Text style={styles.shopNowText}>SHOP NOW</Text>
        </TouchableOpacity>

        {user ? (
          <TouchableOpacity onPress={() => setActiveTab('Profile Settings')} style={styles.userProfileBadge}>
            <Text style={styles.userEmailText}>{user.email} ▾</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.btnLogin} onPress={onOpenLogin}>
              <Text style={styles.btnLoginText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSignup} onPress={onOpenSignup}>
              <Text style={styles.btnSignupText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.btnUpgrade} onPress={() => alert('Upgrade to Pro feature coming soon!')}>
          <Text style={styles.btnUpgradeText}>Upgrade to Pro</Text>
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
    paddingHorizontal: 40,
    paddingVertical: 18,
    backgroundColor: 'rgba(7, 13, 16, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(219, 176, 140, 0.15)',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFCB9A',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 2,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shopNowBtn: {
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: 'rgba(219, 176, 140, 0.05)',
  },
  shopNowText: {
    color: '#FFCB9A',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  userProfileBadge: {
    backgroundColor: 'rgba(17, 30, 27, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  userEmailText: {
    color: '#D1E8E2',
    fontSize: 13,
  },
  btnLogin: {
    borderWidth: 1,
    borderColor: 'rgba(219, 176, 140, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  btnLoginText: {
    color: '#FFCB9A',
    fontSize: 13,
  },
  btnSignup: {
    backgroundColor: '#FFCB9A',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  btnSignupText: {
    color: '#070D10',
    fontSize: 13,
    fontWeight: '600',
  },
  btnUpgrade: {
    backgroundColor: '#D9B08C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnUpgradeText: {
    color: '#070D10',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
