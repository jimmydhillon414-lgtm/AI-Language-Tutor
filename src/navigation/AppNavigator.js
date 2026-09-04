import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from '../components/Navbar';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

// Tere purane original screens yahan import ho rahe hain (agar folder ka naam alag ho toh path check kar lena)
import HomeScreen from '../screens/HomeScreen';
import AiTutorScreen from '../screens/AiTutorScreen';
import GrammarHistoryScreen from '../screens/GrammarHistoryScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';

export default function AppNavigator() {
  const [user, setUser] = useState(null); // null means not logged in
  const [activeTab, setActiveTab] = useState('Home');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  const handleLogin = async (email, password) => {
    // Yahan tera login successful hone ke baad user set hota hai
    setUser({ email });
    setActiveTab('AI Tutor'); // Login ke baad seedha AI Tutor page khulega
  };

  const handleSignOut = () => {
    setUser(null);
    setActiveTab('Home');
  };

  const renderContent = () => {
    // Agar user logged-in nahi hai, toh Login ya Signup page dikhega
    if (!user) {
      if (authMode === 'signup') {
        return <SignupScreen onSwitchToLogin={() => setAuthMode('login')} />;
      }
      return <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setAuthMode('signup')} />;
    }

    // Jab user logged-in hai, toh Navbar ke tabs ke hisaab se original screens khulenge
    switch (activeTab) {
      case 'Home':
        return <HomeScreen />;
      case 'AI Tutor':
        return <AiTutorScreen />;
      case 'Grammar History':
        return <GrammarHistoryScreen />;
      case 'Profile Settings':
        return <ProfileSettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <Navbar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
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
    backgroundColor: '#05070B',
  },
  content: {
    flex: 1,
  },
});
