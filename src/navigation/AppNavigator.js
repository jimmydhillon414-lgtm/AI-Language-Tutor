import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Navbar from '../components/Navbar';
import LoginScreen from '../screens/LoginScreen';
import AuthScreen from '../screens/AuthScreen';

// Screens
import HomeScreen from '../screens/HomeScreen';
import PricingScreen from '../screens/PricingScreen';
import RoadmapScreen from '../screens/RoadmapScreen';
import TutorChatScreen from '../screens/TutorChatScreen';
import GrammarHistoryScreen from '../screens/GrammarHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

export default function AppNavigator() {
  const [user, setUser] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('ai_tutor_user');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [currentStep, setCurrentStep] = useState('pricing');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const [activeTab, setActiveTab] = useState('AI Tutor');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleLoginSuccess = (email) => {
    const userData = { email: email || 'Creatorstack9@gmail.com' };
    setUser(userData);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.setItem('ai_tutor_user', JSON.stringify(userData));
    }
    setShowAuthModal(false);
    setCurrentStep('pricing');
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentStep('pricing');
    setSelectedPlan(null);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.removeItem('ai_tutor_user');
    }
  };

  const handleSelectPlan = (planName) => {
    setSelectedPlan(planName);
    setCurrentStep('roadmap');
  };

  const handleSelectDay = (dayNumber) => {
    setSelectedDay(dayNumber);
    setCurrentStep('chat');
    setActiveTab('AI Tutor');
  };

  const renderContent = () => {
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

    if (!user) {
      return (
        <HomeScreen 
          onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }} 
          onOpenSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }} 
        />
      );
    }

    if (currentStep === 'pricing') {
      return <PricingScreen onSelectPlan={handleSelectPlan} onSignOut={handleSignOut} />;
    }

    if (currentStep === 'roadmap') {
      return <RoadmapScreen onSelectDay={handleSelectDay} />;
    }

    switch (activeTab) {
      case 'AI Tutor':
        return <TutorChatScreen selectedDay={selectedDay} />;
      case 'Grammar History':
        return <GrammarHistoryScreen />;
      case 'Profile Settings':
        return <ProfileScreen user={user} selectedPlan={selectedPlan} />;
      default:
        return <TutorChatScreen selectedDay={selectedDay} />;
    }
  };

  // Navbar will show everywhere EXCEPT on the PricingScreen and Auth modals
  const showNavbar = !(user && currentStep === 'pricing' && !showAuthModal);

  return (
    <View style={styles.container}>
      {showNavbar && (
        <Navbar 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'AI Tutor') setCurrentStep('roadmap');
          }} 
          onOpenLogin={() => { setAuthMode('login'); setShowAuthModal(true); }}
          onOpenSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }}
          onSignOut={handleSignOut}
        />
      )}
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
