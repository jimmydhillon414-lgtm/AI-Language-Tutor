import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from '../components/Navbar';
import LoginScreen from '../screens/LoginScreen';
import AuthScreen from '../screens/AuthScreen';

// Exact screens
import HomeScreen from '../screens/HomeScreen';
import TutorChatScreen from '../screens/TutorChatScreen';
import GrammarHistoryScreen from '../screens/GrammarHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

export default function AppNavigator() {
  const [user, setUser] = useState(null); // Initially null, so Home opens first
  const [activeTab, setActiveTab] = useState('Home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleLogin = (email) => {
    setUser({ email: email || 'Creatorstack9@gmail.com' });
    setShowAuthModal(false);
    setActiveTab('Home'); // Once logged in, go to user's personal home
  };

  const handleSignOut = () => {
    setUser(null);
    setActiveTab('Home');
  };

  const renderContent = () => {
    // If login/signup modal is triggered
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

    // Render based on active tab
    switch (activeTab) {
      case 'Home':
        return <HomeScreen setActiveTab={setActiveTab} user={user} />;
      case 'AI Tutor':
        return <TutorChatScreen />;
      case 'Grammar History':
        return <GrammarHistoryScreen />;
      case 'Profile Settings':
        return <ProfileScreen user={user} onSignOut={handleSignOut} />;
      default:
        return <HomeScreen setActiveTab={setActiveTab} user={user} />;
    }
  };

  return (
    <View style={styles.container}>
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
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
