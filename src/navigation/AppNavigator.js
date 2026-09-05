import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import AuthScreen from '../screens/AuthScreen';

// Screens
import HomeScreen from '../screens/HomeScreen';
import TutorChatScreen from '../screens/TutorChatScreen';
import GrammarHistoryScreen from '../screens/GrammarHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

export default function AppNavigator() {
  const [user, setUser] = useState(null); // null means user is on public home page
  const [activeTab, setActiveTab] = useState('AI Tutor');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleLoginSuccess = (email) => {
    setUser({ email: email || 'Creatorstack9@gmail.com' });
    setShowAuthModal(false);
    setActiveTab('AI Tutor'); // Default open tab after login
  };

  const handleSignOut = () => {
    setUser(null);
  };

  const renderContent = () => {
    // If login or signup screen is active
    if (showAuthModal) {
      if (authMode === 'signup') {
        return (
          <AuthScreen 
            onAuthSuccess={handleLoginSuccess} 
            onSwitchToLogin={() => setAuthMode('login')} 
          />
        );
      }
      return (
        <LoginScreen 
          onLogin={handleLoginSuccess} 
          onSwitchToSignup={() => setAuthMode('signup')} 
        />
      );
    }

    // If user is NOT logged in, always show HomeScreen
    if (!user) {
      return (
        <HomeScreen 
          onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }} 
          onOpenSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }} 
        />
      );
    }

    // If user IS logged in, show respective tabs
    switch (activeTab) {
      case 'AI Tutor':
        return <TutorChatScreen />;
      case 'Grammar History':
        return <GrammarHistoryScreen />;
      case 'Profile Settings':
        return <ProfileScreen user={user} />;
      default:
        return <TutorChatScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Integrated Unified Navbar */}
      <View style={styles.navbar}>
        {!user ? (
          <>
            <View style={styles.navLeft}>
              <Text style={styles.logoText}>SIRIN</Text>
            </View>
            <View style={styles.navRight}>
              <TouchableOpacity 
                style={styles.btnLogin} 
                onPress={() => { setAuthMode('login'); setShowAuthModal(true); }}
              >
                <Text style={styles.btnLoginText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.btnSignup} 
                onPress={() => { setAuthMode('signup'); setShowAuthModal(true); }}
              >
                <Text style={styles.btnSignupText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
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

            <View style={styles.navRight}>
              <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070D10',
  },
  content: {
    flex: 1,
  },
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
