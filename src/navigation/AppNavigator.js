import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from '../components/Navbar';
import LoginScreen from '../screens/LoginScreen';
// Agar Signup screen alag file me hai toh import kar le, warna niche inline ya placeholder use kar sakte hain

export default function AppNavigator() {
  const [user, setUser] = useState(null); // null means not logged in
  const [activeTab, setActiveTab] = useState('Home');

  const handleLogin = async (email, password) => {
    // Yahan apna login logic daal
    setUser({ email });
    setActiveTab('AI Tutor');
  };

  const handleSignOut = () => {
    setUser(null);
    setActiveTab('Home');
  };

  const renderContent = () => {
    if (!user) {
      if (activeTab === 'Login' || activeTab === 'Signup') {
        return <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setActiveTab('Signup')} />;
      }
    }

    switch (activeTab) {
      case 'AI Tutor': 
        return <View style={styles.placeholderView} />; // Y apna <AiTutorScreen /> daal de
      case 'Grammar History': 
        return <View style={styles.placeholderView} />; // Y apna <GrammarHistoryScreen /> daal de
      case 'Profile Settings': 
        return <View style={styles.placeholderView} />; // Y apna <ProfileSettingsScreen /> daal de
      default: 
        return <View style={styles.placeholderView} />; // Y apna <HomeScreen /> daal de
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
  placeholderView: {
    flex: 1,
    backgroundColor: '#05070B',
  },
});
