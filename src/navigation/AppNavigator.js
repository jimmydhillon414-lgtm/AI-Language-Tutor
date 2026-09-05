import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from '../components/Navbar';
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

  // const handleSignOut = () => {
  //   setUser(null);
  // };

  // const renderContent = () => {
  //   // If login or signup screen is active
  //   if (showAuthModal) {
  //     if (authMode === 'signup') {
  //       return (
  //         <AuthScreen 
  //           onAuthSuccess={handleLoginSuccess} 
  //           onSwitchToLogin={() => setAuthMode('login')} 
  //         />
  //       );
  //     }
  //     return (
  //       <LoginScreen 
  //         onLogin={handleLoginSuccess} 
  //         onSwitchToSignup={() => setAuthMode('signup')} 
  //       />
  //     );
  //   }

  //   // If user is NOT logged in, always show HomeScreen
  //   if (!user) {
  //     return (
  //       <HomeScreen 
  //         onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }} 
  //         onOpenSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }} 
  //       />
  //     );
  //   }

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
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }}
        onOpenSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }}
        onSignOut={handleSignOut}
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
