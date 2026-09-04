import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <View style={styles.navbar}>
      {/* Left Side: 3 Navigation Buttons linked to exact screens */}
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

      {/* Right Side: Completely Empty */}
      <View style={styles.navRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 18,
    backgroundColor: 'rgba(7, 13, 16, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(219, 176, 140, 0.15)',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
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
  },
});
