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
  const [user, setUser] = useState(null); // Default logged out so Login & Sign Up show
  const [activeTab, setActiveTab] = useState('Home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleLogin = async (email, password) => {
    setUser({ email: email || 'Creatorstack9@gmail.com' });
    setShowAuthModal(false);
    setActiveTab('AI Tutor');
  };

  const handleSignOut = () => {
    setUser(null);
    setActiveTab('Home');
  };

  const renderContent = () => {
    if (showAuthModal) {
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
        return <HomeScreen setActiveTab={(tab) => {
          if (tab === 'AI Tutor' && !user) {
            setAuthMode('login');
            setShowAuthModal(true);
          } else {
            setActiveTab(tab);
          }
        }} />;
      case 'AI Tutor':
        if (!user) return <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setAuthMode('signup')} />;
        return <TutorChatScreen />;
      case 'Grammar History':
        if (!user) return <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setAuthMode('signup')} />;
        return <GrammarHistoryScreen />;
      case 'Profile Settings':
        if (!user) return <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setAuthMode('signup')} />;
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
        setActiveTab={(tab) => {
          if ((tab === 'AI Tutor' || tab === 'Grammar History' || tab === 'Profile Settings') && !user) {
            setAuthMode('login');
            setShowAuthModal(true);
          } else {
            setShowAuthModal(false);
            setActiveTab(tab);
          }
        }} 
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
