import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from '../components/Navbar';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen'; // Similar to Login with theme
// Import other tabs like HomeScreen, AiTutorScreen, etc.

export default function AppNavigator() {
  const [user, setUser] = useState(null); // null means not logged in
  const [activeTab, setActiveTab] = useState('Home');

  const handleLogin = async (email, password) => {
    // Supabase auth login logic here
    setUser({ email });
    setActiveTab('AI Tutor');
  };

  const handleSignOut = () => {
    setUser(null);
    setActiveTab('Home');
  };

  const renderContent = () => {
    if (!user) {
      if (activeTab === 'Login') return <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setActiveTab('Signup')} />;
      if (activeTab === 'Signup') return <SignupScreen onSwitchToLogin={() => setActiveTab('Login')} />;
    }

    switch (activeTab) {
      case 'AI Tutor': return </* AiTutorComponent */ />;
      case 'Grammar History': return </* GrammarHistoryComponent */ />;
      case 'Profile Settings': return </* ProfileSettingsComponent */ />;
      default: return </* HomeComponent */ />;
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
