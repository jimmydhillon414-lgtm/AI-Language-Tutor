// src/navigation/AppNavigator.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from '../components/Navbar';
import LoginScreen from '../screens/LoginScreen';
import AuthScreen from '../screens/AuthScreen';

import HomeScreen from '../screens/HomeScreen';
import TutorChatScreen from '../screens/TutorChatScreen';
import GrammarHistoryScreen from '../screens/GrammarHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

export default function AppNavigator() {
  const [user, setUser] = useState({ email: 'Creatorstack9@gmail.com' });
  const [activeTab, setActiveTab] = useState('Home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleLogin = async (email, password) => {
    setUser({ email: email || 'Creatorstack9@gmail.com' });
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    setUser(null);
    setShowAuthModal(true);
    setAuthMode('login');
  };

  const renderContent = () => {
    if (showAuthModal || !user) {
      if (authMode === 'signup') {
        return (
          <AuthScreen 
            onAuthSuccess={handleLogin} 
            onSwitchToLogin={() => setAuthMode('login')} 
          />
        );
      }
      return (
        <LoginScreen 
          onLogin={handleLogin} 
          onSwitchToSignup={() => setAuthMode('signup')} 
        />
      );
    }

    switch (activeTab) {
      case 'Home':
        return <HomeScreen setActiveTab={setActiveTab} />;
      case 'AI Tutor':
        return <TutorChatScreen />;
      case 'Grammar History':
        return <GrammarHistoryScreen />;
      case 'Profile Settings':
        return <ProfileScreen />;
      default:
        return <HomeScreen setActiveTab={setActiveTab} />;
    }
  };

  return (
    <View style={styles.container}>
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSignOut={handleSignOut}
        onOpenLogin={() => {
          setAuthMode('login');
          setShowAuthModal(true);
        }}
        onOpenSignup={() => {
          setAuthMode('signup');
          setShowAuthModal(true);
        }}
      />
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
});
