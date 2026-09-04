import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from '../components/Navbar';
import LoginScreen from '../screens/LoginScreen';
import AuthScreen from '../screens/AuthScreen';

// Exact filenames from your screens folder
import HomeScreen from '../screens/HomeScreen';
import TutorChatScreen from '../screens/TutorChatScreen';
import GrammarHistoryScreen from '../screens/GrammarHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleLogin = async (email, password) => {
    setUser({ email });
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
        return <HomeScreen setActiveTab={setActiveTab} setShowAuthModal={setShowAuthModal} setAuthMode={setAuthMode} />;
      case 'AI Tutor':
        return <TutorChatScreen />;
      case 'Grammar History':
        return <GrammarHistoryScreen />;
      case 'Profile Settings':
        return <ProfileScreen />;
      default:
        return <HomeScreen setActiveTab={setActiveTab} setShowAuthModal={setShowAuthModal} setAuthMode={setAuthMode} />;
    }
  };

  return (
    <View style={styles.container}>
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setShowAuthModal(false);
          setActiveTab(tab);
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
    backgroundColor: '#05070B',
  },
  content: {
    flex: 1,
  },
});
